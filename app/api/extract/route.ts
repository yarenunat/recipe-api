import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

// 1. CORS Ayarları: Uygulamanın Vercel dışından (iPad/Web) erişebilmesi için şart.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 2. OPTIONS İsteği: Tarayıcıların "giriş izni" sorgusuna cevap verir.
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL gerekli' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Web Sayfasını Çek (Scraping)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    
    if (!response.ok) {
      throw new Error('Hedef sayfaya erişilemedi.');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Meta verilerini topla (Instagram ve Bloglar için en sağlıklı yöntem)
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    
    const rawContent = `Başlık: ${title}\nAçıklama/İçerik: ${description}`;

    // 4. Gemini Yapay Zeka Entegrasyonu
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key (GEMINI_API_KEY) Vercel üzerinde tanımlı değil.' }, 
        { status: 500, headers: corsHeaders }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Sen profesyonel bir yemek şefisin. Aşağıdaki ham metinden bir yemek tarifi çıkar.
      Eğer metin bir yemek tarifi içermiyorsa, elinden geldiğince başlığa uygun tahmini malzemeler uydur.
      
      Çıktıyı TAM OLARAK şu JSON formatında ver:
      {
        "title": "Yemek Adı",
        "prepTimeMinutes": 30,
        "originalServings": 4,
        "tags": ["Kategori1", "Kategori2"],
        "ingredients": [{"name": "Malzeme Adı", "amount": 1.5, "unit": "adet/kaşık/gr"}],
        "steps": ["1. Adım açıklaması", "2. Adım açıklaması"]
      }

      Ham Metin:
      ${rawContent}
    `;

    const aiResult = await model.generateContent(prompt);
    let resultText = aiResult.response.text();

    // Markdown bloklarını temizle (Gemini bazen ```json ekler, bu JSON parse işlemini bozar)
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const recipeData = JSON.parse(resultText);
      
      // Eğer AI görsel bulamadıysa, web sayfasındaki orijinal görseli ekle
      if (!recipeData.imageUrl && ogImage) {
        recipeData.imageUrl = ogImage;
      }

      return NextResponse.json(recipeData, { headers: corsHeaders });
    } catch (parseError) {
      console.error("JSON Parse Hatası:", resultText);
      throw new Error("Yapay zeka geçersiz bir veri formatı döndürdü.");
    }
    
  } catch (error: any) {
    console.error("API Hatası:", error.message);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500, headers: corsHeaders }
    );
  }
}