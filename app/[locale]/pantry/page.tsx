"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Plus, X, Refrigerator, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDictionary } from "@/components/DictionaryProvider";

const COMMON_INGREDIENTS = [
  { name: "Chicken", emoji: "🍗", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Beef", emoji: "🥩", color: "bg-red-50 text-red-600 border-red-100" },
  { name: "Fish", emoji: "🐟", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Eggs", emoji: "🥚", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Milk", emoji: "🥛", color: "bg-sky-50 text-sky-600 border-sky-100" },
  { name: "Cheese", emoji: "🧀", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { name: "Butter", emoji: "🧈", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Rice", emoji: "🍚", color: "bg-slate-50 text-slate-600 border-slate-200" },
  { name: "Pasta", emoji: "🍝", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Bread", emoji: "🍞", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Potato", emoji: "🥔", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { name: "Tomato", emoji: "🍅", color: "bg-red-50 text-red-600 border-red-100" },
  { name: "Onion", emoji: "🧅", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "Garlic", emoji: "🧄", color: "bg-slate-50 text-slate-600 border-slate-200" },
  { name: "Carrot", emoji: "🥕", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Mushroom", emoji: "🍄", color: "bg-stone-50 text-stone-600 border-stone-200" },
  { name: "Spinach", emoji: "🥬", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { name: "Broccoli", emoji: "🥦", color: "bg-green-50 text-green-600 border-green-100" },
  { name: "Lemon", emoji: "🍋", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { name: "Beans", emoji: "🫘", color: "bg-red-50 text-red-800 border-red-200" },
];

export default function PantryPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const dict = useDictionary();
  const t = dict.pantry;

  const toggleIngredient = (name: string) => {
    if (ingredients.includes(name)) {
      setIngredients(ingredients.filter(i => i !== name));
    } else {
      setIngredients([...ingredients, name]);
    }
  };

  const addCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIngredient.trim()) return;
    if (!ingredients.includes(customIngredient.trim())) {
      setIngredients([...ingredients, customIngredient.trim()]);
    }
    setCustomIngredient("");
  };

  const removeIngredient = (name: string) => {
    setIngredients(ingredients.filter(i => i !== name));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, provider: "groq" }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      router.push(`/recipe/${data.id}`);
    } catch (error) {
      alert("Error generating recipe from pantry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                  <ChevronLeft size={20} />
                </div>
              </Link>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {t.title}
              </h1>
            </div>
            <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center shadow-inner">
              <Refrigerator size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed">{t.subtitle}</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-8 space-y-6">
        
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {COMMON_INGREDIENTS.map(ing => {
              const isSelected = ingredients.includes(ing.name);
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={ing.name}
                  onClick={() => toggleIngredient(ing.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50 shadow-sm' 
                      : `bg-white hover:bg-slate-50 ${ing.color.split(' ')[2]}`
                  }`}
                >
                  <span className="text-3xl mb-2 drop-shadow-sm">{ing.emoji}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-teal-700' : 'text-slate-600'}`}>
                    {ing.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <form onSubmit={addCustomIngredient} className="bg-white rounded-full p-2 shadow-sm border border-slate-100 flex items-center gap-2 transition-shadow focus-within:shadow-md focus-within:border-teal-200">
          <input 
            type="text" 
            placeholder={t.search_placeholder} 
            value={customIngredient}
            onChange={e => setCustomIngredient(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 placeholder:text-slate-400 font-medium"
          />
          <button type="submit" className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors shadow-sm">
            <Plus size={20} />
          </button>
        </form>

        <AnimatePresence>
          {ingredients.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                  {t.selected_ingredients}
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{ingredients.length} {t.items}</span>
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  <AnimatePresence>
                    {ingredients.map(ing => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={ing} 
                        className="bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                      >
                        {ing}
                        <button onClick={() => removeIngredient(ing)} className="hover:text-rose-400 transition-colors p-0.5 rounded-full hover:bg-white/10"><X size={14}/></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <button 
                  onClick={generateRecipe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-80 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      {t.creating_magic}
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} />
                      {t.generate_recipe}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
