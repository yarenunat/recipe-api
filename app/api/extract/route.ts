import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

// CORS Ayarları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Tarayıcılar önce "OPTIONS" isteği gönderir, bunu karşılamalıyız
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL gerekli' }, { status: 400, headers: corsHeaders });

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const description = $('meta[property="og:description"]').attr('content') || '';
    const title = $('meta[property="og:title"]').attr('content') || '';
    const rawContent = `${title}\n${description}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API Key eksik' }, { status: 500, headers: corsHeaders });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `Aşağıdaki metinden yemek tarifini çıkar. Çıktıyı şu JSON formatında ver: {"title": "Ad", "prepTimeMinutes": 30, "originalServings": 4, "tags": ["Kategori"], "ingredients": [{"name": "x", "amount": 1, "unit": "y"}], "steps": ["1"]}. Veri: ${rawContent}`;

    const aiResult = await model.generateContent(prompt);
    let text = aiResult.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(text), { headers: corsHeaders });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}