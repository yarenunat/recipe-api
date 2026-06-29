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
      generate_report: "Aylık Rapor Oluştur", analyzing: "Analiz ediliyor...",
      alert_food_name: "Lütfen önce bir yemek adı girin.", alert_auto_value_failed: "Otomatik değer alınamadı.",
      today_label: "Bugün", weight_placeholder: "Mevcut kilonuzu girin (kg)",
      meal_times: { Breakfast: "Kahvaltı", Lunch: "Öğle Yemeği", Dinner: "Akşam Yemeği", Snack: "Atıştırmalık" }
    },
    pantry: {
      title: "Kilerim", subtitle: "Dolabında neler var? Malzemeleri seç, gerisini yapay zekaya bırak.",
      search_placeholder: "Ara veya malzeme ekle...", selected_ingredients: "Seçilen Malzemeler", items: "ürün",
      generate_recipe: "Tarif Oluştur", creating_magic: "Sihir gerçekleşiyor...",
      alert_generate_failed: "Kilerden tarif oluşturulamadı.",
      common_ingredients: {
        Chicken: "Tavuk", Beef: "Sığır Eti", Fish: "Balık", Eggs: "Yumurta", Milk: "Süt",
        Cheese: "Peynir", Butter: "Tereyağı", Rice: "Pirinç", Pasta: "Makarna", Bread: "Ekmek",
        Potato: "Patates", Tomato: "Domates", Onion: "Soğan", Garlic: "Sarımsak", Carrot: "Havuç",
        Mushroom: "Mantar", Spinach: "Ispanak", Broccoli: "Brokoli", Lemon: "Limon", Beans: "Fasulye"
      }
    },
    plan: {
      title: "Haftalık Plan", subtitle: "Haftanızı kolayca planlayın.", no_meals: "Henüz planlanmış öğün yok.",
      add_meal: "Öğün Ekle", for_date: "için", meal_time: "Öğün Zamanı", what_to_eat: "Ne yiyeceksiniz?",
      custom_meal: "Özel Yemek", saved_recipe: "Kaydedilmiş Tarif", custom_placeholder: "Örn. Yumurtalı Avokado Tostu",
      select_recipe: "Kaydedilmiş bir tarif seçin...", no_saved_recipes: "Henüz kaydedilmiş tarif yok.",
      adding: "Ekleniyor...", add_to_plan: "Plana Ekle"
    },
    my_recipes: {
      title: "Tarif Defterim", subtitle: "Kendi tariflerinizi burada listeleyip düzenleyebilirsiniz.",
      no_recipes_title: "Henüz Tarif Yok", no_recipes_desc: "Kendi tarif defteriniz boş. Yeni bir tarif ekleyerek başlayın!",
      add_new_button: "Yeni Tarif Ekle", no_image: "Resim Yok", custom_tag: "Özel"
    },
    new_recipe: {
      title: "Yeni Tarif Ekle", save_button: "Kaydet", magic_scan_title: "Sihirli Tarama",
      magic_scan_desc: "El yazısı tarifinizin veya kitap sayfasının fotoğrafını çekin, yapay zeka sizin için okuyup tüm formu otomatik doldursun!",
      scanning: "Okunuyor...", photo_select_button: "Fotoğraf Seç / Çek",
      scan_error: "Görsel taranamadı. Lütfen daha net bir fotoğraf yükleyin.", scan_error_generic: "Tarama sırasında bir hata oluştu.",
      change_image: "Resmi Değiştir", add_image: "Tarif Resmi Ekle", tap_click: "Dokun veya tıkla", step_number: "Adım",
      section_basic_info: "Temel Bilgiler", recipe_name_label: "Tarif Adı *", recipe_name_placeholder: "Örn: Ev Yapımı Mantı",
      desc_label: "Kısa Açıklama", desc_placeholder: "Bu tarif hakkında biraz bilgi verin...",
      section_ingredients: "Malzemeler", ingredient_placeholder: "Malzeme (Örn: Un)", qty_placeholder: "Miktar (Örn: 2 bardak)",
      add_ingredient_button: "Malzeme Ekle", section_instructions: "Yapılışı *", instructions_placeholder: "Adım adım nasıl yapıldığını anlatın...",
      save_error_generic: "Tarif kaydedilirken bir hata oluştu.", connection_error: "Bağlantı hatası."
    },
    cooking: {
      start_cooking: "Pişirmeye Başla", timer_finished: "Süre doldu!", pause: "Duraklat", start_timer: "Zamanlayıcıyı Başlat",
      previous: "Geri", finish: "Bitir", next: "İleri", step_progress: "Adım {current} / {total}",
      added_to_list: "Listeye Eklendi ✓", add_all_to_list: "Tümünü Listeye Ekle"
    },
    components: {
      add_to_collection_title: "Koleksiyona Ekle", create_collection_button: "Yeni Koleksiyon Oluştur",
      collection_name_placeholder: "Koleksiyon adı", add_button: "Ekle", no_collections_title: "Henüz koleksiyonunuz yok.",
      no_collections_desc: "Yukarıdan bir tane oluşturun!", added_success: "Eklendi ✓", recipes_count: "tarif",
      delete_error: "Tarif silinemedi.", error_generic: "Bir hata oluştu.", save_error: "Kaydedilemedi. Lütfen tekrar deneyin.",
      image_size_error: "Resim 3MB'dan küçük olmalıdır.", edit: "Düzenle", delete: "Sil", edit_recipe_title: "Tarifi Düzenle",
      title_label: "Başlık", description_label: "Açıklama", recipe_photo_label: "Tarif Fotoğrafı", change: "Değiştir",
      remove: "Kaldır", choose_photo: "Fotoğraf Seç", photo_formats: "JPG, PNG — maks 3MB", quantity_label: "Miktar",
      step_add_button: "Adım Ekle", confirm_delete_title: "Tarifi Sil", confirm_delete_msg: "Bu tarifi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      confirm_yes: "Evet, Sil", confirm_no: "Vazgeç", saving: "Kaydediliyor..."
    },
    share_target: {
      analyzing: "Paylaşılan içerik analiz ediliyor...", extracting: "Tarif detayları çıkarılıyor...", generating: "Yapay zeka tarifi oluşturuluyor..."
    },
    saved: {
      empty_collection: "Koleksiyon Boş", empty_collection_desc: "Bu koleksiyona henüz tarif eklenmemiş.",
      add_recipe: "Tarif Ekle", search_placeholder: "Tarif ara...", no_recipes_found: "Tarif bulunamadı",
      delete_collection_title: "Koleksiyonu Sil", delete_collection_msg: "Bu koleksiyonu ve içindeki tüm tariflerin bağlantısını kalıcı olarak silmek istediğinize emin misiniz?",
      remove_recipe_title: "Tarifi Çıkar", remove_recipe_msg: "Bu tarifi koleksiyondan çıkarmak istediğinize emin misiniz?",
      confirm_remove: "Evet, Çıkar", minutes_abbr: "dk", delete_error: "Tarif silinemedi.", error_generic: "Bir hata oluştu."
    },
    shopping: {
      no_lists_desc: "Bir tarife gidin ve planlamaya başlamak için 'Tümünü Listeye Ekle' butonuna tıklayın."
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
      generate_report: "Generate Monthly Report", analyzing: "Analyzing...",
      alert_food_name: "Please enter a food name first.", alert_auto_value_failed: "Failed to fetch auto value.",
      today_label: "Today", weight_placeholder: "Enter today's weight (kg)",
      meal_times: { Breakfast: "Breakfast", Lunch: "Lunch", Dinner: "Dinner", Snack: "Snack" }
    },
    pantry: {
      title: "My Pantry", subtitle: "What's in your fridge? Select ingredients and let AI do the magic.",
      search_placeholder: "Search or add custom ingredient...", selected_ingredients: "Selected Ingredients", items: "items",
      generate_recipe: "Generate Recipe", creating_magic: "Creating magic...",
      alert_generate_failed: "Error generating recipe from pantry.",
      common_ingredients: {
        Chicken: "Chicken", Beef: "Beef", Fish: "Fish", Eggs: "Eggs", Milk: "Milk",
        Cheese: "Cheese", Butter: "Butter", Rice: "Rice", Pasta: "Pasta", Bread: "Bread",
        Potato: "Potato", Tomato: "Tomato", Onion: "Onion", Garlic: "Garlic", Carrot: "Carrot",
        Mushroom: "Mushroom", Spinach: "Spinach", Broccoli: "Broccoli", Lemon: "Lemon", Beans: "Beans"
      }
    },
    plan: {
      title: "Meal Plan", subtitle: "Plan your week ahead with ease.", no_meals: "No meals planned yet.",
      add_meal: "Add Meal", for_date: "For", meal_time: "Meal Time", what_to_eat: "What to eat?",
      custom_meal: "Custom Meal", saved_recipe: "Saved Recipe", custom_placeholder: "e.g. Avocado Toast with Egg",
      select_recipe: "Select a saved recipe...", no_saved_recipes: "No saved recipes yet.",
      adding: "Adding...", add_to_plan: "Add to Plan"
    },
    my_recipes: {
      title: "My Cookbook", subtitle: "You can list and edit your custom recipes here.",
      no_recipes_title: "No Custom Recipes Yet", no_recipes_desc: "Your custom cookbook is empty. Start by adding a new recipe!",
      add_new_button: "Add New Recipe", no_image: "No Image", custom_tag: "Custom"
    },
    new_recipe: {
      title: "Add New Recipe", save_button: "Save", magic_scan_title: "Magic Scan",
      magic_scan_desc: "Take a photo of your handwritten recipe or cookbook page, and AI will read and auto-fill the form for you!",
      scanning: "Scanning...", photo_select_button: "Choose / Take Photo",
      scan_error: "Could not scan image. Please upload a clearer photo.", scan_error_generic: "An error occurred during scanning.",
      change_image: "Change Image", add_image: "Add Recipe Image", tap_click: "Tap or click", step_number: "Step",
      section_basic_info: "Basic Info", recipe_name_label: "Recipe Name *", recipe_name_placeholder: "e.g. Homemade Pasta",
      desc_label: "Short Description", desc_placeholder: "Provide a brief description of this recipe...",
      section_ingredients: "Ingredients", ingredient_placeholder: "Ingredient (e.g. Flour)", qty_placeholder: "Qty (e.g. 2 cups)",
      add_ingredient_button: "Add Ingredient", section_instructions: "Instructions *", instructions_placeholder: "Explain step-by-step how to cook...",
      save_error_generic: "An error occurred while saving the recipe.", connection_error: "Connection error."
    },
    cooking: {
      start_cooking: "Start Cooking", timer_finished: "Timer finished!", pause: "Pause", start_timer: "Start Timer",
      previous: "Previous", finish: "Finish", next: "Next", step_progress: "Step {current} of {total}",
      added_to_list: "Added to List ✓", add_all_to_list: "Add All to List"
    },
    components: {
      add_to_collection_title: "Add to Collection", create_collection_button: "Create New Collection",
      collection_name_placeholder: "Collection name", add_button: "Add", no_collections_title: "You don't have any collections yet.",
      no_collections_desc: "Create one above!", added_success: "Added ✓", recipes_count: "recipes",
      delete_error: "Failed to delete recipe.", error_generic: "An error occurred.", save_error: "Failed to save. Please try again.",
      image_size_error: "Image must be smaller than 3MB.", edit: "Edit", delete: "Delete", edit_recipe_title: "Edit Recipe",
      title_label: "Title", description_label: "Description", recipe_photo_label: "Recipe Photo", change: "Change",
      remove: "Remove", choose_photo: "Choose Photo", photo_formats: "JPG, PNG — max 3MB", quantity_label: "Quantity",
      step_add_button: "Add Step", confirm_delete_title: "Delete Recipe", confirm_delete_msg: "Are you sure you want to permanently delete this recipe? This cannot be undone.",
      confirm_yes: "Yes, Delete", confirm_no: "Cancel", saving: "Saving..."
    },
    share_target: {
      analyzing: "Analyzing shared content...", extracting: "Extracting recipe details...", generating: "Generating magic recipe..."
    },
    saved: {
      empty_collection: "Collection is Empty", empty_collection_desc: "No recipes have been added to this collection yet.",
      add_recipe: "Add Recipe", search_placeholder: "Search recipe...", no_recipes_found: "No recipes found",
      delete_collection_title: "Delete Collection", delete_collection_msg: "Are you sure you want to permanently delete this collection and unlink all its recipes?",
      remove_recipe_title: "Remove Recipe", remove_recipe_msg: "Are you sure you want to remove this recipe from the collection?",
      confirm_remove: "Yes, Remove", minutes_abbr: "m", delete_error: "Failed to delete recipe.", error_generic: "An error occurred."
    },
    shopping: {
      no_lists_desc: "Go to a recipe and tap the 'Add All to List' button to start planning."
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
      generate_report: "Generar Reporte Mensual", analyzing: "Analizando...",
      alert_food_name: "Por favor, introduce un nombre de comida primero.", alert_auto_value_failed: "No se pudo obtener el valor automático.",
      today_label: "Hoy", weight_placeholder: "Introduce el peso de hoy (kg)",
      meal_times: { Breakfast: "Desayuno", Lunch: "Almuerzo", Dinner: "Cena", Snack: "Merienda" }
    },
    pantry: {
      title: "Mi Despensa", subtitle: "¿Qué hay en tu nevera? Selecciona ingredientes y deja que la IA haga su magia.",
      search_placeholder: "Buscar o añadir ingrediente...", selected_ingredients: "Ingredientes Seleccionados", items: "artículos",
      generate_recipe: "Generar Receta", creating_magic: "Creando magia...",
      alert_generate_failed: "Error al generar la receta desde la despensa.",
      common_ingredients: {
        Chicken: "Pollo", Beef: "Ternera", Fish: "Pescado", Eggs: "Huevos", Milk: "Leche",
        Cheese: "Queso", Butter: "Mantequilla", Rice: "Arroz", Pasta: "Pasta", Bread: "Pan",
        Potato: "Patata", Tomato: "Tomate", Onion: "Cebolla", Garlic: "Ajo", Carrot: "Zanahoria",
        Mushroom: "Champiñón", Spinach: "Espinaca", Broccoli: "Brócoli", Lemon: "Limón", Beans: "Alubias"
      }
    },
    plan: {
      title: "Plan de comidas", subtitle: "Planifica tu semana con facilidad.", no_meals: "No hay comidas planificadas aún.",
      add_meal: "Añadir comida", for_date: "Para", meal_time: "Momento de la comida", what_to_eat: "¿Qué comer?",
      custom_meal: "Comida personalizada", saved_recipe: "Receta guardada", custom_placeholder: "Ej. Tostada de aguacate con huevo",
      select_recipe: "Selecciona una receta guardada...", no_saved_recipes: "No hay recetas guardadas aún.",
      adding: "Añadiendo...", add_to_plan: "Añadir al plan"
    },
    my_recipes: {
      title: "Mi recetario", subtitle: "Puedes listar y editar tus recetas personalizadas aquí.",
      no_recipes_title: "No hay recetas aún", no_recipes_desc: "Tu recetario personalizado está vacío. ¡Empieza por añadir una nueva receta!",
      add_new_button: "Añadir nueva receta", no_image: "Sin imagen", custom_tag: "Personalizado"
    },
    new_recipe: {
      title: "Añadir nueva receta", save_button: "Guardar", magic_scan_title: "Escaneo mágico",
      magic_scan_desc: "¡Toma una foto de tu receta escrita a mano o de una página de libro, y la IA la leerá y completará el formulario por ti!",
      scanning: "Escaneando...", photo_select_button: "Seleccionar / Tomar foto",
      scan_error: "No se pudo escanear la imagen. Por favor sube una foto más clara.", scan_error_generic: "Ocurrió un error durante el escaneo.",
      change_image: "Cambiar imagen", add_image: "Añadir imagen de receta", tap_click: "Toca o haz clic", step_number: "Paso",
      section_basic_info: "Información básica", recipe_name_label: "Nombre de la receta *", recipe_name_placeholder: "Ej. Pasta caera",
      desc_label: "Descripción corta", desc_placeholder: "Proporciona una breve descripción de esta receta...",
      section_ingredients: "Ingredientes", ingredient_placeholder: "Ingrediente (Ej. Harina)", qty_placeholder: "Cant. (Ej. 2 tazas)",
      add_ingredient_button: "Añadir ingrediente", section_instructions: "Instrucciones *", instructions_placeholder: "Explica paso a paso cómo cocinar...",
      save_error_generic: "Ocurrió un error al guardar la receta.", connection_error: "Error de conexión."
    },
    cooking: {
      start_cooking: "Empezar a cocinar", timer_finished: "¡Tiempo terminado!", pause: "Pausar", start_timer: "Iniciar temporizador",
      previous: "Anterior", finish: "Terminar", next: "Siguiente", step_progress: "Paso {current} de {total}",
      added_to_list: "Añadido a la lista ✓", add_all_to_list: "Añadir todo a la lista"
    },
    components: {
      add_to_collection_title: "Añadir a la colección", create_collection_button: "Crear nueva colección",
      collection_name_placeholder: "Nombre de la colección", add_button: "Añadir", no_collections_title: "No tienes colecciones aún.",
      no_collections_desc: "¡Crea una arriba!", added_success: "Añadido ✓", recipes_count: "recetas",
      delete_error: "No se pudo eliminar la receta.", error_generic: "Ocurrió un error.", save_error: "No se pudo guardar. Inténtalo de nuevo.",
      image_size_error: "La imagen debe ser menor de 3MB.", edit: "Editar", delete: "Eliminar", edit_recipe_title: "Editar receta",
      title_label: "Título", description_label: "Descripción", recipe_photo_label: "Foto de la receta", change: "Cambiar",
      remove: "Eliminar", choose_photo: "Elegir foto", photo_formats: "JPG, PNG — máx 3MB", quantity_label: "Cantidad",
      step_add_button: "Añadir paso", confirm_delete_title: "Eliminar receta", confirm_delete_msg: "¿Estás seguro de que quieres eliminar esta receta de forma permanente? No se puede deshacer.",
      confirm_yes: "Sí, eliminar", confirm_no: "Cancelar", saving: "Guardando..."
    },
    share_target: {
      analyzing: "Analizando contenido compartido...", extracting: "Extrayendo detalles de la receta...", generating: "Generando receta mágica..."
    },
    saved: {
      empty_collection: "Colección vacía", empty_collection_desc: "Aún no se han añadido recetas a esta colección.",
      add_recipe: "Añadir receta", search_placeholder: "Buscar receta...", no_recipes_found: "No se encontraron recetas",
      delete_collection_title: "Eliminar colección", delete_collection_msg: "¿Estás seguro de que quieres eliminar esta colección y desvincular todas sus recetas permanentemente?",
      remove_recipe_title: "Quitar receta", remove_recipe_msg: "¿Estás seguro de que quieres quitar esta receta de la colección?",
      confirm_remove: "Sí, quitar", minutes_abbr: "min", delete_error: "No se pudo eliminar la receta.", error_generic: "Ocurrió un error."
    },
    shopping: {
      no_lists_desc: "Ve a una receta y toca el botón 'Añadir todo a la lista' para empezar a planificar."
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
      generate_report: "生成月度报告", analyzing: "分析中...",
      alert_food_name: "请先输入食物名称。", alert_auto_value_failed: "无法获取自动值。",
      today_label: "今天", weight_placeholder: "输入今天的体重 (kg)",
      meal_times: { Breakfast: "早餐", Lunch: "午餐", Dinner: "晚餐", Snack: "零食" }
    },
    pantry: {
      title: "我的储藏室", subtitle: "冰箱里有什么？选择食材，让 AI 发挥魔力。",
      search_placeholder: "搜索或添加自定义食材...", selected_ingredients: "已选食材", items: "件",
      generate_recipe: "生成食谱", creating_magic: "正在创造魔力...",
      alert_generate_failed: "从储藏室生成食谱失败。",
      common_ingredients: {
        Chicken: "鸡肉", Beef: "牛肉", Fish: "鱼肉", Eggs: "鸡蛋", Milk: "牛奶",
        Cheese: "芝士", Butter: "黄油", Rice: "米饭", Pasta: "意面", Bread: "面包",
        Potato: "土豆", Tomato: "番茄", Onion: "洋葱", Garlic: "大蒜", Carrot: "胡萝卜",
        Mushroom: "蘑菇", Spinach: "菠菜", Broccoli: "西兰花", Lemon: "柠檬", Beans: "豆类"
      }
    },
    plan: {
      title: "餐食计划", subtitle: "轻松计划您的一周。", no_meals: "尚未计划餐食。",
      add_meal: "添加餐食", for_date: "对于", meal_time: "用餐时间", what_to_eat: "吃什么？",
      custom_meal: "自定义餐食", saved_recipe: "已保存食谱", custom_placeholder: "例如：鸡蛋牛油果吐司",
      select_recipe: "选择已保存的食谱...", no_saved_recipes: "暂无已保存的食谱。",
      adding: "正在添加...", add_to_plan: "添加到计划"
    },
    my_recipes: {
      title: "我的食谱书", subtitle: "您可以在这里列出并编辑您的自定义食谱。",
      no_recipes_title: "暂无自定义食谱", no_recipes_desc: "您的自定义食谱书是空的。从添加新食谱开始吧！",
      add_new_button: "添加新食谱", no_image: "无图片", custom_tag: "自定义"
    },
    new_recipe: {
      title: "添加新食谱", save_button: "保存", magic_scan_title: "魔法扫描",
      magic_scan_desc: "拍下您的手写食谱或食谱书页，AI 将为您读取并自动填写表单！",
      scanning: "正在扫描...", photo_select_button: "选择/拍摄照片",
      scan_error: "无法扫描图片。请上传更清晰的照片。", scan_error_generic: "扫描期间发生错误。",
      change_image: "更改图片", add_image: "添加食谱图片", tap_click: "轻点或点击", step_number: "步骤",
      section_basic_info: "基本信息", recipe_name_label: "食谱名称 *", recipe_name_placeholder: "例如：自制意面",
      desc_label: "简短描述", desc_placeholder: "提供此食谱的简短描述...",
      section_ingredients: "食材", ingredient_placeholder: "食材（例如：面粉）", qty_placeholder: "用量（例如：2 杯）",
      add_ingredient_button: "添加食材", section_instructions: "步骤 *", instructions_placeholder: "逐步解释如何烹饪...",
      save_error_generic: "保存食谱时发生错误。", connection_error: "连接错误。"
    },
    cooking: {
      start_cooking: "开始烹饪", timer_finished: "计时结束！", pause: "暂停", start_timer: "开始计时",
      previous: "上一步", finish: "完成", next: "下一步", step_progress: "步骤 {current} / {total}",
      added_to_list: "已添加到列表 ✓", add_all_to_list: "全部添加到列表"
    },
    components: {
      add_to_collection_title: "添加到收藏", create_collection_button: "创建新收藏",
      collection_name_placeholder: "收藏名称", add_button: "添加", no_collections_title: "您还没有任何收藏。",
      no_collections_desc: "在上方创建一个！", added_success: "已添加 ✓", recipes_count: "食谱",
      delete_error: "无法删除食谱。", error_generic: "发生错误。", save_error: "保存失败。请重试。",
      image_size_error: "图片必须小于 3MB。", edit: "编辑", delete: "删除", edit_recipe_title: "编辑食谱",
      title_label: "标题", description_label: "描述", recipe_photo_label: "食谱照片", change: "更改",
      remove: "移除", choose_photo: "选择照片", photo_formats: "JPG, PNG — 最大 3MB", quantity_label: "用量",
      step_add_button: "添加步骤", confirm_delete_title: "删除食谱", confirm_delete_msg: "您确定要永久删除此食谱吗？此操作无法撤销。",
      confirm_yes: "是的，删除", confirm_no: "取消", saving: "正在保存..."
    },
    share_target: {
      analyzing: "正在分析分享的内容...", extracting: "正在提取食谱详情...", generating: "正在生成魔力食谱..."
    },
    saved: {
      empty_collection: "收藏为空", empty_collection_desc: "此收藏中尚未添加食谱。",
      add_recipe: "添加食谱", search_placeholder: "搜索食谱...", no_recipes_found: "未找到食谱",
      delete_collection_title: "删除收藏", delete_collection_msg: "您确定要永久删除此收藏并取消关联其所有食谱吗？",
      remove_recipe_title: "移除食谱", remove_recipe_msg: "您确定要从收藏中移除此食谱吗？",
      confirm_remove: "是的，移除", minutes_abbr: "分", delete_error: "无法删除食谱。", error_generic: "发生错误。"
    },
    shopping: {
      no_lists_desc: "前往食谱并点击“全部添加到列表”按钮开始规划。"
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
      generate_report: "मासिक रिपोर्ट तैयार करें", analyzing: "विश्लेषण कर रहा है...",
      alert_food_name: "कृपया पहले भोजन का नाम दर्ज करें।", alert_auto_value_failed: "स्वतः मान प्राप्त करने में विफल।",
      today_label: "आज", weight_placeholder: "आज का वजन दर्ज करें (kg)",
      meal_times: { Breakfast: "नाश्ता", Lunch: "दोपहर का भोजन", Dinner: "रात का खाना", Snack: "स्नैक" }
    },
    pantry: {
      title: "मेरी पेंट्री", subtitle: "आपके फ्रिज में क्या है? सामग्री चुनें और AI को जादू करने दें।",
      search_placeholder: "खोजें या सामग्री जोड़ें...", selected_ingredients: "चयनित सामग्री", items: "आइटम",
      generate_recipe: "रेसिपी बनाएं", creating_magic: "जादू बन रहा है...",
      alert_generate_failed: "पेंट्री से रेसिपी बनाने में त्रुटि।",
      common_ingredients: {
        Chicken: "चिकन", Beef: "गोमांस", Fish: "मछली", Eggs: "अंडे", Milk: "दूध",
        Cheese: "पनीर", Butter: "मक्खन", Rice: "चावल", Pasta: "पास्ता", Bread: "ब्रेड",
        Potato: "आलू", Tomato: "टमाटर", Onion: "प्याज", Garlic: "लहसुन", Carrot: "गाजर",
        Mushroom: "मशरूम", Spinach: "पालक", Broccoli: "ब्रोकोली", Lemon: "नींबू", Beans: "सेम"
      }
    },
    plan: {
      title: "भोजन योजना", subtitle: "आसानी से अपने सप्ताह की योजना बनाएं।", no_meals: "अभी तक कोई भोजन नियोजित नहीं है।",
      add_meal: "भोजन जोड़ें", for_date: "के लिए", meal_time: "भोजन का समय", what_to_eat: "क्या खाएं?",
      custom_meal: "कस्टम भोजन", saved_recipe: "सहेजी गई रेसिपी", custom_placeholder: "जैसे अंडे के साथ एवोकैडो टोस्ट",
      select_recipe: "सहेजी गई रेसिपी चुनें...", no_saved_recipes: "अभी तक कोई सहेजी गई रेसिपी नहीं है।",
      adding: "जोड़ रहा है...", add_to_plan: "योजना में जोड़ें"
    },
    my_recipes: {
      title: "मेरी रसोई की किताब", subtitle: "आप यहाँ अपनी कस्टम रेसिपी सूचीबद्ध और संपादित कर सकते हैं।",
      no_recipes_title: "अभी तक कोई कस्टम रेसिपी नहीं है", no_recipes_desc: "आपकी कस्टम रसोई की किताब खाली है। एक नई रेसिपी जोड़कर शुरू करें!",
      add_new_button: "नई रेसिपी जोड़ें", no_image: "कोई छवि नहीं", custom_tag: "कस्टम"
    },
    new_recipe: {
      title: "नई रेसिपी जोड़ें", save_button: "सहेजें", magic_scan_title: "जादुई स्कैन",
      magic_scan_desc: "अपनी हस्तलिखित रेसिपी या रसोई की किताब के पन्ने की एक तस्वीर लें, और AI आपके लिए फॉर्म को पढ़कर स्वचालित रूप से भर देगा!",
      scanning: "स्कैन हो रहा है...", photo_select_button: "तवीर चुनें / लें",
      scan_error: "छवि को स्कैन नहीं किया जा सका। कृपया अधिक स्पष्ट तस्वीर अपलोड करें।", scan_error_generic: "स्कैनिंग के दौरान एक त्रुटि हुई।",
      change_image: "छवि बदलें", add_image: "रेसिपी छवि जोड़ें", tap_click: "टैप या क्लिक करें", step_number: "कदम",
      section_basic_info: "मूल जानकारी", recipe_name_label: "रेसिपी का नाम *", recipe_name_placeholder: "जैसे घर का बना पास्ता",
      desc_label: "संक्षिप्त विवरण", desc_placeholder: "इस रेसिपी का संक्षिप्त विवरण प्रदान करें...",
      section_ingredients: "सामग्री", ingredient_placeholder: "सामग्री (जैसे आटा)", qty_placeholder: "मात्रा (जैसे कप)",
      add_ingredient_button: "सामग्री जोड़ें", section_instructions: "निर्देश *", instructions_placeholder: "कदम-दर-कदम समझाएं कि कैसे पकाना है...",
      save_error_generic: "रेसिपी सहेजते समय एक त्रुटि हुई।", connection_error: "कनेक्शन त्रुटि।"
    },
    cooking: {
      start_cooking: "पकाना शुरू करें", timer_finished: "टाइमर समाप्त!", pause: "रोकें", start_timer: "टाइमर शुरू करें",
      previous: "पिछला", finish: "समाप्त", next: "अगला", step_progress: "कदम {current} / {total}",
      added_to_list: "सूची में जोड़ा गया ✓", add_all_to_list: "सभी को सूची में जोड़ें"
    },
    components: {
      add_to_collection_title: "संग्रह में जोड़ें", create_collection_button: "नया संग्रह बनाएं",
      collection_name_placeholder: "संग्रह का नाम", add_button: "जोड़ें", no_collections_title: "आपके पास अभी तक कोई संग्रह नहीं है।",
      no_collections_desc: "ऊपर एक बनाएं!", added_success: "जोड़ा गया ✓", recipes_count: "रेसिपी",
      delete_error: "रेसिपी हटाने में विफल।", error_generic: "एक त्रुटि हुई।", save_error: "सहेजने में विफल। कृपया पुन: प्रयास करें।",
      image_size_error: "छवि 3MB से छोटी होनी चाहिए।", edit: "संपादित करें", delete: "हटाएं", edit_recipe_title: "रेसिपी संपादित करें",
      title_label: "शीर्षक", description_label: "विवरण", recipe_photo_label: "रेसिपी फोटो", change: "बदलें",
      remove: "हटाएं", choose_photo: "फोटो चुनें", photo_formats: "JPG, PNG — अधिकतम 3MB", quantity_label: "मात्रा",
      step_add_button: "कदम जोड़ें", confirm_delete_title: "रेसिपी हटाएं", confirm_delete_msg: "क्या आप वाकई इस रेसिपी को स्थायी रूप से हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।",
      confirm_yes: "हाँ, हटाएं", confirm_no: "रद्द करें", saving: "सहेज रहा है..."
    },
    share_target: {
      analyzing: "साझा की गई सामग्री का विश्लेषण किया जा रहा है...", extracting: "रेसिपी विवरण निकाले जा रहे हैं...", generating: "जादुई रेसिपी बनाई जा रही है..."
    },
    saved: {
      empty_collection: "संग्रह खाली है", empty_collection_desc: "इस संग्रह में अभी तक कोई रेसिपी नहीं जोड़ी गई है।",
      add_recipe: "रेसिपी जोड़ें", search_placeholder: "रेसिपी खोजें...", no_recipes_found: "कोई रेसिपी नहीं मिली",
      delete_collection_title: "संग्रह हटाएं", delete_collection_msg: "क्या आप वाकई इस संग्रह को स्थायी रूप से हटाना चाहते हैं और इसकी सभी रेसिपी को अनलिंक करना चाहते हैं?",
      remove_recipe_title: "रेसिपी निकालें", remove_recipe_msg: "क्या आप वाकई इस रेसिपी को संग्रह से निकालना चाहते हैं?",
      confirm_remove: "हाँ, निकालें", minutes_abbr: "म", delete_error: "रेसिपी हटाने में विफल।", error_generic: "एक त्रुटि हुई।"
    },
    shopping: {
      no_lists_desc: "किसी रेसिपी पर जाएं और योजना बनाना शुरू करने के लिए 'सभी को सूची में जोड़ें' बटन पर टैप करें।"
    }
  }
};

locales.forEach(loc => {
  const fp = path.join(dictsDir, loc + '.json');
  if (fs.existsSync(fp)) {
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    // Merge existing keys with additions
    Object.keys(additions[loc]).forEach(key => {
      data[key] = {
        ...(data[key] || {}),
        ...additions[loc][key]
      };
    });
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  }
});

console.log("Dictionaries updated successfully.");
