import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

export async function POST(request) {
  try {
    const { url } = await request.json();

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();

    const $ = cheerio.load(html);
    const description = $('meta[property="og:description"]').attr('content') || '';
    const title = $('meta[property="og:title"]').attr('content') || '';
    
    const rawContent = title + "\n" + description;

    if (!rawContent || rawContent.trim() === '') {
      return NextResponse.json({ error: 'İçerik bulunamadı veya sayfa gizli.' }, { status: 400 });
    }

    // API anahtarını doğrudan sistem değişkeninden alır
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });

    const prompt = `Aşağıdaki metinden yemek tarifini çıkar. Gereksiz kısımları at. Çıktıyı tam olarak şu JSON formatında ver:
    {
      "title": "Tarif Adı",
      "prepTimeMinutes": 30,
      "originalServings": 4,
      "tags": ["Kategori1", "Kategori2"],
      "ingredients": [
        {"name": "malzeme adı", "amount": 500, "unit": "gram"}
      ],
      "steps": ["Adım 1...", "Adım 2..."]
    }
    
    İncelenecek Veri:
    ${rawContent}`;

    const aiResult = await model.generateContent(prompt);
    const recipeJson = JSON.parse(aiResult.response.text());

    return NextResponse.json(recipeJson);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}