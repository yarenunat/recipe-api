import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import { recipeSchema } from "../generate/route";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, provider = "groq" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    
    // Extract the real image from the webpage
    let scrapedImage = $('meta[property="og:image"]').attr('content') || 
                       $('meta[name="twitter:image"]').attr('content') || 
                       $('img').first().attr('src');
                       
    // Fix relative URLs if needed
    if (scrapedImage && !scrapedImage.startsWith('http')) {
      const urlObj = new URL(url);
      scrapedImage = `${urlObj.protocol}//${urlObj.host}${scrapedImage.startsWith('/') ? '' : '/'}${scrapedImage}`;
    }

    $('script, style, noscript, iframe, img, svg').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    const { text } = await generateText({
      model: getModel(provider),
      prompt: `Extract a detailed recipe from the following website content. Do not omit temperature, duration, or quantities. If missing, estimate intelligently.
Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
{
  "title": "Recipe title",
  "description": "Short description",
  "imagePrompt": "English visual description of the finished dish",
  "ingredients": [{ "name": "ingredient", "quantity": "amount" }],
  "instructions": ["Step 1...", "Step 2..."],
  "cookingTime": 20,
  "prepTime": 10,
  "totalTime": 30,
  "servings": 4,
  "calories": 400,
  "difficultyLevel": "Easy",
  "cuisineType": "Cuisine type",
  "temperature": "180°C",
  "tips": ["Tip 1", "Tip 2"]
}

Website Content: ${textContent}`,
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

    if (scrapedImage) {
      rawJson.imageUrl = scrapedImage;
    }

    const parsed = recipeSchema.parse(rawJson);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("URL parsing error:", error);
    return NextResponse.json({ error: "Failed to parse recipe from URL" }, { status: 500 });
  }
}
