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

    // Call Groq to get average calories
    const prompt = `You are a dietitian. Provide the average caloric value (in kcal) for a standard serving of the food "${foodName}". 
Return ONLY a single integer representing the average calories. No text, no explanation, no formatting. Just the number.`;

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
    
    // Parse the number
    const calories = parseInt(content.replace(/\D/g, ""), 10);
    
    if (isNaN(calories)) {
      throw new Error("AI did not return a valid number");
    }

    return NextResponse.json({ calories });
  } catch (error) {
    console.error("Auto calories error:", error);
    return NextResponse.json({ error: "Failed to fetch average calories" }, { status: 500 });
  }
}
