import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
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

    const promptText = `There is a handwritten or printed recipe in this image. Please read the recipe, translate all content to ${targetLanguage}, and output ONLY a valid JSON object matching the exact structure below. Do not add any extra explanations or markdown code blocks.

JSON Structure:
{
  "title": "Recipe title in ${targetLanguage}",
  "description": "One-sentence recipe description in ${targetLanguage}",
  "ingredients": [
    { "name": "Ingredient name in ${targetLanguage}", "quantity": "Quantity/Amount in ${targetLanguage}" }
  ],
  "instructions": "Step-by-step instructions in ${targetLanguage} (single string, separate each step with '\\n')"
}`;

    // Call Groq Vision Model to extract text and format it
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        temperature: 0.1
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq Vision Error:", err);
      throw new Error(`Groq API returned ${res.status}`);
    }

    const data = await res.json();
    let content = data.choices[0].message.content;

    // Extract JSON block aggressively
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      content = match[0];
    } else {
      throw new Error("JSON not found in response");
    }

    const parsedData = JSON.parse(content);

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error("Failed to scan recipe image:", error);
    return NextResponse.json({ error: "Görsel taranamadı veya anlaşılamadı. " + error.message }, { status: 500 });
  }
}
