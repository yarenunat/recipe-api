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
  imageUrl: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
  instructions: z.array(z.string()),
  cookingTime: z.coerce.number().optional(),
  prepTime: z.coerce.number().optional(),
  totalTime: z.coerce.number().optional(),
  servings: z.coerce.number().optional(),
  calories: z.coerce.number().optional(),
  difficultyLevel: z.preprocess((val) => {
    if (typeof val !== "string") return "Easy";
    const map: Record<string, string> = {
      "kolay": "Easy", "orta": "Medium", "zor": "Hard",
      "fácil": "Easy", "medio": "Medium", "difícil": "Hard",
      "easy": "Easy", "medium": "Medium", "hard": "Hard",
    };
    return map[val.toLowerCase()] || "Easy";
  }, z.enum(["Easy", "Medium", "Hard"])).optional(),
  cuisineType: z.string().optional(),
  temperature: z.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    return String(val);
  }, z.string().optional()),
  ovenTemp: z.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    return String(val);
  }, z.string().optional()),
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
      let scraped = false;

      try {
        const mlRes = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(trimmedUrl)}`);
        const mlData = await mlRes.json();
        
        if (mlData.status === 'success' && mlData.data) {
          const title = mlData.data.title || '';
          const desc = mlData.data.description || '';
          const imageUrl = mlData.data.image?.url || '';
          
          if (imageUrl) {
            sourceImageUrl = imageUrl;
          }
          
          let textContent = `Başlık: ${title}\nİçerik/Açıklama: ${desc}`;
          
          // If it's a blog (not social media), we can also try to fetch the raw text content
          // but Microlink's title/desc is usually enough for recipes.
          if (!isSocialMedia && !desc && !title) {
             const response = await fetch(trimmedUrl);
             const html = await response.text();
             const $ = cheerio.load(html);
             $("script, style, noscript, iframe, img, svg").remove();
             textContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
          }

          if (textContent.length > 10) {
            llmInput = `Generate a detailed recipe based on the following content from a social media post or website. Extract ingredients and steps if explicitly mentioned, otherwise create an authentic recipe for the dish described.\n\nContent: ${textContent}`;
            scraped = true;
          }
        }
      } catch (err) {
        console.error("Microlink scraping error:", err);
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

    const systemInstruction = `You are a world-class professional chef and culinary writer. Your task is to generate a PERFECT, AUTHENTIC recipe in ${targetLanguage}.

Return ONLY a raw valid JSON object (no markdown code blocks, no extra text, no explanation). Use this exact structure:
{
  "title": "Exact dish name in ${targetLanguage}",
  "description": "2-3 sentence appetizing description highlighting flavor, texture, and cultural significance. (in ${targetLanguage})",
  "imagePrompt": "English-only. Describe ONLY the final cooked dish's visual appearance: its color, texture, plating style, and key visible ingredients. NEVER mention logos, text, or branding.",
  "ingredients": [
    { "name": "ingredient name", "quantity": "exact realistic amount with unit" }
  ],
  "instructions": [
    "Step 1: One single short action. (e.g. Dice 1 onion into 0.5cm cubes.)",
    "Step 2: Another single short action. (e.g. Heat 2 tbsp olive oil in a pan over medium heat.)",
    "...use 10 to 20 steps total, each covering ONLY ONE action"
  ],
  "cookingTime": 25,
  "prepTime": 15,
  "totalTime": 40,
  "servings": 4,
  "calories": 350,
  "difficultyLevel": "Easy",
  "cuisineType": "Turkish",
  "temperature": "180°C",
  "tips": ["One practical culinary tip.", "Another useful tip."]
}

══════════ ABSOLUTE RULES ══════════
1. INGREDIENTS must be REALISTIC and COMPLETE. Include every ingredient actually needed. Use proper quantities (e.g. "2 adet soğan", "1 çay kaşığı tuz"). No vague amounts.
2. INSTRUCTIONS: Each step = ONE single physical action. NEVER merge boiling + draining + frying into one step. Use 10-20 separate short steps.
3. EACH instruction step should be 1-2 short sentences max. Include a sensory cue (color, smell, texture) where natural.
4. imagePrompt must describe the FINISHED DISH ONLY, based on how it would look from its ingredients and cooking method. Must be in English.
5. difficultyLevel MUST be exactly "Easy", "Medium", or "Hard" (English only).
6. ALL fields except difficultyLevel and imagePrompt MUST be in ${targetLanguage}.
7. Output PURE JSON only. Do NOT wrap in markdown. Do NOT use unescaped double quotes inside string values.
══════════════════════════════════`;


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
        maxOutputTokens: 3000,
      });
      text = result.text;
    } catch (err) {
      console.error("Vision generation failed, falling back to text-only:", err);
      const fallbackResult = await generateText({
        model: getModel(provider),
        prompt: `Generate a detailed recipe based on the following input: "${llmInput}".\n\n${systemInstruction}`,
        maxOutputTokens: 3000,
      });
      text = fallbackResult.text;
    }

    // ── Robust JSON repair for truncated/malformed AI output ──
    function repairJson(raw: string): string {
      let s = raw.trim();
      // Remove markdown fences
      s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      // Extract JSON object if surrounded by extra text
      const objMatch = s.match(/\{[\s\S]*\}/);
      if (objMatch) s = objMatch[0];

      // If JSON is complete, return as-is
      try { JSON.parse(s); return s; } catch {}

      // Count open/close brackets to detect truncation
      let braces = 0, brackets = 0, inString = false, escaped = false;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (c === '{') braces++;
        if (c === '}') braces--;
        if (c === '[') brackets++;
        if (c === ']') brackets--;
      }

      // If we're truncated inside a string, close the string
      if (inString) {
        s += '"';
      }

      // Remove trailing comma
      s = s.replace(/,\s*$/, '');

      // Close any open brackets/braces
      while (brackets > 0) { s += ']'; brackets--; }
      while (braces > 0) { s += '}'; braces--; }

      return s;
    }

    function sanitizeNumericFields(obj: any) {
      const fields = ["cookingTime", "prepTime", "totalTime", "servings", "calories"];
      for (const field of fields) {
        const val = obj[field];
        if (val !== undefined && val !== null) {
          const n = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
          obj[field] = isNaN(n) ? undefined : n;
        }
      }
      return obj;
    }

    let parsed;
    try {
      const repaired = repairJson(text);
      const rawJson = sanitizeNumericFields(JSON.parse(repaired));
      parsed = recipeSchema.parse(rawJson);
    } catch (parseError: any) {
      console.error("Failed to parse JSON. Raw text:", text.slice(0, 500));
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

    // Eğer URL'den (Instagram vs) kazınmış gerçek bir fotoğraf varsa onu kullan.
    // Yoksa yapay zeka ile profesyonel bir fotoğraf üret.
    const imageUrl = sourceImageUrl || buildImageUrl(visualAnalysis);

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
          create: Array.from(new Map(parsed.ingredients.map(ing => [ing.name.toLowerCase().trim(), ing])).values()).map((ing: any) => ({
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
