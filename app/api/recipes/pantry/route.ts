import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "../generate/route";
import { auth } from "@/auth";

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

    const systemInstruction = `Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Recipe name in ${targetLanguage}",
  "description": "Short appetizing description in ${targetLanguage}",
  "imagePrompt": "A highly detailed English visual description of the FINISHED dish for an AI image generator. CRITICAL INSTRUCTIONS: 1. DO NOT rely on foreign food names alone. You MUST describe their exact physical geometry and texture in English. 2. Never describe raw ingredients. Describe exact shape, texture, crispiness, and plating.",
  "ingredients": [{ "name": "ingredient in ${targetLanguage}", "quantity": "amount/quantity in ${targetLanguage}" }],
  "instructions": ["Step 1 in ${targetLanguage}...", "Step 2 in ${targetLanguage}..."],
  "cookingTime": 20,
  "prepTime": 10,
  "totalTime": 30,
  "servings": 4,
  "calories": 400,
  "difficultyLevel": "Difficulty level in ${targetLanguage}",
  "cuisineType": "Cuisine type in ${targetLanguage}",
  "temperature": "Cooking temperature (e.g., 180°C)",
  "tips": ["Tip 1 in ${targetLanguage}", "Tip 2 in ${targetLanguage}"]
}

CRITICAL: All user-visible text (title, description, ingredients name & quantity, instructions, difficultyLevel, cuisineType, tips) MUST be written in ${targetLanguage}. Do not output any language other than ${targetLanguage} for these fields. The imagePrompt field MUST remain in English.`;

    const { text } = await generateText({
      model: getModel(provider),
      prompt: `You are an expert chef. The user has the following ingredients in their pantry: ${ingredients.join(", ")}. 
Create a delicious, creative recipe that PRIMARY uses these ingredients. You may include basic pantry staples (salt, pepper, oil, water, basic spices) but DO NOT add major new ingredients (like meat or vegetables) that the user didn't list.

${systemInstruction}`
    });

    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = recipeSchema.parse(JSON.parse(cleaned));

    // Wait, the client can just use the returned object and then save it, but we can also save it here directly.
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
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent("professional cinematic food photography. " + (parsed.imagePrompt || parsed.title) + ", 4k resolution, highly detailed, realistic, appetizing, culinary magazine style, perfectly plated, natural lighting")}?width=800&height=800&nologo=true`,
            prompt: parsed.imagePrompt || parsed.title
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
