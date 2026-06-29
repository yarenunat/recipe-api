import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "../generate/route";
import { auth } from "@/auth";
import { analyzeFoodVisuals, buildImageUrl } from "@/lib/food-visual-analyzer";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { ingredients, provider = "groq" } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Ingredients array is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "tr";
    const languageNames: Record<string, string> = {
      tr: "Turkish",
      en: "English",
      es: "Spanish",
      zh: "Chinese (Simplified)",
      hi: "Hindi",
    };
    const targetLanguage = languageNames[locale] || "Turkish";

    const systemInstruction = `You are a world-class professional chef. Create a delicious, creative recipe using primarily the given ingredients.

Return ONLY a raw valid JSON object (no markdown, no extra text):
{
  "title": "Dish name in ${targetLanguage}",
  "description": "2-3 sentence appetizing description in ${targetLanguage}",
  "imagePrompt": "English-only. Describe the final cooked dish visually: color, texture, plating. No logos or text.",
  "ingredients": [{ "name": "ingredient in ${targetLanguage}", "quantity": "exact amount with unit" }],
  "instructions": ["Step 1: Short single action.", "Step 2: Another action.", "...10-20 steps"],
  "cookingTime": 25,
  "prepTime": 15,
  "totalTime": 40,
  "servings": 4,
  "calories": 350,
  "difficultyLevel": "Easy",
  "cuisineType": "Cuisine type in ${targetLanguage}",
  "temperature": "180°C",
  "tips": ["Tip 1 in ${targetLanguage}", "Tip 2 in ${targetLanguage}"]
}

RULES:
1. Use primarily the listed ingredients. You may add basic staples (salt, pepper, oil, water).
2. Each instruction step = ONE single action. Use 10-20 short steps.
3. difficultyLevel MUST be exactly "Easy", "Medium", or "Hard" (English).
4. ALL fields except difficultyLevel and imagePrompt MUST be in ${targetLanguage}.
5. Output PURE JSON only. No markdown.`;

    const { text } = await generateText({
      model: getModel(provider),
      prompt: `The user has: ${ingredients.join(", ")}.\n\n${systemInstruction}`,
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
                create: { name: ing.name.toLowerCase().trim() }
              }
            }
          }))
        },
        images: {
          create: [{
            url: imageUrl,
            prompt: visualAnalysis.food_photography_prompt,
          }]
        }
      }
    });

    return NextResponse.json(savedRecipe);
  } catch (error) {
    console.error("Pantry generation error:", error);
    return NextResponse.json({ error: "Failed to generate pantry recipe" }, { status: 500 });
  }
}
