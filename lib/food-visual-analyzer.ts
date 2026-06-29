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

  const analysisPrompt = `You are a professional food photographer, Michelin-star chef, and culinary visual specialist.

Your task: Analyze the recipe data below and produce a HYPER-ACCURATE visual analysis of what the FINISHED, COOKED dish looks like.
Base your analysis primarily on the INGREDIENTS and COOKING METHOD — NOT the dish name alone.

════════════ RECIPE DATA ════════════
Title        : ${recipe.title}
Description  : ${recipe.description || "(none)"}
Cuisine      : ${recipe.cuisineType || "Unknown"}
Ingredients  : ${ingredientList}
Key Steps    : ${instructionText}
Temperature  : ${recipe.temperature || "N/A"}
Cook time    : ${recipe.cookingTime ? `${recipe.cookingTime} min` : "N/A"}
═════════════════════════════════════

════════════ VISUAL ANALYSIS RULES ════════════
1. Describe the FINAL COOKED DISH appearance only — not raw ingredients.
2. Ingredients + cooking steps OVERRIDE the title if they conflict.
3. Specify exact COLORS (e.g. "deep amber", "golden-brown crust", "pale green"), TEXTURES (e.g. "crispy edges", "glossy sauce", "fluffy interior"), and SHAPE/FORM.
4. Describe how ingredients relate to each other (e.g. "sucuk slices embedded in egg", "vegetables mixed throughout").
5. Specify the exact VESSEL/PLATING (e.g. cast-iron pan, copper pan, white ceramic plate, wooden board, bowl).
6. For Turkish dishes: use authentic traditional presentation.
7. The food_photography_prompt must be DENSE and SCENE-LEVEL: describe the dish foreground, background surface, lighting angle, and atmosphere.
8. NEVER mention brand names, logos, text labels, bottles with labels, or any packaging.
9. NEVER include general props like "a chef". Focus on THE DISH ONLY.
════════════════════════════════════════════════

════════════ TURKISH DISH VISUAL REFERENCE ════════════
Sucuklu Yumurta : round sucuk slices EMBEDDED INTO set egg white with runny orange yolk, orange-red sausage oil pooling, in black cast-iron pan
Menemen         : loose wet scramble of tomato chunks + diced green peppers + egg all mixed together, in copper or terracotta pan, steam rising
Mercimek Çorbası: smooth velvety orange/red soup in a ceramic bowl, swirl of red paprika butter on top, croutons on side
Lahmacun        : ultra-thin round flatbread, topped with dark minced meat mixture, flat and crispy, NOT pizza
Gözleme         : thin golden-brown folded flatbread, press marks visible, cheese/spinach filling at edges, on a wooden board
Mantı           : tiny steamed dumplings in bowl, drenched in thick white garlic yogurt, dark red paprika-butter drizzled on top
Kebap/Şiş       : charred skewered meat with dark grill marks, served on flatbread with tomato and pepper on the side
Baklava         : golden diamond-shaped layered pastry squares glistening with honey syrup, crushed pistachios scattered on top
Mercimek Köftesi: oblong dark-reddish bulgur and lentil patties on a flat plate, fresh parsley and lemon wedge on side
Pilav           : fluffy white or yellow rice, each grain separate, light steam, served in a wide shallow bowl
════════════════════════════════════════════════════════

════════════ CONFIDENCE SCORING ════════════
90-100: Fully certain — clear ingredient list + clear cooking method
70-89 : Mostly confident — minor ambiguity in plating
50-69 : Moderate — vague recipe or unusual combination
<50   : Low — title and ingredients conflict heavily
════════════════════════════════════════════

Return ONLY this JSON (no markdown, no extra text):
{
  "dish_name": "Precise English name of the actual final dish",
  "visual_description": "3-4 sentences describing exact colors, textures, shapes, how ingredients look in the finished dish",
  "main_visible_ingredients": ["each ingredient as it looks in the finished dish"],
  "plating_style": "Exact serving vessel + arrangement (e.g. black cast-iron skillet, white ceramic plate with side garnish)",
  "food_photography_prompt": "DENSE scene-level prompt for AI image generator: foreground dish details (colors, textures, steam, sauce), background surface (e.g. dark slate, worn wood, white marble), lighting (e.g. soft side natural light, warm candlelight), camera angle (45-degree or top-down), overall mood. NEVER include brand names, logos, text, labels, or bottles.",
  "visualConfidenceScore": 90
}`;


  try {
    const result = await generateText({
      model: getModel(provider),
      prompt: analysisPrompt,
      maxOutputTokens: 800,
    });

    const match = result.text.match(/\{[\s\S]*\}/);
    const cleaned = match ? match[0] : result.text;

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

Natural lighting. Highly realistic. Restaurant quality. Top-down or 45-degree angle. High detail textures. Authentic cultural presentation. Absolutely NO TEXT, NO LOGOS, NO WATERMARKS, NO BOTTLE LABELS, NO BRANDING on any ingredients or dishware.`;
  } else {
    // Low confidence — ignore title completely, describe only from ingredients
    finalPrompt = `Professional food photography. Do NOT interpret this as any specific named dish.

Ingredients visible in the dish:
${main_visible_ingredients.join(", ")}

${food_photography_prompt}

Natural lighting. Highly realistic. Restaurant quality. Top-down or 45-degree angle. High detail textures. Absolutely NO TEXT, NO LOGOS, NO WATERMARKS, NO BOTTLE LABELS, NO BRANDING on any ingredients or dishware.`;
  }

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=800&height=800&nologo=true&model=flux&seed=${Math.floor(Math.random() * 9999)}`;
}
