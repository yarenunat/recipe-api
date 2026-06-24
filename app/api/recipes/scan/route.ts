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

    // Call Groq Vision Model to extract text and format it
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Bu görselde el yazısı veya basılı bir yemek tarifi var. Lütfen bu görseldeki yazıları oku ve SADECE aşağıdaki JSON formatında ayrıştır. Hiçbir açıklama ekleme, markdown kod bloğu kullanma.

JSON Formatı:
{
  "title": "Tarifin başlığı (string)",
  "description": "Kısaca tarif hakkında bir cümlelik açıklama (string)",
  "ingredients": [
    { "name": "Malzeme adı", "quantity": "Miktar (Örn: 1 su bardağı)" }
  ],
  "instructions": "Adım adım yapılışı (string, her adım arasına '\\n' koyarak ayır)"
}`
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
