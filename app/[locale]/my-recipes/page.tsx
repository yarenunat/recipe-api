"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, ChevronLeft, Plus, Image as ImageIcon, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { useTranslationCache } from "@/hooks/useTranslationCache";

export default function MyRecipesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const dict = useDictionary();
  const t = dict.my_recipes;

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const titlesToTranslate = recipes.map(r => r.title);
  const translatedTitles = useTranslationCache(titlesToTranslate, locale);
  const getTranslatedTitle = (index: number) => translatedTitles[index] || recipes[index]?.title;

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      const res = await fetch("/api/recipes/custom");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-32 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={20} />
              </div>
            </Link>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Book size={24} className="text-[var(--primary)]" /> {t.title}
            </h1>
          </div>
          <Link href="/my-recipes/new">
            <button className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-md hover:bg-[var(--primary)]/90 transition-colors">
              <Plus size={20} />
            </button>
          </Link>
        </div>
        <p className="text-slate-500 font-medium relative z-10">{t.subtitle}</p>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-200 animate-pulse h-48 rounded-[2rem]"></div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-20">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <Book size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">{t.no_recipes_title}</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-[250px]">{t.no_recipes_desc}</p>
            <Link href="/my-recipes/new">
              <button className="bg-[var(--primary)] text-white rounded-full py-4 px-8 font-bold shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2 hover:-translate-y-1 transition-transform">
                <Plus size={20} /> {t.add_new_button}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, idx) => (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 relative bg-slate-100">
                    {recipe.images && recipe.images.length > 0 ? (
                      <img src={recipe.images[0].url} alt={getTranslatedTitle(idx)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">{t.no_image}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                      <Book size={12} className="text-[var(--primary)]" /> {t.custom_tag}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">{getTranslatedTitle(idx)}</h3>
                    {recipe.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{recipe.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mt-4">
                      {recipe.calories && (
                        <div className="flex items-center gap-1">
                          <Flame size={14} className="text-orange-400" /> {recipe.calories} kcal
                        </div>
                      )}
                      {recipe.totalTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-blue-400" /> {recipe.totalTime} min
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
