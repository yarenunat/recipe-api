import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { foodName, ingredients } = await req.json();
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: "Ingredients array is required" }, { status: 400 });
    }

    // Call Groq to calculate total calories
    const prompt = `You are a dietitian. I will give you a list of ingredients and their exact quantities for a dish called "${foodName}". 
Calculate the total caloric value (in kcal) of this exact combination.
Ingredients:
${ingredients.map((i: any) => `- ${i.quantity} ${i.unit} of ${i.name}`).join("\n")}

Return ONLY a single integer representing the total calories. No text, no explanation, no formatting. Just the number.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API returned ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the number
    const calories = parseInt(content.replace(/\D/g, ""), 10);
    
    if (isNaN(calories)) {
      throw new Error("AI did not return a valid number");
    }

    return NextResponse.json({ calories });
  } catch (error) {
    console.error("Calculate calories error:", error);
    return NextResponse.json({ error: "Failed to calculate calories" }, { status: 500 });
  }
}
