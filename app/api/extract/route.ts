import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  return NextResponse.json({ mesaj: "Sistem Hazır! ✨" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;
    const apiKey = process.env.GEMINI_API_KEY || "";

    // SDK'yı v1 versiyonuna zorluyoruz
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // NOT: Bazı hesaplarda model ismi 'gemini-1.5-flash' iken bazılarında 'models/gemini-1.5-flash' gerekebilir.
    // Biz en güvenli olan 'gemini-1.5-flash' ismini kullanacağız.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Bu linkteki yemek tarifini analiz et ve JSON olarak döndür: ${url}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(text), { headers: corsHeaders });

  } catch (error: any) {
    console.error("KRİTİK HATA:", error.message);
    return NextResponse.json({ 
      error: 'Google API Yanıt Vermedi', 
      detay: error.message 
    }, { status: 500, headers: corsHeaders });
  }
}