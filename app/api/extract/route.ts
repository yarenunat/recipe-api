import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  return NextResponse.json({ mesaj: "Groq Sistemi Aktif! 🚀" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Llama 3 modelini kullanarak tarif analizi yapıyoruz
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Sadece linkteki yemeğin tarifini analiz et ve JSON formatında döndür. Asla açıklama yazma."
          },
          {
            role: "user",
            content: `Bu linkteki tarifi analiz et: ${url}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const recipeData = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(recipeData, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: "Groq Hatası: " + error.message }, { status: 500, headers: corsHeaders });
  }
}