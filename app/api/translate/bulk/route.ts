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

    // Chunk large arrays to avoid TPM limits (max 30 strings per call)
    const chunkSize = 30;
    const allTranslations: string[] = [];

    for (let i = 0; i < strings.length; i += chunkSize) {
      const chunk = strings.slice(i, i + chunkSize);

      const prompt = `You are a professional translator. Translate the following list of short strings (recipe titles, ingredient names) into ${targetLanguage}.
If a string is already in ${targetLanguage}, return it as is.
Return ONLY a valid JSON array of strings in the exact same order as the input. No markdown, no extra text, no explanation.

Input array:
${JSON.stringify(chunk)}
`;

      const { text } = await generateText({
        model: getModel("groq"),
        prompt,
        maxOutputTokens: 1000,
      });

      const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      let parsed: string[];
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Fallback: try to extract array from text
        const match = cleaned.match(/\[[\s\S]*\]/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          // If parsing completely fails, return originals for this chunk
          parsed = chunk;
        }
      }

      if (!Array.isArray(parsed)) {
        // Return originals for this chunk rather than failing entirely
        allTranslations.push(...chunk);
      } else {
        allTranslations.push(...parsed);
      }
    }

    return NextResponse.json({ translations: allTranslations });
  } catch (error) {
    console.error("Bulk translation API error:", error);
    return NextResponse.json({ error: "Failed to translate strings" }, { status: 500 });
  }
}
