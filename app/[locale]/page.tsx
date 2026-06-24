"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChefHat, Sparkles, Plus, Calendar, Bookmark, Search, Home as HomeIcon, Clock, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { recipes, isRecipesLoaded, fetchRecipes } = useAppStore();

  useEffect(() => {
    if (!isRecipesLoaded) {
      fetchRecipes();
    }
  }, [isRecipesLoaded, fetchRecipes]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider: "groq" }), // Using groq as requested, handled by custom logic
      });
      if (!res.ok) throw new Error("Failed to generate recipe");
      
      const data = await res.json();
      router.push(`/recipe/${data.id}`);
    } catch (error) {
      alert("Hata oluştu. Lütfen tekrar deneyin.");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Profile */}
        <header className="px-6 pt-12 pb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary border-2 border-white overflow-hidden shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Vanessa&background=FFB5A7&color=fff" alt="Avatar" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Hello,</p>
              <h1 className="text-xl font-bold tracking-wide text-slate-600">Vanessa</h1>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
            <div className="absolute top-3 right-3 w-2 h-2 bg-[var(--primary)] rounded-full"></div>
            <Bookmark size={20} className="text-slate-400" />
          </div>
        </header>

        <main className="px-6 space-y-10 mt-2">
          {/* Main Content Grid for Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column (Banner & Input) */}
            <div className="space-y-8 flex flex-col">
              
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
              </motion.div>

              {/* Main Banner */}
              {!isRecipesLoaded ? (
                <div className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-sm flex flex-col justify-end p-8 order-1 md:order-2 border border-slate-100 bg-slate-200 animate-pulse"></div>
              ) : recipes.length > 0 ? (
                <Link href={`/recipe/${recipes[0].id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-sm flex flex-col justify-end p-8 order-1 md:order-2 border border-slate-100 group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/40 z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-white/10 z-10 group-hover:from-white transition-colors duration-500"></div>
                    <img 
                      src={recipes[0].images?.[0]?.url || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop"} 
                      className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:scale-105 transition-transform duration-500" 
                      alt={recipes[0].title}
                    />
                    
                    <div className="relative z-20">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-3xl font-bold text-slate-700 leading-tight line-clamp-2 pr-4">
                          {recipes[0].title}
                        </h2>
                        <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-[var(--primary)] cursor-pointer hover:bg-white transition-colors shadow-sm flex-shrink-0">
                          <Bookmark size={18} />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-1 max-w-[250px]">
                        {recipes[0].description}
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-slate-600 text-sm font-semibold">
                          <Clock size={16} className="text-[var(--primary)]" />
                          {recipes[0].totalTime || 30}m
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 text-sm font-semibold">
                          <Flame size={16} className="text-[var(--primary)]" />
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
                  <img 
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
                    alt="Healthy Food"
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
                          <img 
                            src={recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop"} 
                            alt={recipe.title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
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
            </motion.div>
          </div>
        </main>
      </div>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-[4.5rem] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between px-3 z-40">
        <div className="w-16 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--primary)] shadow-sm">
          <HomeIcon size={22} />
        </div>
        <div className="flex-1 flex justify-around px-2">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <Search size={22} />
          </button>
          <Link href="/plan">
            <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
              <Calendar size={22} />
            </button>
          </Link>
          <Link href="/saved">
            <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
              <Bookmark size={22} />
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}