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

    let contentToAnalyze = url;

    // Eğer kullanıcı bir link gönderdiyse (Instagram vb.), içeriğini microlink üzerinden çekiyoruz
    if (url.trim().startsWith('http://') || url.trim().startsWith('https://')) {
      try {
        const mlRes = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const mlData = await mlRes.json();
        if (mlData.status === 'success' && mlData.data) {
          const title = mlData.data.title || '';
          const desc = mlData.data.description || '';
          const imageUrl = mlData.data.image?.url || '';
          contentToAnalyze = `Başlık: ${title}\nİçerik/Açıklama: ${desc}\nGörsel URL: ${imageUrl}\nOrijinal URL: ${url}`;
        }
      } catch (err) {
        console.error("Scraping error:", err);
      }
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `ROL: Sen bir "Yemek Tarifi Veri Çıkarıcı" uzmanısın.
GÖREV: Sana verilen metinden, yemek blogu linkinden veya sosyal medya açıklamasından yemeğin bilgilerini ayıkla ve SADECE JSON döndür.

KURALLAR:
ÇIKTI FORMATI: Yanıtın sadece saf JSON nesnesi olmalı. Markdown kod blokları (\`\`\`json) kullanma.
DİL: Girdi hangi dilde olursa olsun, JSON içindeki tüm değerleri Türkçe döndür.
VERİ YAPISI:
title: Yemeğin adı (String).
imageUrl: Varsa görsel linki, yoksa "" (String).
prepTimeMinutes: Hazırlama süresi (Integer).
servings: Kaç kişilik olduğu (Integer).
tags: Yemekle ilgili etiketler (List).
ingredients: Malzemeler (List). Her eleman şu yapıda olmalı: {"name": String, "amount": double, "unit": String}.
instructions: Hazırlanış adımları (List).
TOKEN TASARRUFU: Hiçbir ön açıklama, selamlama veya kapanış cümlesi ekleme. Yanıt doğrudan "{" ile başlamalı ve "}" ile bitmeli.
SOSYAL MEDYA: Eğer girdi bir sosyal medya açıklamasıysa, emojileri temizle ve dağınık haldeki tarif bilgisini mantıklı bir sıraya koyarak normalize et.
NULL GÜVENLİĞİ: Veri bulunamazsa String için "", Sayı için 0, Liste için [] döndür. Yanlış veri tipinden kaçın.`
          },
          { role: "user", content: `Analiz et:\n${contentToAnalyze}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up markdown blocks if the LLM still returns them
    content = content.replace(/^```json\s*/, '').replace(/```$/, '').trim();

    return NextResponse.json(JSON.parse(content), { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}