import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CORS ayarları (Uygulamanın engellenmemesi için)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 1. Tarayıcıdan API'yi test etmek için GET metodu
export async function GET() {
  return NextResponse.json(
    { mesaj: "API Başarıyla Çalışıyor! Sihir Başlasın! ✨" },
    { headers: corsHeaders }
  );
}

// 2. Ön uçtan gelen CORS izin isteklerini karşılayan OPTIONS metodu
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 3. Asıl yapay zeka işlemini yapan POST metodu
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL eksik' }, { status: 400, headers: corsHeaders });
    }

    // Vercel'den GEMINI_API_KEY'i alır
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    // Sadece içindeki ismi 'gemini-pro' olarak değiştiriyoruz:
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
        {"name": "Un", "amount": 2, "unit": "su bardağı"},
        {"name": "Süt", "amount": 1, "unit": "su bardağı"}
      ],
      "instructions": [
        "Unu ve sütü karıştırın.",
        "Önceden ısıtılmış fırında pişirin."
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Yapay zekanın döndürdüğü metni temizleyip JSON'a çeviriyoruz
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipeData = JSON.parse(text);

    return NextResponse.json(recipeData, { headers: corsHeaders });

  } catch (error) {
    console.error('Yapay Zeka Hatası:', error);
    return NextResponse.json({ error: 'Tarif çıkarılamadı veya hatalı link' }, { status: 500, headers: corsHeaders });
  }
}