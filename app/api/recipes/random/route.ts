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

    const systemInstruction = `Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Recipe name",
  "description": "Short appetizing description",
  "imagePrompt": "Brief one-sentence visual description of the finished dish",
  "ingredients": [{ "name": "ingredient", "quantity": "amount with unit" }],
  "instructions": ["Step 1...", "Step 2..."],
  "cookingTime": 20,
  "prepTime": 10,
  "totalTime": 30,
  "servings": 4,
  "calories": 400,
  "difficultyLevel": "Easy", // MUST BE EXACTLY "Easy", "Medium", or "Hard" in English
  "cuisineType": "Global",
  "temperature": "180°C",
  "tips": ["Tip 1", "Tip 2"]
}`;

    const { text } = await generateText({
      model: getModel(provider),
      prompt: `You are an expert chef. Generate a completely random, highly creative, and mouth-watering recipe. Surprise me with something unique, perhaps a fusion dish or a forgotten classic!\n\n${systemInstruction}`,
    });

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = recipeSchema.parse(JSON.parse(cleaned));

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
  } catch (error) {
    console.error("Random recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate random recipe" },
      { status: 500 }
    );
  }
}
