import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as cheerio from "cheerio";
import { analyzeFoodVisuals, buildImageUrl } from "@/lib/food-visual-analyzer";

/* ─── Schema ─────────────────────────────────────────────── */

export const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  imagePrompt: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
  instructions: z.array(z.string()),
  cookingTime: z.number().optional(),
  prepTime: z.number().optional(),
  totalTime: z.number().optional(),
  servings: z.number().optional(),
  calories: z.number().optional(),
  difficultyLevel: z.enum(["Easy", "Medium", "Hard"]).optional(),
  cuisineType: z.string().optional(),
  temperature: z.string().optional(),
  ovenTemp: z.string().optional(),
  tips: z.array(z.string()).optional(),
});

/* ─── POST /api/recipes/generate ─────────────────────────── */

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { prompt, provider = "groq" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    /* ── Step 1: Resolve prompt (URL / social media / plain text) ── */

    let llmInput = prompt;
    let sourceImageUrl: string | null = null;

    const trimmedUrl = prompt.trim();
    const isUrl =
      trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");

    const socialMediaDomains = [
      "instagram.com",
      "tiktok.com",
      "twitter.com",
      "x.com",
      "facebook.com",
    ];

    let isSocialMedia = false;
    if (isUrl) {
      try {
        const urlObj = new URL(trimmedUrl);
        isSocialMedia = socialMediaDomains.some(
          (d) => urlObj.hostname === d || urlObj.hostname.endsWith(`.${d}`)
        );
      } catch {}
    }

    if (isUrl) {
      // Social media: use bot User-Agents that receive OG tags (including captions)
      const userAgents = isSocialMedia
        ? [
            "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
            "Googlebot/2.1 (+http://www.google.com/bot.html)",
            "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)",
          ]
        : ["Mozilla/5.0 (compatible; RecipeBot/1.0)"];

      let scraped = false;

      for (const ua of userAgents) {
        try {
          const response = await fetch(trimmedUrl, {
            headers: { "User-Agent": ua },
          });
          const html = await response.text();
          const $ = cheerio.load(html);

          const ogImage =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content");

          if (ogImage) {
            sourceImageUrl = ogImage.startsWith("http")
              ? ogImage
              : new URL(ogImage, new URL(trimmedUrl).origin).href;
          }

          const ogDescription =
            $('meta[property="og:description"]').attr("content") || "";
          const ogTitle = $('meta[property="og:title"]').attr("content") || "";

          let textContent = "";
          if (isSocialMedia) {
            textContent = [ogTitle, ogDescription].filter(Boolean).join("\n").trim();
          } else {
            $("script, style, noscript, iframe, img, svg").remove();
            textContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
          }

          if (textContent.length > 50) {
            llmInput = `Generate a detailed recipe based on the following content from a social media post or website. Extract ingredients and steps if explicitly mentioned, otherwise create an authentic recipe for the dish described.\n\nContent: ${textContent}`;
            scraped = true;
            break;
          }
        } catch (err) {
          console.error(`Fetch failed with User-Agent ${ua}:`, err);
        }
      }

      if (!scraped) {
        try {
          const urlObj = new URL(trimmedUrl);
          const pathParts = urlObj.pathname.split("/").filter(Boolean);
          const username = pathParts[0]?.replace("@", "");
          llmInput = `Generate a popular, authentic, delicious recipe that would be shared by the food account "@${username}". If the username contains Turkish food words, generate a traditional Turkish recipe. Make it complete with proper quantities and detailed steps.`;
        } catch {
          llmInput = prompt;
        }
      }
    }

    /* ── Step 2: Generate structured recipe JSON ── */

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "tr";
    const localeToLanguage: Record<string, string> = {
      en: "English",
      tr: "Turkish",
      zh: "Mandarin Chinese",
      hi: "Hindi",
      es: "Spanish"
    };
    const targetLanguage = localeToLanguage[locale] || "Turkish";

    const systemInstruction = `Return ONLY a valid JSON object with this exact structure (no markdown, no extra text). Keep all text concise to avoid truncation:
{
  "title": "Recipe name (in ${targetLanguage})",
  "description": "Short appetizing description (max 2 sentences, in ${targetLanguage})",
  "imagePrompt": "Brief one-sentence visual description of the finished dish (in English, for the image generator)",
  "ingredients": [{ "name": "ingredient (in ${targetLanguage})", "quantity": "amount with unit (in ${targetLanguage})" }],
  "instructions": ["Step 1... (in ${targetLanguage})", "Step 2... (in ${targetLanguage})"],
  "cookingTime": 20,
  "prepTime": 10,
  "totalTime": 30,
  "servings": 4,
  "calories": 400,
  "difficultyLevel": "Easy", // MUST BE EXACTLY "Easy", "Medium", or "Hard" in English
  "cuisineType": "Turkish",
  "temperature": "180°C",
  "tips": ["Tip 1", "Tip 2"]
}
CRITICAL: ALL text values except difficultyLevel and imagePrompt MUST be in ${targetLanguage}!`;

    let messages: any[] = [];
    if (sourceImageUrl) {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a detailed recipe based on the following input: "${llmInput}".\n\n${systemInstruction}`,
            },
            { type: "image", image: new URL(sourceImageUrl) },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: "user",
          content: `Generate a detailed recipe based on the following input: "${llmInput}".\n\n${systemInstruction}`,
        },
      ];
    }

    let text = "";
    try {
      const result = await generateText({
        model: getModel(sourceImageUrl ? "vision" : provider),
        messages,
        maxOutputTokens: 4000,
      });
      text = result.text;
    } catch (err) {
      console.error("Vision generation failed, falling back to text-only:", err);
      const fallbackResult = await generateText({
        model: getModel(provider),
        prompt: `Generate a detailed recipe based on the following input: "${llmInput}".\n\n${systemInstruction}`,
        maxOutputTokens: 4000,
      });
      text = fallbackResult.text;
    }

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed;
    try {
      parsed = recipeSchema.parse(JSON.parse(cleaned));
    } catch (parseError: any) {
      console.error("Failed to parse JSON. Raw text:", text);
      throw new Error(`JSON Parse Error: ${parseError.message}. Raw Output: ${text.slice(0, 100)}...`);
    }

    /* ── Step 3: Food Visual Analyzer ── */
    // Analyze the FULL recipe (not just title) to build a precise image prompt

    const visualAnalysis = await analyzeFoodVisuals(
      {
        title: parsed.title,
        description: parsed.description,
        ingredients: parsed.ingredients,
        instructions: parsed.instructions,
        cuisineType: parsed.cuisineType,
        temperature: parsed.temperature,
        cookingTime: parsed.cookingTime,
        prepTime: parsed.prepTime,
      },
      provider
    );

    console.log(
      `[Visual Analyzer] confidence=${visualAnalysis.visualConfidenceScore} dish="${visualAnalysis.dish_name}"`
    );

    const imageUrl = buildImageUrl(visualAnalysis);

    /* ── Step 4: Persist to database ── */

    const savedRecipe = await prisma.recipe.create({
      data: {
        userId: session?.user?.id || null,
        title: parsed.title,
        description: parsed.description,
        instructions: JSON.stringify(parsed.instructions),
        cookingTime: parsed.cookingTime,
        prepTime: parsed.prepTime,
        totalTime: parsed.totalTime,
        servings: parsed.servings,
        calories: parsed.calories,
        difficultyLevel: parsed.difficultyLevel,
        cuisineType: parsed.cuisineType,
        temperature: parsed.temperature,
        tips: parsed.tips ? JSON.stringify(parsed.tips) : null,
        ingredients: {
          create: parsed.ingredients.map((ing) => ({
            quantity: ing.quantity,
            ingredient: {
              connectOrCreate: {
                where: { name: ing.name.toLowerCase().trim() },
                create: { name: ing.name.toLowerCase().trim() },
              },
            },
          })),
        },
        images: {
          create: [
            {
              url: imageUrl,
              prompt: visualAnalysis.food_photography_prompt,
            },
          ],
        },
      },
    });

    return NextResponse.json(savedRecipe);
  } catch (error: any) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe", details: error?.message || String(error), stack: error?.stack },
      { status: 500 }
    );
  }
}
