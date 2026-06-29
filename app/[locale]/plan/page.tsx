"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Plus, X, Utensils, Trash2, BookHeart } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useParams } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { useTranslationCache } from "@/hooks/useTranslationCache";

export default function MealPlannerPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const dict = useDictionary();
  const t = dict.plan;
  const tMealTimes = dict.health.meal_times;

  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [mealPlanItems, setMealPlanItems] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [customText, setCustomText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form State
  const [mealType, setMealType] = useState("Dinner");
  const [inputType, setInputType] = useState<"custom" | "recipe">("custom");

  const titlesToTranslate = [
    ...mealPlanItems.map(item => item.recipe?.title || ""),
    ...savedRecipes.map(r => r.title)
  ];
  const translatedTitles = useTranslationCache(titlesToTranslate, locale);

  const getTranslatedPlanTitle = (item: any) => {
    const idx = mealPlanItems.indexOf(item);
    if (idx !== -1 && item.recipe) {
      return translatedTitles[idx] || item.recipe.title;
    }
    return item.customText;
  };

  const getTranslatedSavedRecipeTitle = (recipeId: string) => {
    const idx = savedRecipes.findIndex(r => r.id === recipeId);
    if (idx !== -1) {
      return translatedTitles[mealPlanItems.length + idx] || savedRecipes[idx].title;
    }
    return "";
  };

  useEffect(() => {
    fetchMealPlan();
    fetchSavedRecipes();
  }, [currentWeekStart]);

  async function fetchMealPlan() {
    setLoading(true);
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    try {
      const res = await fetch(`/api/plan?startDate=${currentWeekStart.toISOString()}&endDate=${endOfWeek.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setMealPlanItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedRecipes() {
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setSavedRecipes(data.recipes || data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function getStartOfWeek(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const openAddModal = (date: Date) => {
    setSelectedDate(date);
    setCustomText("");
    setSelectedRecipeId("");
    setInputType("custom");
    setIsModalOpen(true);
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    if (inputType === "custom" && !customText.trim()) return;
    if (inputType === "recipe" && !selectedRecipeId) return;

    const payload = {
      date: selectedDate.toISOString(),
      mealType,
      customText: inputType === "custom" ? customText : null,
      recipeId: inputType === "recipe" ? selectedRecipeId : null,
    };

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchMealPlan();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const res = await fetch(`/api/plan?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMealPlanItems(items => items.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate an array of 7 days for the current week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden z-10">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
        
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
            <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center shadow-inner">
              <CalendarIcon size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed">{t.subtitle}</p>
        </div>
      </header>

      <main className="px-6 mt-8 max-w-xl mx-auto space-y-6">
        
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100">
          <button onClick={handlePrevWeek} className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {currentWeekStart.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} 
            {" - "} 
            {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
          </h2>
          
          <button onClick={handleNextWeek} className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days Grid */}
        <div className="space-y-4">
          {weekDays.map((day, i) => {
            const dateString = day.toISOString().split('T')[0];
            const dayItems = mealPlanItems.filter(item => item.date.startsWith(dateString));
            const isToday = new Date().toISOString().split('T')[0] === dateString;

            return (
              <motion.div
                key={dateString}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-[2rem] p-5 shadow-sm border transition-colors ${isToday ? 'border-[var(--primary)]/40 ring-2 ring-[var(--primary)]/10' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-[var(--primary)]' : 'text-slate-400'}`}>
                      {day.toLocaleDateString(locale, { weekday: 'long' })}
                    </span>
                    <span className="text-xl font-bold text-slate-700">{day.getDate()}</span>
                  </div>
                  <button 
                    onClick={() => openAddModal(day)} 
                    className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  {dayItems.length === 0 ? (
                    <p className="text-slate-400 text-sm font-medium">{t.no_meals}</p>
                  ) : (
                    dayItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-[var(--primary)]/70 uppercase tracking-wider">{tMealTimes[item.mealType as keyof typeof tMealTimes] || item.mealType}</span>
                          {item.recipe ? (
                            <Link href={`/recipe/${item.recipe.id}`}>
                              <span className="text-sm font-bold text-slate-700 hover:text-[var(--primary)] transition-colors line-clamp-1">{getTranslatedPlanTitle(item)}</span>
                            </Link>
                          ) : (
                            <span className="text-sm font-bold text-slate-700 line-clamp-1">{item.customText}</span>
                          )}
                        </div>
                        <button onClick={() => handleDeleteMeal(item.id)} className="w-8 h-8 rounded-full text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </main>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pb-32 z-[120] shadow-2xl border-t border-slate-100 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{t.add_meal}</h3>
                  <p className="text-sm text-slate-500 font-medium">{t.for_date} {selectedDate?.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddMeal} className="space-y-6">
                
                {/* Meal Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{t.meal_time}</label>
                  <div className="flex gap-2">
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border ${
                          mealType === type ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        }`}
                      >
                        {tMealTimes[type as keyof typeof tMealTimes] || type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{t.what_to_eat}</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-4">
                    <button
                      type="button"
                      onClick={() => setInputType("custom")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        inputType === "custom" ? "bg-white shadow-sm text-[var(--primary)]" : "text-slate-500"
                      }`}
                    >
                      <Utensils size={16} /> {t.custom_meal}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputType("recipe")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        inputType === "recipe" ? "bg-white shadow-sm text-[var(--primary)]" : "text-slate-500"
                      }`}
                    >
                      <BookHeart size={16} /> {t.saved_recipe}
                    </button>
                  </div>

                  {inputType === "custom" ? (
                    <input 
                      type="text" 
                      placeholder={t.custom_placeholder} 
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-transparent transition-all font-medium text-slate-700"
                      required
                    />
                  ) : (
                    <div className="relative z-[120]">
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 cursor-pointer flex justify-between items-center hover:bg-white hover:border-[var(--primary)]/30 transition-all font-medium text-slate-700"
                      >
                        <span className={selectedRecipeId ? "text-slate-700" : "text-slate-400"}>
                          {selectedRecipeId ? getTranslatedSavedRecipeTitle(selectedRecipeId) : t.select_recipe}
                        </span>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden z-[130] py-2"
                          >
                            {savedRecipes.length === 0 ? (
                              <div className="px-5 py-4 text-sm text-slate-400 text-center">{t.no_saved_recipes}</div>
                            ) : (
                              savedRecipes.map((r: any) => (
                                <div 
                                  key={r.id} 
                                  onClick={() => { setSelectedRecipeId(r.id); setIsDropdownOpen(false); }}
                                  className={`px-5 py-3 cursor-pointer hover:bg-slate-50 font-medium transition-colors ${selectedRecipeId === r.id ? 'text-[var(--primary)] bg-[var(--primary)]/5' : 'text-slate-700'}`}
                                >
                                  {getTranslatedSavedRecipeTitle(r.id)}
                                </div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[var(--primary)] text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2 relative z-10"
                >
                  <Plus size={20} /> {isSubmitting ? t.adding : t.add_to_plan}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
