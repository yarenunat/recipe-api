import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { foodName } = await req.json();
    if (!foodName) {
      return NextResponse.json({ error: "Food name is required" }, { status: 400 });
    }

    // Call Groq to break down the food
    const prompt = `You are a culinary expert. Break down the following food into its core raw ingredients for a standard single portion. 
Food: "${foodName}"
Return ONLY a valid JSON array of objects. Do not include any markdown formatting, backticks, or other text.
Each object must have exactly these keys: "name" (string, ingredient name), "quantity" (number, amount), "unit" (string, e.g. "pcs", "tbsp", "grams").
Example for "Menemen": [{"name": "Eggs", "quantity": 2, "unit": "pcs"}, {"name": "Tomatoes", "quantity": 2, "unit": "medium"}, {"name": "Olive Oil", "quantity": 1, "unit": "tbsp"}]`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API returned ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Extract array using regex if conversational text exists
      const match = content.match(/\[.*\]/s);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not find JSON array in response");
      }
    }
    return NextResponse.json({ ingredients: parsed });
  } catch (error: any) {
    console.error("Analyze food error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze food" }, { status: 500 });
  }
}
