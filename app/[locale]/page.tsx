"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChefHat, Sparkles, Plus, Calendar, Bookmark, Search, Home as HomeIcon, Clock, Flame, Dice5, Refrigerator, HeartPulse, LogOut, LogIn, ShoppingCart, ChevronRight, Settings, Book, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/store/useAppStore";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { recipes, isRecipesLoaded, fetchRecipes } = useAppStore();

  // Pull-to-refresh state
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 72;

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    fetchRecipes();
    if (!localStorage.getItem("recipe_tutorial_seen")) {
      setShowTutorial(true);
    }
  }, [fetchRecipes]);

  const dismissTutorial = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTutorial(false);
    localStorage.setItem("recipe_tutorial_seen", "true");
  };

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY !== 0 || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.4, PULL_THRESHOLD + 20));
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullY >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullY(0);
      await fetchRecipes();
      setIsRefreshing(false);
    } else {
      setPullY(0);
    }
  }, [pullY, fetchRecipes]);

  // Session is now managed by useSession hook — no manual fetch needed

  const SOCIAL_DOMAINS = ["instagram.com", "tiktok.com", "twitter.com", "x.com", "facebook.com"];
  const isSocialUrl = (url: string) => {
    try {
      const h = new URL(url.trim()).hostname.replace("www.", "");
      return SOCIAL_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`));
    } catch { return false; }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);

    const isLink = prompt.trim().startsWith("http");
    const isSocial = isLink && isSocialUrl(prompt);

    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider: "groq" }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.details || errorData?.error || "Failed to generate recipe");
      }
      
      const data = await res.json();
      // Refresh recipe list immediately so it appears when user comes back
      await fetchRecipes();
      setPrompt("");
      router.push(`/recipe/${data.id}`);
    } catch (error: any) {
      if (isSocial) {
        alert("Instagram/TikTok linkleri direkt okunamıyor (giriş gerektiriyor). Lütfen yemek adını yazarak deneyin.\n\nÖrnek: 'Mantarlı Makarna' veya 'Sucuklu Yumurta'");
      } else {
        alert("Hata oluştu: " + error.message);
      }
      console.error(error);
      setLoading(false);
    }
  };


  const generateRandom = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/random");
      if (!res.ok) throw new Error("Failed to generate random recipe");
      
      const data = await res.json();
      // Refresh list immediately
      await fetchRecipes();
      router.push(`/recipe/${data.id}`);
    } catch (error) {
      alert("Hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen pb-24 bg-background text-foreground font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div
        style={{
          height: isRefreshing ? 56 : pullY,
          transition: pullY === 0 ? "height 0.3s ease" : "none",
          overflow: "hidden",
        }}
        className="flex items-center justify-center"
      >
        <div className={`flex items-center gap-2 text-sm font-medium text-[var(--primary)] ${
          isRefreshing ? "opacity-100" : pullY > 40 ? "opacity-100" : "opacity-0"
        } transition-opacity`}>
          <div className={`w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full ${
            isRefreshing ? "animate-spin" : ""
          }`} style={{ transform: !isRefreshing ? `rotate(${pullY * 3}deg)` : undefined }} />
          {isRefreshing ? "Yenileniyor..." : "Yenilemek için bırakın"}
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        {/* Header Profile */}
        <header className="px-6 pt-12 pb-6 flex justify-between items-center">
          <div className="flex items-center gap-4 relative">
            {sessionLoading ? (
              // Skeleton to prevent Welcome Guest flash
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="w-12 h-3 bg-slate-200 rounded animate-pulse" />
                  <div className="w-28 h-5 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ) : session?.user ? (
              <>
                <div 
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-14 h-14 rounded-full bg-secondary border-2 border-white overflow-hidden shadow-sm group-hover:shadow-md transition-shadow relative">
                    <Image src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name || 'User'}&background=FFB5A7&color=fff`} alt="Avatar" fill sizes="56px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Merhaba,</p>
                    <h1 className="text-xl font-bold tracking-wide text-slate-600">{session.user.name}</h1>
                  </div>
                </div>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute top-[70px] left-0 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-50 py-2">
                    <Link href="/settings" className="w-full text-left px-4 py-3 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors">
                      <Settings size={18} className="text-slate-400" />
                      <span className="font-medium text-sm">Ayarlar</span>
                    </Link>
                    <div className="h-px w-full bg-slate-50 my-1"></div>
                    <button 
                      onClick={() => signOut()} 
                      className="w-full text-left px-4 py-3 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <LogOut size={18} className="text-rose-500" />
                      <span className="font-medium text-sm">Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-slate-400 font-medium">Hoş geldin,</p>
                <h1 className="text-xl font-bold tracking-wide text-slate-600">Misafir</h1>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!sessionLoading && !session?.user && (
              <Link href="/login" className="px-4 py-2 bg-[var(--primary)] text-white rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
                <LogIn size={16} /> Giriş Yap
              </Link>
            )}
            {!sessionLoading && session?.user && (
              <>
                <Link href="/my-recipes" className="relative group" onClick={() => { setShowTutorial(false); localStorage.setItem("recipe_tutorial_seen", "true"); }}>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
                    <Book size={20} className="text-slate-400 group-hover:text-[var(--primary)] transition-colors" />
                    {showTutorial && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  
                  {/* Tutorial Coachmark */}
                  {showTutorial && (
                    <div className="absolute top-[130%] -right-2 w-56 bg-slate-800 text-white p-4 rounded-2xl shadow-xl z-50 animate-[bounce_2s_infinite]">
                      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-slate-800 rotate-45"></div>
                      <button 
                        onClick={dismissTutorial}
                        className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <p className="text-sm font-medium mt-1">
                        <span className="font-bold text-[var(--primary)] block mb-1">Yeni!</span>
                        Kendi tariflerinizi ekledikten sonra bu defterden ulaşabilirsiniz.
                      </p>
                    </div>
                  )}
                </Link>
                <Link href="/shopping">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <ShoppingCart size={20} className="text-slate-400 hover:text-emerald-500 transition-colors" />
                  </div>
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="px-6 space-y-10 mt-2">
          {/* Main Content Grid for Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column (Banner & Input) */}
            <div className="flex flex-col gap-8">
              
              {/* AI Input Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4 order-2 md:order-1"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-slate-600">What's your craving?</h3>
                </div>
                
                <div className="bg-white rounded-[2rem] p-2 pl-6 flex items-center shadow-md border border-slate-100 relative overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-[var(--primary)]">Crafting your recipe...</span>
                    </div>
                  )}
                  <Search size={22} className="text-slate-300 flex-shrink-0" />
                  <Input 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="e.g. A healthy avocado toast..." 
                    className="border-0 bg-transparent text-slate-600 placeholder:text-slate-400 focus-visible:ring-0 shadow-none text-base h-14"
                    disabled={loading}
                  />
                  <button 
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-transform hover:scale-105 active:scale-95 shadow-md"
                  >
                    <Sparkles size={20} />
                  </button>
                </div>

                <div className="mt-5">
                  <button 
                    onClick={generateRandom}
                    disabled={loading}
                    className="w-full bg-[var(--primary)] text-white rounded-full py-4 px-6 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
                  >
                    <span className="text-[17px] tracking-wide">Bugün Ne Pişirsem?</span>
                  </button>
                  <Link href="/my-recipes/new">
                    <button 
                      className="w-full bg-white text-[var(--primary)] border-2 border-[var(--primary)] rounded-full py-4 px-6 font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[var(--primary)]/5 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none mt-4"
                    >
                      <Plus size={22} className="mr-2" />
                      <span className="text-[17px] tracking-wide">Kendi Tarifini Ekle</span>
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Main Banner */}
              {!isRecipesLoaded ? (
                <div className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-sm flex flex-col justify-end p-8 order-1 md:order-2 border border-slate-100 bg-slate-200 animate-pulse"></div>
              ) : recipes.length > 0 ? (
                <Link href={`/recipe/${recipes[0].id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-md flex flex-col justify-end p-8 order-1 md:order-2 border border-slate-100 group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-black/10 z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                    <Image 
                      src={recipes[0].images?.[0]?.url || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop"} 
                      className="object-cover z-0 group-hover:scale-105 transition-transform duration-500" 
                      alt={recipes[0].title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    <div className="relative z-20 text-white">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-3xl font-bold leading-tight line-clamp-2 pr-4 text-white drop-shadow-md">
                          {recipes[0].title}
                        </h2>
                      </div>
                      <p className="text-sm text-white/90 mb-4 line-clamp-1 max-w-[250px]">
                        {recipes[0].description}
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
                          <Clock size={16} className="text-white/80" />
                          {recipes[0].totalTime || 30}m
                        </div>
                        <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
                          <Flame size={16} className="text-white/80" />
                          {recipes[0].calories || 400} kcal
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-sm flex flex-col justify-end p-8 order-1 md:order-2 border border-slate-100"
                >
                  <div className="absolute inset-0 bg-white/40 z-0"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-white/10 z-10"></div>
                  <Image 
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop" 
                    className="object-cover z-0 opacity-80" 
                    alt="Healthy Food"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  <div className="relative z-20">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-3xl font-bold text-slate-700 leading-tight">
                        Healthy <br/>Living
                      </h2>
                      <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-[var(--primary)] cursor-pointer hover:bg-white transition-colors shadow-sm">
                        <Bookmark size={18} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
                      Discover nutritious meals tailored to your taste.
                    </p>
                    <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
                      See collection
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Right Column (Recent Recipes) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-slate-600">Recent Recipes</h3>
                <Link href="/saved">
                  <span className="text-sm text-[var(--primary)] font-medium cursor-pointer hover:underline">See all</span>
                </Link>
              </div>
              
              {!isRecipesLoaded ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-[1.5rem] h-48 bg-slate-200 animate-pulse"></div>
                  ))}
                </div>
              ) : recipes.length > 1 ? (
                <div className="grid grid-cols-2 gap-4">
                  {recipes.slice(1, 5).map((recipe, i) => (
                    <Link href={`/recipe/${recipe.id}`} key={recipe.id}>
                      <div className="rounded-[1.5rem] p-4 flex flex-col gap-3 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow bg-white h-full group">
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 relative">
                          <Image 
                            src={recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop"} 
                            alt={recipe.title} 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                        <span className="font-semibold text-sm text-slate-600 line-clamp-2 leading-tight">{recipe.title}</span>
                        <div className="mt-auto flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <Clock size={12} className="text-[var(--primary)]" />
                          {recipe.totalTime || 30}m
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[1.5rem] p-8 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center">
                  <ChefHat size={32} className="text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">Your new generated recipes will appear here.</p>
                </div>
              )}

              {/* Shopping List Link */}
              <Link href="/shopping" className="block mt-6">
                <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700">Alınacaklar Listesi</h3>
                      <p className="text-xs text-slate-400">Eksik malzemelerini tamamla</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[var(--primary)] transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}