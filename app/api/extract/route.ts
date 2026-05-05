import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  return NextResponse.json({ mesaj: "Sistem Aktif! 🚀" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key eksik!" }, { status: 500, headers: corsHeaders });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Sadece linkteki yemeğin tarifini analiz et ve şu JSON formatında döndür: title, imageUrl, prepTimeMinutes, servings, tags (liste), ingredients (liste: {name, amount, unit}), instructions (liste). Asla açıklama yazma."
          },
          { role: "user", content: `Analiz et: ${url}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content), { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}