import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  return NextResponse.json({ mesaj: "API Başarıyla Çalışıyor! ✨" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    // HATA AYIKLAMA: Anahtarın ilk 3 harfini yazdırarak Vercel'in anahtarı görüp görmediğini kontrol ediyoruz
    const apiKey = process.env.GEMINI_API_KEY || "";
    console.log("Sistem Kontrolü - API Key Başlangıcı:", apiKey.substring(0, 5) + "...");

    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ error: 'API Anahtarı Vercel panelinde bulunamadı!' }, { status: 500, headers: corsHeaders });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro']; // En stabil modeller
    
    let text = '';
    let lastError = '';

    for (const modelName of modelNames) {
      try {
        console.log(`${modelName} deneniyor...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(`Bu linkteki yemeğin malzemelerini JSON formatında çıkar: ${url}`);
        text = result.response.text();
        console.log(`${modelName} BAŞARILI!`);
        break;
      } catch (e: any) {
        // ASIL HATA BURADA YAZACAK:
        lastError = e.message || "Bilinmeyen hata";
        console.error(`${modelName} HATASI:`, lastError);
      }
    }

    if (!text) {
       return NextResponse.json({ 
         error: 'Yapay zeka modelleri yanıt vermedi.',
         debug: lastError // Hatayı Flutter tarafına da gönderiyoruz
       }, { status: 500, headers: corsHeaders });
    }

    // JSON temizleme ve döndürme işlemi
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(text), { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem hatası: ' + error.message }, { status: 500, headers: corsHeaders });
  }
}