import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { strings, targetLanguage } = body;

    if (!strings || !Array.isArray(strings) || strings.length === 0 || !targetLanguage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `You are a professional translator. Translate the following list of short strings (recipe titles, ingredient names) into ${targetLanguage}.
If a string is already in ${targetLanguage}, return it as is.
Return ONLY a valid JSON array of strings in the exact same order as the input (no markdown, no extra text).

Input array:
${JSON.stringify(strings)}
`;

    const { text } = await generateText({
      model: getModel("groq"),
      prompt,
    });

    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not a valid JSON array");
    }

    return NextResponse.json({ translations: parsed });
  } catch (error) {
    console.error("Bulk translation API error:", error);
    return NextResponse.json({ error: "Failed to translate strings" }, { status: 500 });
  }
}
