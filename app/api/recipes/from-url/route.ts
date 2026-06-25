import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { getModel } from "@/lib/ai";
import { recipeSchema } from "../generate/route";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url, provider = "gemini" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await fetch(url);
    const html = await response.text();
    
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, img, svg').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    const { object } = await generateObject({
      model: getModel(provider),
      schema: recipeSchema,
      prompt: `Extract a detailed recipe from the following website content. Do not omit temperature, duration, or quantities. If missing, estimate intelligently. Website Content: ${textContent}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("URL parsing error:", error);
    return NextResponse.json({ error: "Failed to parse recipe from URL" }, { status: 500 });
  }
}
