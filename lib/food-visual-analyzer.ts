import { generateText } from "ai";
import { getModel, type AIProvider } from "@/lib/ai";

/* ─────────────────────────────────────────────
   Input & Output Types
───────────────────────────────────────────── */

export interface RecipeInput {
  title: string;
  description?: string | null;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  cuisineType?: string | null;
  temperature?: string | null;
  cookingTime?: number | null;
  prepTime?: number | null;
}

export interface FoodVisualAnalysis {
  dish_name: string;
  visual_description: string;
  main_visible_ingredients: string[];
  plating_style: string;
  food_photography_prompt: string;
  visualConfidenceScore: number; // 0-100
}

/* ─────────────────────────────────────────────
   Core Analyzer  (uses LLM to reason visually)
───────────────────────────────────────────── */

export async function analyzeFoodVisuals(
  recipe: RecipeInput,
  provider: AIProvider = "groq"
): Promise<FoodVisualAnalysis> {
  const ingredientList = recipe.ingredients
    .map((i) => `${i.quantity} ${i.name}`)
    .join(", ");

  const analysisPrompt = `You are a professional food photographer. Write a single, highly detailed English prompt for an AI image generator (like Midjourney/Flux) to create a photorealistic, mouth-watering image of this exact dish.

Recipe: ${recipe.title}
Ingredients: ${ingredientList}

RULES:
1. Describe the final cooked dish in extreme detail (colors, textures, plating).
2. If it is a known cultural dish, rely on your knowledge of how it TRULY looks.
3. Keep it under 60 words. No key-value pairs, just a descriptive paragraph.
4. Add "Professional food photography, 8k resolution, natural lighting, highly realistic." at the end.
5. NEVER mention logos, text, or brands.

Return ONLY a JSON object with this exact structure:
{
  "food_photography_prompt": "your dense descriptive prompt here"
}`;

  try {
    const result = await generateText({
      model: getModel(provider),
      prompt: analysisPrompt,
      maxOutputTokens: 300,
    });

    const match = result.text.match(/\{[\s\S]*\}/);
    const cleaned = match ? match[0] : result.text;
    const json = JSON.parse(cleaned);

    return {
      dish_name: recipe.title,
      visual_description: "",
      main_visible_ingredients: [],
      plating_style: "",
      food_photography_prompt: json.food_photography_prompt,
      visualConfidenceScore: 100,
    };
  } catch (err) {
    console.error("Food visual analysis failed:", err);
    return buildFallbackAnalysis(recipe);
  }
}

/* ─────────────────────────────────────────────
   Fallback (no LLM call, pure ingredient logic)
───────────────────────────────────────────── */

function buildFallbackAnalysis(recipe: RecipeInput): FoodVisualAnalysis {
  return {
    dish_name: recipe.title,
    visual_description: "",
    main_visible_ingredients: [],
    plating_style: "",
    food_photography_prompt: `Professional food photography of a dish called ${recipe.title}, featuring ${recipe.ingredients.slice(0, 3).map(i => i.name).join(", ")}. Authentic presentation, natural lighting, highly realistic, 8k resolution.`,
    visualConfidenceScore: 45,
  };
}

/* ─────────────────────────────────────────────
   Image URL Builder
───────────────────────────────────────────── */

export function buildImageUrl(analysis: FoodVisualAnalysis): string {
  const finalPrompt = analysis.food_photography_prompt + " NO TEXT, NO LOGOS, NO WATERMARKS.";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=800&nologo=true&model=flux&seed=${Math.floor(Math.random() * 99999)}`;
}
