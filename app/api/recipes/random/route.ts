import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel, type AIProvider } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { recipeSchema } from "../generate/route";
import { analyzeFoodVisuals, buildImageUrl } from "@/lib/food-visual-analyzer";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const provider = (searchParams.get("provider") || "groq") as AIProvider;
    const cuisine = searchParams.get("cuisine");
    const locale = searchParams.get("locale") || "tr";

    const localeToLanguage: Record<string, string> = {
      en: "English",
      tr: "Turkish",
      zh: "Mandarin Chinese",
      hi: "Hindi",
      es: "Spanish"
    };
    const targetLanguage = localeToLanguage[locale] || "Turkish";

    const systemInstruction = `Return ONLY a raw valid JSON object (no markdown, no extra text):
{
  "title": "Recipe name in ${targetLanguage}",
  "description": "2-3 sentence appetizing description in ${targetLanguage}",
  "imagePrompt": "English-only. Describe the finished dish visually: color, texture, plating. No logos or text.",
  "ingredients": [{ "name": "ingredient in ${targetLanguage}", "quantity": "exact amount with unit" }],
  "instructions": ["Step 1: Short single action.", "Step 2: Another action.", "...10-20 steps"],
  "cookingTime": 25,
  "prepTime": 15,
  "totalTime": 40,
  "servings": 4,
  "calories": 350,
  "difficultyLevel": "Easy",
  "cuisineType": "${cuisine ? cuisine : "Global"}",
  "temperature": "180°C",
  "tips": ["Tip 1", "Tip 2"]
}
RULES:
1. Each instruction step = ONE single action. Use 10-20 short steps.
2. difficultyLevel MUST be exactly "Easy", "Medium", or "Hard" (English).
3. ALL fields except difficultyLevel and imagePrompt MUST be in ${targetLanguage}.
4. Output PURE JSON only. No markdown.`;

    const promptText = cuisine
      ? `You are an expert chef. Generate a creative, authentic ${cuisine} recipe.\n\n${systemInstruction}`
      : `You are an expert chef. Generate a completely random, creative recipe. Surprise me!\n\n${systemInstruction}`;

    const { text } = await generateText({
      model: getModel(provider),
      prompt: promptText,
      maxOutputTokens: 3000,
    });

    // ── Robust JSON repair for truncated/malformed AI output ──
    function repairJson(raw: string): string {
      let s = raw.trim();
      s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const objMatch = s.match(/\{[\s\S]*\}/);
      if (objMatch) s = objMatch[0];
      try { JSON.parse(s); return s; } catch {}
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
      if (inString) s += '"';
      s = s.replace(/,\s*$/, '');
      while (brackets > 0) { s += ']'; brackets--; }
      while (braces > 0) { s += '}'; braces--; }
      return s;
    }

    const repaired = repairJson(text);
    const rawJson = JSON.parse(repaired);

    // Sanitize numeric fields
    const numericFields = ["cookingTime", "prepTime", "totalTime", "servings", "calories"] as const;
    for (const field of numericFields) {
      const val = rawJson[field];
      if (val !== undefined && val !== null) {
        const n = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
        rawJson[field] = isNaN(n) ? undefined : n;
      }
    }

    const parsed = recipeSchema.parse(rawJson);

    // Use the Food Visual Analyzer for accurate image generation
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

    const imageUrl = buildImageUrl(visualAnalysis);

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
  } catch (error) {
    console.error("Random recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate random recipe" },
      { status: 500 }
    );
  }
}
