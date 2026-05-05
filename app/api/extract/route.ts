import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  return NextResponse.json({ mesaj: "API Başarıyla Çalışıyor! Sihir Başlasın! ✨" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL eksik' }, { status: 400, headers: corsHeaders });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    
    const prompt = `Aşağıdaki web sitesindeki yemek tarifini analiz et ve ÇOK SIKI bir JSON formatında döndür. Asla JSON formatı dışına çıkma. 
    Site URL: ${url}
    
    Beklenen JSON Formatı:
    {
      "title": "Tarifin Adı",
      "imageUrl": "Yemeğin fotoğraf URL'si (bulamazsan boş bırak)",
      "prepTimeMinutes": 30,
      "servings": 4,
      "difficulty": "Kolay",
      "ingredients": [
        {"name": "Un", "amount": 2, "unit": "su bardağı"}
      ],
      "instructions": [
        "Unu ve sütü karıştırın."
      ]
    }`;

    // AKILLI SİSTEM: Çalışan modeli bulana kadar güncel modelleri sırayla dener
    const modelNames = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    let text = '';
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        console.log(`${modelName} modeli ile başarıyla tarif çekildi!`);
        break; // Modeli bulup işlemi yaptıysa döngüden çık
      } catch (e: any) {
        console.log(`${modelName} modeli reddedildi, diğerine geçiliyor...`);
      }
    }

    if (!text) {
       return NextResponse.json({ error: 'Hiçbir model bu API anahtarıyla çalışmadı.' }, { status: 500, headers: corsHeaders });
    }

    // Gelen metni temizleyip JSON'a çeviriyoruz
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipeData = JSON.parse(text);

    return NextResponse.json(recipeData, { headers: corsHeaders });

  } catch (error) {
    console.error('Genel API Hatası:', error);
    return NextResponse.json({ error: 'Tarif çıkarılamadı veya hatalı link' }, { status: 500, headers: corsHeaders });
  }
}