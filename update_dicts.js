const fs = require('fs');
const path = require('path');

const dictsDir = path.join(__dirname, 'i18n', 'dictionaries');
const locales = ['tr', 'en', 'es', 'zh', 'hi'];

const additions = {
  tr: {
    login: {
      welcome_back: "Tekrar Hoş Geldin", sign_in_desc: "Kaydedilmiş tariflerine ve sağlık verilerine erişmek için giriş yap.",
      invalid_credentials: "Geçersiz e-posta veya şifre", unexpected_error: "Beklenmeyen bir hata oluştu",
      email: "E-Posta Adresi", password: "Şifre", sign_in: "Giriş Yap", no_account: "Hesabın yok mu?", create_account: "Hesap Oluştur"
    },
    register: {
      create_account: "Hesap Oluştur", join_us: "Harika tarifler üretmeye ve kaydetmeye başlamak için bize katıl.",
      full_name: "İsim Soyisim", sign_up: "Kayıt Ol", already_have_account: "Zaten hesabın var mı?"
    },
    health: {
      title: "Sağlığım", subtitle: "Beslenmeni, kilonu takip et ve yapay zeka analizleri al.",
      calories: "Kalori", weight: "Kilo", dietitian: "Diyetisyen", today_intake: "Bugünkü Tüketim",
      reset_warning_title: "Aylık Sıfırlama Uyarısı", reset_warning_desc: "Kalori loglarınız her ay başında otomatik olarak sıfırlanır. Sadece içinde bulunulan ayın kayıtları saklanır.",
      log_food: "Yemek Ekle", log_date: "Tarih", food_name_placeholder: "Yemek Adı (örn. Avokado Tost)",
      auto_value: "Otomatik Bul", add_to_log: "Listeye Ekle", food_history: "Yemek Geçmişi (Bu Ay)", no_logs_month: "Bu ay henüz yemek logu girilmemiş.",
      total: "Toplam", current_weight: "Mevcut Kilo", save: "Kaydet", weight_history: "Kilo Geçmişi", no_weight_data: "Henüz kilo verisi yok.",
      ai_dietitian: "Yapay Zeka Diyetisyen", ai_dietitian_desc: "Son 30 günlük beslenme ve kilo eğilimlerinin kişiselleştirilmiş analizini al.",
      generate_report: "Aylık Rapor Oluştur", analyzing: "Analiz ediliyor..."
    },
    pantry: {
      title: "Kilerim", subtitle: "Dolabında neler var? Malzemeleri seç, gerisini yapay zekaya bırak.",
      search_placeholder: "Ara veya malzeme ekle...", selected_ingredients: "Seçilen Malzemeler", items: "ürün",
      generate_recipe: "Tarif Oluştur", creating_magic: "Sihir gerçekleşiyor..."
    }
  },
  en: {
    login: {
      welcome_back: "Welcome Back", sign_in_desc: "Sign in to access your saved recipes and health stats.",
      invalid_credentials: "Invalid email or password", unexpected_error: "An unexpected error occurred",
      email: "Email Address", password: "Password", sign_in: "Sign In", no_account: "Don't have an account?", create_account: "Create Account"
    },
    register: {
      create_account: "Create Account", join_us: "Join us to start generating and saving delicious recipes.",
      full_name: "Full Name", sign_up: "Sign Up", already_have_account: "Already have an account?"
    },
    health: {
      title: "My Health", subtitle: "Track your nutrition, weight, and get AI insights.",
      calories: "Calories", weight: "Weight", dietitian: "Dietitian", today_intake: "Today's Intake",
      reset_warning_title: "Monthly Reset Warning", reset_warning_desc: "Your calorie logs are reset at the beginning of each month. Only current month records are kept.",
      log_food: "Log Food", log_date: "Date", food_name_placeholder: "Food Name (e.g. Avocado Toast)",
      auto_value: "Auto Value", add_to_log: "Add to Log", food_history: "Food History (This Month)", no_logs_month: "No food logged this month yet.",
      total: "Total", current_weight: "Current Weight", save: "Save", weight_history: "Weight History", no_weight_data: "No weight data available.",
      ai_dietitian: "AI Dietitian", ai_dietitian_desc: "Get a personalized analysis of your diet and weight trends over the last 30 days.",
      generate_report: "Generate Monthly Report", analyzing: "Analyzing..."
    },
    pantry: {
      title: "My Pantry", subtitle: "What's in your fridge? Select ingredients and let AI do the magic.",
      search_placeholder: "Search or add custom ingredient...", selected_ingredients: "Selected Ingredients", items: "items",
      generate_recipe: "Generate Recipe", creating_magic: "Creating magic..."
    }
  },
  es: {
    login: {
      welcome_back: "Bienvenido de nuevo", sign_in_desc: "Inicia sesión para acceder a tus recetas y estadísticas.",
      invalid_credentials: "Correo o contraseña inválidos", unexpected_error: "Ha ocurrido un error inesperado",
      email: "Correo Electrónico", password: "Contraseña", sign_in: "Iniciar Sesión", no_account: "¿No tienes cuenta?", create_account: "Crear Cuenta"
    },
    register: {
      create_account: "Crear Cuenta", join_us: "Únete a nosotros para empezar a generar y guardar deliciosas recetas.",
      full_name: "Nombre completo", sign_up: "Registrarse", already_have_account: "¿Ya tienes cuenta?"
    },
    health: {
      title: "Mi Salud", subtitle: "Haz un seguimiento de tu nutrición, peso y obtén análisis con IA.",
      calories: "Calorías", weight: "Peso", dietitian: "Dietista", today_intake: "Consumo de Hoy",
      reset_warning_title: "Aviso de reinicio mensual", reset_warning_desc: "Tus registros de calorías se reinician cada mes. Solo se mantienen los del mes actual.",
      log_food: "Añadir Comida", log_date: "Fecha", food_name_placeholder: "Nombre (Ej. Tostada de aguacate)",
      auto_value: "Valor Automático", add_to_log: "Añadir al registro", food_history: "Historial (Este Mes)", no_logs_month: "Aún no hay registros este mes.",
      total: "Total", current_weight: "Peso Actual", save: "Guardar", weight_history: "Historial de Peso", no_weight_data: "No hay datos de peso.",
      ai_dietitian: "Dietista IA", ai_dietitian_desc: "Obtén un análisis personalizado de tu dieta de los últimos 30 días.",
      generate_report: "Generar Reporte Mensual", analyzing: "Analizando..."
    },
    pantry: {
      title: "Mi Despensa", subtitle: "¿Qué hay en tu nevera? Selecciona ingredientes y deja que la IA haga su magia.",
      search_placeholder: "Buscar o añadir ingrediente...", selected_ingredients: "Ingredientes Seleccionados", items: "artículos",
      generate_recipe: "Generar Receta", creating_magic: "Creando magia..."
    }
  },
  zh: {
    login: {
      welcome_back: "欢迎回来", sign_in_desc: "登录以访问您保存的食谱和健康数据。",
      invalid_credentials: "无效的邮箱或密码", unexpected_error: "发生意外错误",
      email: "电子邮件", password: "密码", sign_in: "登录", no_account: "还没有账号？", create_account: "创建账号"
    },
    register: {
      create_account: "创建账号", join_us: "加入我们，开始生成并保存美味的食谱。",
      full_name: "全名", sign_up: "注册", already_have_account: "已有账号？"
    },
    health: {
      title: "我的健康", subtitle: "跟踪您的营养、体重，并获取 AI 洞察。",
      calories: "卡路里", weight: "体重", dietitian: "营养师", today_intake: "今日摄入",
      reset_warning_title: "每月重置警告", reset_warning_desc: "您的卡路里记录将在每月初重置。仅保留当月的记录。",
      log_food: "记录食物", log_date: "日期", food_name_placeholder: "食物名称（如：牛油果吐司）",
      auto_value: "自动计算", add_to_log: "添加到记录", food_history: "饮食记录（本月）", no_logs_month: "本月尚未记录食物。",
      total: "总计", current_weight: "当前体重", save: "保存", weight_history: "体重记录", no_weight_data: "暂无体重数据。",
      ai_dietitian: "AI 营养师", ai_dietitian_desc: "获取过去 30 天饮食和体重趋势的个性化分析。",
      generate_report: "生成月度报告", analyzing: "分析中..."
    },
    pantry: {
      title: "我的储藏室", subtitle: "冰箱里有什么？选择食材，让 AI 发挥魔力。",
      search_placeholder: "搜索或添加自定义食材...", selected_ingredients: "已选食材", items: "件",
      generate_recipe: "生成食谱", creating_magic: "正在创造魔力..."
    }
  },
  hi: {
    login: {
      welcome_back: "वापसी पर स्वागत है", sign_in_desc: "अपनी सहेजी गई रेसिपी और स्वास्थ्य आँकड़ों तक पहुँचने के लिए साइन इन करें।",
      invalid_credentials: "अमान्य ईमेल या पासवर्ड", unexpected_error: "एक अप्रत्याशित त्रुटि हुई",
      email: "ईमेल पता", password: "पासवर्ड", sign_in: "साइन इन करें", no_account: "खाता नहीं है?", create_account: "खाता बनाएं"
    },
    register: {
      create_account: "खाता बनाएं", join_us: "स्वादिष्ट रेसिपी बनाने और सहेजने के लिए हमसे जुड़ें।",
      full_name: "पूरा नाम", sign_up: "साइन अप करें", already_have_account: "क्या आपके पास पहले से खाता है?"
    },
    health: {
      title: "मेरा स्वास्थ्य", subtitle: "अपने पोषण, वजन को ट्रैक करें और एआई अंतर्दृष्टि प्राप्त करें।",
      calories: "कैलोरी", weight: "वजन", dietitian: "आहार विशेषज्ञ", today_intake: "आज का सेवन",
      reset_warning_title: "मासिक रीसेट चेतावनी", reset_warning_desc: "आपकी कैलोरी लॉग प्रत्येक महीने की शुरुआत में रीसेट हो जाती है। केवल चालू माह के रिकॉर्ड रखे जाते हैं।",
      log_food: "भोजन लॉग करें", log_date: "दिनांक", food_name_placeholder: "भोजन का नाम (जैसे एवोकैडो टोस्ट)",
      auto_value: "स्वत: मूल्य", add_to_log: "लॉग में जोड़ें", food_history: "भोजन का इतिहास (इस महीने)", no_logs_month: "इस महीने अभी तक कोई भोजन लॉग नहीं किया गया है।",
      total: "कुल", current_weight: "वर्तमान वजन", save: "सहेजें", weight_history: "वजन इतिहास", no_weight_data: "कोई वजन डेटा उपलब्ध नहीं है।",
      ai_dietitian: "एआई आहार विशेषज्ञ", ai_dietitian_desc: "पिछले 30 दिनों में अपने आहार और वजन के रुझानों का व्यक्तिगत विश्लेषण प्राप्त करें।",
      generate_report: "मासिक रिपोर्ट तैयार करें", analyzing: "विश्लेषण कर रहा है..."
    },
    pantry: {
      title: "मेरी पेंट्री", subtitle: "आपके फ्रिज में क्या है? सामग्री चुनें और AI को जादू करने दें।",
      search_placeholder: "खोजें या सामग्री जोड़ें...", selected_ingredients: "चयनित सामग्री", items: "आइटम",
      generate_recipe: "रेसिपी बनाएं", creating_magic: "जादू बन रहा है..."
    }
  }
};

locales.forEach(loc => {
  const fp = path.join(dictsDir, loc + '.json');
  if (fs.existsSync(fp)) {
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    data.login = additions[loc].login;
    data.register = additions[loc].register;
    data.health = additions[loc].health;
    data.pantry = additions[loc].pantry;
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  }
});

console.log("Dictionary updated.");
