import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
  })),
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

export async function POST(req: Request) {
  try {
    const { prompt, provider = "groq" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { text } = await generateText({
      model: getModel(provider),
      prompt: `Generate a detailed recipe based on the following input: "${prompt}".
      
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Recipe name",
  "description": "Short appetizing description",
  "ingredients": [{ "name": "ingredient", "quantity": "amount" }],
  "instructions": ["Step 1...", "Step 2..."],
  "cookingTime": 20,
  "prepTime": 10,
  "totalTime": 30,
  "servings": 4,
  "calories": 400,
  "difficultyLevel": "Easy",
  "cuisineType": "Italian",
  "temperature": "180°C",
  "tips": ["Tip 1", "Tip 2"]
}`,
    });

    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = recipeSchema.parse(JSON.parse(cleaned));

    // Save permanently to the database
    const savedRecipe = await prisma.recipe.create({
      data: {
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
          create: parsed.ingredients.map(ing => ({
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
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent(parsed.title + " delicious food photography realistic")}?width=800&height=800&nologo=true`,
            prompt: parsed.title
          }]
        }
      }
    });

    return NextResponse.json(savedRecipe);
  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}

