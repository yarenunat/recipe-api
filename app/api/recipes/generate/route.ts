import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

export const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  imagePrompt: z.string().optional(),
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

    let llmInput = prompt;
    let imageUrl = null;

    // If the prompt is a URL, fetch the actual content first
    if (prompt.trim().startsWith("http://") || prompt.trim().startsWith("https://")) {
      try {
        const response = await fetch(prompt.trim());
        const html = await response.text();
        const $ = cheerio.load(html);
        
        imageUrl = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content') || 
                   $('img').first().attr('src');
                   
        if (imageUrl && !imageUrl.startsWith('http')) {
           const urlObj = new URL(prompt.trim());
           imageUrl = new URL(imageUrl, urlObj.origin).href;
        }

        $('script, style, noscript, iframe, img, svg').remove();
        const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
        llmInput = `Extract a detailed recipe from the following website content. Website Content: ${textContent}`;
      } catch (err) {
        console.error("Failed to fetch URL content, falling back to raw prompt", err);
      }
    }

    const systemInstruction = `Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Recipe name",
  "description": "Short appetizing description",
  "imagePrompt": "A highly detailed English visual description of the FINISHED dish for an AI image generator. CRITICAL INSTRUCTIONS: 1. DO NOT rely on foreign food names alone (e.g. 'simit', 'milföy'). You MUST describe their exact physical geometry and texture in English. 2. If it has a hole (like simit/bagel), EXPLICITLY state 'ring-shaped with a clear empty hole in the middle'. 3. If it's puff pastry (milföy), EXPLICITLY state 'flaky, crispy, multi-layered golden baked puff pastry texture' and NOT soft dough. 4. Never describe raw ingredients. Describe exact shape, texture, crispiness, and plating. For example: 'Ring-shaped flaky crispy puff pastry with a hole in the middle, covered in roasted sesame seeds, perfectly plated'",
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
}`;

    let messages: any = [];
    if (imageUrl) {
      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Generate a detailed recipe based on the following input: "${llmInput}". Use the provided image to accurately describe the visual styling and presentation of the dish in the 'imagePrompt' field.\n\n${systemInstruction}` },
            { type: 'image', image: new URL(imageUrl) }
          ]
        }
      ];
    } else {
      messages = [
        {
          role: 'user',
          content: `Generate a detailed recipe based on the following input: "${llmInput}".\n\n${systemInstruction}`
        }
      ];
    }

    let text = "";
    try {
      const result = await generateText({
        model: getModel(imageUrl ? "vision" : provider),
        messages,
      });
      text = result.text;
    } catch (err) {
      console.error("Vision or Generation failed, falling back to text-only:", err);
      const fallbackResult = await generateText({
        model: getModel(provider),
        prompt: `Generate a detailed recipe based on the following input: "${llmInput}".\n\n${systemInstruction}`
      });
      text = fallbackResult.text;
    }

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
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent("professional cinematic food photography. " + (parsed.imagePrompt || parsed.title) + ", 4k resolution, highly detailed, realistic, appetizing, culinary magazine style, perfectly plated, natural lighting")}?width=800&height=800&nologo=true`,
            prompt: parsed.imagePrompt || parsed.title
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

