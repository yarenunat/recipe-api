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

  // Only use the first 6 steps so the prompt doesn't blow up
  const instructionText = recipe.instructions.slice(0, 6).join(" → ");

  const analysisPrompt = `You are a professional food photographer and culinary expert specialising in Turkish and world cuisines.

Your task: Analyse the recipe below and generate a PRECISE visual description of what the FINAL COOKED DISH looks like — NOT based on its name alone, but from its ingredients and preparation method.

══════════════════════════════════════════════
RECIPE DATA
══════════════════════════════════════════════
Title        : ${recipe.title}
Description  : ${recipe.description || "(none)"}
Cuisine      : ${recipe.cuisineType || "Unknown"}
Ingredients  : ${ingredientList}
Instructions : ${instructionText}
Temperature  : ${recipe.temperature || "N/A"}
Cook time    : ${recipe.cookingTime ? `${recipe.cookingTime} min` : "N/A"}
══════════════════════════════════════════════

══════════════════════════════════════════════
CRITICAL RULES
══════════════════════════════════════════════
1. NEVER base the visual on the title alone.
2. Ingredients + instructions OVERRIDE the title if they conflict.
3. For mixed/scrambled dishes (menemen, sucuklu yumurta, kavurma):
   — Explicitly state that ingredients are cooked TOGETHER, not separate.
   — e.g. "sucuk slices embedded INTO the egg, cooked together in one pan"
4. For Turkish dishes, use authentic traditional presentation.
5. Describe exact COLORS, TEXTURES, SHAPES, and HOW ingredients relate to each other.

══════════════════════════════════════════════
CONFIDENCE RULES
══════════════════════════════════════════════
90-100 : Very certain — clear ingredient list + instructions
70-89  : Mostly confident — minor ambiguity
50-69  : Moderately confident — recipe is vague
< 50   : Low confidence — title and ingredients conflict heavily

══════════════════════════════════════════════
TURKISH DISH REFERENCE (use when applicable)
══════════════════════════════════════════════
Sucuklu Yumurta : round sucuk slices EMBEDDED INTO set egg white and runny yolk in a cast-iron pan, orange oil pooling from sausage fat
Menemen         : scrambled tomatoes + green peppers + egg all mixed together into one wet scramble in a copper pan
Lahmacun        : ultra-thin crispy flatbread topped with minced beef+lamb, parsley, red onion — NOT pizza
Su Böreği       : golden layered phyllo pastry squares with white cheese filling, slightly crispy top
Gözleme         : thin hand-rolled flatbread folded and grilled on a sac, visible filling (cheese/spinach/meat)
Pide            : oval boat-shaped baked flatbread with raised edges, topping in center
Kebap/Şiş       : char-grilled skewered meat with visible grill marks, served with bread or rice
Karnıyarık      : split roasted eggplant stuffed with minced meat filling, tomato sauce on top
İskender        : thinly sliced doner over pita bread, topped with tomato sauce and yogurt poured at table
Mantı           : tiny filled dumplings in a bowl, topped with garlic yogurt and paprika butter
Çorba/Soup      : liquid soup with visible chunky ingredients floating, served in ceramic bowl

══════════════════════════════════════════════
OUTPUT FORMAT (return ONLY this JSON, no markdown)
══════════════════════════════════════════════
{
  "dish_name": "Precise English name of what the final dish actually is",
  "visual_description": "2-3 sentence detailed description of exact visual appearance: colors, textures, how ingredients relate, pan/plate context",
  "main_visible_ingredients": ["describe each ingredient exactly as it appears in the finished dish"],
  "plating_style": "How it is served: pan, plate, bowl, wooden board, copper dish, etc. and arrangement",
  "food_photography_prompt": "Complete ultra-detailed photography prompt. Describe the EXACT finished dish appearance. Textures, colors, composition. Cultural authenticity. How ingredients are arranged or mixed. Never use vague terms.",
  "visualConfidenceScore": 85
}`;

  try {
    const result = await generateText({
      model: getModel(provider),
      prompt: analysisPrompt,
    });

    const cleaned = result.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const analysis: FoodVisualAnalysis = JSON.parse(cleaned);

    // Validate score is a number
    if (typeof analysis.visualConfidenceScore !== "number") {
      analysis.visualConfidenceScore = 75;
    }

    return analysis;
  } catch (err) {
    console.error("Food visual analysis failed, using fallback:", err);
    return buildFallbackAnalysis(recipe);
  }
}

/* ─────────────────────────────────────────────
   Fallback (no LLM call, pure ingredient logic)
───────────────────────────────────────────── */

function buildFallbackAnalysis(recipe: RecipeInput): FoodVisualAnalysis {
  const ingNames = recipe.ingredients.map((i) => i.name.toLowerCase());
  const visibleIngs = recipe.ingredients.slice(0, 6).map((i) => `${i.quantity} ${i.name}`);

  return {
    dish_name: recipe.title,
    visual_description: `A ${recipe.cuisineType || "homemade"} dish featuring ${ingNames.slice(0, 3).join(", ")}, cooked and plated in traditional style.`,
    main_visible_ingredients: visibleIngs,
    plating_style: "Served on a white ceramic plate with restaurant-style presentation",
    food_photography_prompt: `Close-up of ${recipe.title}. Visible ingredients: ${ingNames.slice(0, 6).join(", ")}. ${recipe.cuisineType ? `${recipe.cuisineType} cuisine.` : ""} Authentic presentation, natural lighting, appetizing, 8K detail.`,
    visualConfidenceScore: 45,
  };
}

/* ─────────────────────────────────────────────
   Image URL Builder
───────────────────────────────────────────── */

export function buildImageUrl(analysis: FoodVisualAnalysis): string {
  const {
    dish_name,
    visual_description,
    main_visible_ingredients,
    plating_style,
    food_photography_prompt,
    visualConfidenceScore,
  } = analysis;

  let finalPrompt: string;

  if (visualConfidenceScore >= 70) {
    // Full structured prompt — high confidence
    finalPrompt = `Professional food photography.

Dish: ${dish_name}

Visual appearance:
${visual_description}

Visible ingredients on plate:
${main_visible_ingredients.join(", ")}

Serving style:
${plating_style}

Photography details:
${food_photography_prompt}

Natural lighting. Highly realistic. Restaurant quality. Top-down or 45-degree angle. High detail textures. Authentic cultural presentation. No text. No watermark. No logo.`;
  } else {
    // Low confidence — ignore title completely, describe only from ingredients
    finalPrompt = `Professional food photography. Do NOT interpret this as any specific named dish.

Ingredients visible in the dish:
${main_visible_ingredients.join(", ")}

${food_photography_prompt}

Natural lighting. Highly realistic. Restaurant quality. Top-down or 45-degree angle. High detail textures. No text. No watermark. No logo.`;
  }

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=800&nologo=true&model=flux`;
}
