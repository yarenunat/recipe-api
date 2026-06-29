import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipe, instructions, tipsArray, targetLanguage } = body;

    if (!recipe || !targetLanguage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `You are a professional chef and translator. Translate the following recipe into ${targetLanguage}.
If the recipe is already written in ${targetLanguage}, return the values exactly as they are without modifying them.
Do not translate the image prompts, links, or URLs.
Return ONLY a valid JSON object with the exact structure below (no markdown, no extra text):
{
  "title": "Translated title",
  "description": "Translated description",
  "difficultyLevel": "Translated difficulty level (e.g. Easy, Medium, Hard)",
  "cuisineType": "Translated cuisine type",
  "instructions": [
    "Step 1...",
    "Step 2..."
  ],
  "ingredients": [
    { "name": "Translated ingredient name", "quantity": "Translated quantity/amount" }
  ],
  "tips": [
    "Tip 1...",
    "Tip 2..."
  ]
}

Recipe to translate:
Title: ${recipe.title}
Description: ${recipe.description || ""}
Difficulty: ${recipe.difficultyLevel || ""}
Cuisine: ${recipe.cuisineType || ""}
Instructions: ${JSON.stringify(instructions)}
Ingredients:
${recipe.ingredients.map((ing: any) => `- ${ing.ingredient.name}: ${ing.quantity || ""}`).join("\n")}
Tips: ${JSON.stringify(tipsArray)}
`;

    const { text } = await generateText({
      model: getModel("groq"),
      prompt,
    });

    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Recipe translation API error:", error);
    return NextResponse.json({ error: "Failed to translate recipe" }, { status: 500 });
  }
}
