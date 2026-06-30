<img width="1920" height="1080" alt="Adsız tasarım - Kopya" src="https://github.com/user-attachments/assets/35fcb5a9-ccf7-4ccf-b42e-b13f226464ca" />
<img width="1920" height="1080" alt="Adsız tasarım (1)" src="https://github.com/user-attachments/assets/dc6235e9-79b3-4e65-9bd7-a444ae1a9344" />
<img width="1920" height="1080" alt="Adsız tasarım (2)" src="https://github.com/user-attachments/assets/e06dab87-7ab8-4ac8-81d6-3975945be8eb" />


Cookio - Proje Tanıtım ve Teknik Detay Dökümanı
Cookio, kullanıcıların internetteki veya sosyal medyadaki tarifleri tek bir yerde toplamasını, evdeki malzemelerle akıllı tarifler üretmesini, adım adım yemek hazırlamasını ve günlük beslenme/sağlık süreçlerini takip etmesini sağlayan modern, yapay zekâ destekli ve yüklenebilir bir mobil web uygulamasıdır (PWA).

 Genel Özellikler ve Kullanıcı Deneyimi
1. URL ile Tarif Kaydetme ve Çıkarma
Açıklama: Kullanıcılar yemek bloglarından veya desteklenen sosyal medya platformlarından (Instagram, TikTok vb.) bir link yapıştırarak tarifi uygulamaya ekleyebilir.
Arka Plan Süreci: Link, arka planda web kazıma (Microlink) yöntemiyle taranır ve Groq API (Llama 3.3-70b) modeline gönderilir. Model; tarifin başlığını, malzemelerini, porsiyonunu, tahmini hazırlık süresini ve adımlarını Türkçe ve yapılandırılmış JSON formatında çıkartır. Görsel eksikse yapay zekayla (Pollinations AI) yemeğin görseli üretilir.

2. Buzdolabındaki Malzemelere Göre Akıllı Tarif Önerileri (Pantry)
Açıklama: Kullanıcılar dolapta bulunan malzemeleri (tavuk, peynir, domates vb.) seçerek veya manuel olarak yeni malzeme ekleyerek "Bugün Ne Pişirsem?" sorgusu yapabilir.
Arka Plan Süreci: Seçilen malzemeler Groq API'ye gönderilerek bu malzemelerle hazırlanabilecek en yaratıcı ve lezzetli tarif üretilir ve kullanıcının kütüphanesine kaydedilir.

4. Adım Adım Yemek Hazırlama (Pişirme Modu)
Açıklama: Yemek yapma esnasında ekranı kolayca takip edebilmek için tasarlanmış özel bir arayüzdür.
Arka Plan Süreci: Tarif adımları tek tek büyük kartlar halinde gösterilir. Yapay zekâ tarif adımlarındaki süreleri (örn. "10 dakika pişirin") otomatik algılayarak dinamik bir geri sayım sayacı (timer) oluşturur. Kullanıcı sesli veya dokunarak adımlar arasında geçiş yapabilir.

5. Kalori ve Besin Değeri Takibi
Açıklama: Kullanıcıların günlük kalori hedeflerini, boy, kilo ve hedef kilo durumlarını takip edebileceği bir paneldir.
Arka Plan Süreci: Kullanıcı yediklerini yazdığında (örn. "1 porsiyon mercimek çorbası") yapay zekâ yemeğin kalorisini otomatik hesaplar (/api/health/auto-calories) ve günlüğe kaydeder.

6. Yapay Zekâ Destekli Beslenme Analizi (AI Raporu)
Açıklama: Kullanıcının geçmiş kalori ve kilo loglarını analiz ederek kişiye özel sağlıklı beslenme önerileri sunar.
Arka Plan Süreci: Son ağırlık ve kalori logları yapay zekaya beslenerek kullanıcıya haftalık/aylık gelişim grafiği yorumlaması ve beslenme önerisi sunulur.

7. Tarif Görsellerinden Malzeme ve Hazırlık Adımları Oluşturma (Görsel Tarama)
Açıklama: Kullanıcılar defterlerindeki el yazısı tariflerin veya bir dergideki tariflerin fotoğrafını çekip yükleyebilir.
Arka Plan Süreci: Yüklenen resim Base64 formatına çevrilerek Groq Vision API modeline (llama-4-scout / Vision model) gönderilir. Görüntüdeki yazılar okunarak (OCR) otomatik olarak başlık, açıklama, malzemeler ve yapılış adımlarına dönüştürülür.

8. Çoklu Dil Desteği (i18n)
Açıklama: Uygulama tamamen yerelleştirilmiş olup 5 farklı dili destekler:
Türkçe (TR)
İngilizce (EN)
Çince (ZH)
Hintçe (HI)
İspanyolca (ES)

Arka Plan Süreci: URL yapısındaki dil parametresine göre (/[locale]) tüm arayüz metinleri dinamik yüklenir. Yapay zekadan dönen tarifler de kullanıcının seçtiği aktif dile göre tercüme edilerek veritabanına kaydedilir.
    Teknolojik Mimari ve Altyapı
    
Frontend (Önyüz)
Framework: Next.js 15+ (React 19 & App Router yapısı)
Tasarım & Stil: Tailwind CSS v4, Framer Motion (Akıcı mikro-animasyonlar ve geçiş efektleri için), Lucide React (Modern ikon seti)
Durum Yönetimi: Zustand (Hafif ve performanslı client-side state yönetimi)
PWA (Progressive Web App): @ducanh2912/next-pwa ile entegre edilmiştir. Çevrimdışı önbellekleme (Offline caching) ve telefona uygulama olarak yüklenebilme özelliğine sahiptir.

Backend (Arka Plan & API)
API Mimari: Next.js Route Handlers (RESTful API endpoints)
Kimlik Doğrulama: NextAuth.js (Auth.js v5 Beta) - E-posta/Şifre tabanlı kayıt ve giriş yönetimi.

Veri Tabanı & ORM
Veri Tabanı: PostgreSQL (Yüksek performanslı ilişkisel veri tabanı)
ORM: Prisma ORM (Veri tabanı şeması yönetimi, migrasyonlar ve güvenli sorgular için)
🤖 Yapay Zekâ Entegrasyonları (AI Stack)
LLM & Vision API: Groq API üzerinden Llama modelleri kullanılarak tarif çıkarma, resim tarama ve beslenme analizleri milisaniyeler içerisinde gerçekleştirilir.
Görsel Üretimi: Pollinations AI API entegrasyonuyla tarifler için otomatik olarak yüksek kaliteli yemek fotoğrafları üretilir.
