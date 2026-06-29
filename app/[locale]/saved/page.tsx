"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Clock, Flame, ChefHat, Bookmark, Trash2, FolderOpen, Plus, X, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";
import { useTranslationCache } from "@/hooks/useTranslationCache";

export default function SavedRecipesPage() {
  const { recipes, isRecipesLoaded, fetchRecipes, setRecipes } = useAppStore();
  const dict = useDictionary();
  const t = dict.saved;
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  
  const titlesToTranslate = recipes.map((r: any) => r.title);
  const translatedTitles = useTranslationCache(titlesToTranslate, locale);
  const getTranslatedTitle = (index: number) => translatedTitles[index] || recipes[index]?.title;
  
  const [activeTab, setActiveTab] = useState<"recipes" | "collections">("recipes");
  const [collections, setCollections] = useState<any[]>([]);
  const [isCollectionsLoaded, setIsCollectionsLoaded] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteRecipeConfirm, setDeleteRecipeConfirm] = useState<string | null>(null);

  // Pull-to-refresh state
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 72;

  useEffect(() => {
    if (activeTab === "recipes" && !isRecipesLoaded) {
      fetchRecipes();
    } else if (activeTab === "collections" && !isCollectionsLoaded) {
      fetchCollections();
    }
  }, [activeTab, isRecipesLoaded, isCollectionsLoaded, fetchRecipes]);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCollectionsLoaded(true);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName.trim() })
      });
      
      if (res.ok) {
        const newCollection = await res.json();
        setCollections([newCollection, ...collections]);
        setIsModalOpen(false);
        setNewCollectionName("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
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

  const doDeleteRecipe = async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes(recipes.filter((r: any) => r.id !== id));
      } else {
        alert("Tarif silinemedi.");
      }
    } catch (error) {
      alert("Bir hata oluştu.");
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the recipe detail page
    setDeleteRecipeConfirm(id);
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
          {isRefreshing ? t.refreshing : t.pull_to_refresh}
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <header className="px-6 pt-12 pb-2 z-50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-700">{t.title}</h1>
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 text-[var(--primary)]">
              <Bookmark size={20} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-2xl w-max">
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "recipes" ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.recipes_tab}
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "collections" ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.collections_tab}
            </button>
          </div>
        </header>

        <main className="px-6 mt-6">
          <AnimatePresence mode="wait">
            {activeTab === "recipes" ? (
              <motion.div
                key="recipes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!isRecipesLoaded ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-slate-200 rounded-[2rem] h-72 animate-pulse border border-slate-100"></div>
                    ))}
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-8 text-center border border-slate-100 shadow-sm mt-4">
                    <ChefHat size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">{t.no_recipes_title}</h3>
                    <p className="text-slate-500 mb-6">{t.no_recipes_desc}</p>
                    <Link href="/">
                      <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
                        {t.go_home}
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-8">
                    {recipes.map((recipe, index) => (
                      <Link href={`/recipe/${recipe.id}`} key={recipe.id}>
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full relative">
                          <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 z-10 group-hover:bg-transparent transition-colors"></div>
                            <img 
                              src={recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop"} 
                              alt={getTranslatedTitle(index)} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-700 leading-tight mb-2 line-clamp-2 pr-8">{getTranslatedTitle(index)}</h3>
                            <div className="flex gap-4 mt-auto pt-4">
                              <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                <Clock size={16} className="text-[var(--primary)]" />
                                {recipe.totalTime || 30}m
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                <Flame size={16} className="text-[var(--primary)]" />
                                {recipe.calories || 400} kcal
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={(e) => handleDelete(e, recipe.id)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm z-20 border border-slate-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="pb-8"
              >
                {!isCollectionsLoaded ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-slate-200 rounded-3xl h-48 animate-pulse border border-slate-100"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Create New Collection Button */}
                    <div 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-white rounded-3xl h-48 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors shadow-sm">
                        <Plus size={24} />
                      </div>
                      <span className="font-semibold text-sm">{t.new_collection}</span>
                    </div>

                    {collections.map(collection => (
                      <Link href={`/saved/collection/${collection.id}`} key={collection.id} className="block">
                        <div className="bg-white rounded-3xl h-48 p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col relative group overflow-hidden">
                          {/* Folder Preview Background */}
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                            <FolderOpen size={80} />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-700 leading-tight line-clamp-2">{collection.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">{collection.recipes?.length || 0} {t.recipes_count}</p>
                          </div>

                          {/* Preview mini-images */}
                          {collection.recipes && collection.recipes.length > 0 && (
                            <div className="flex -space-x-2 mt-auto">
                              {collection.recipes.slice(0, 3).map((cr: any, idx: number) => (
                                <div key={cr.recipe.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 relative z-10" style={{ zIndex: 10 - idx }}>
                                  <img 
                                    src={cr.recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=100&auto=format&fit=crop"} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {collection.recipes?.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 relative z-0">
                                  +{collection.recipes.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* New Collection Modal */}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pb-12 z-[120] shadow-2xl border-t border-slate-100"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">{t.new_collection}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.collection_name_label}</label>
                  <input 
                    type="text" 
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder={t.collection_name_placeholder} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-transparent transition-all font-medium text-slate-700"
                    required
                    autoFocus
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={!newCollectionName.trim() || isSubmitting}
                  className="w-full bg-[var(--primary)] text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-colors shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : t.create_collection}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm: Delete Recipe */}
      <ConfirmDialog
        open={!!deleteRecipeConfirm}
        title={t.delete_recipe_title}
        message={t.delete_recipe_msg}
        confirmLabel={t.confirm_delete}
        cancelLabel={t.cancel}
        variant="danger"
        onConfirm={() => { const id = deleteRecipeConfirm!; setDeleteRecipeConfirm(null); doDeleteRecipe(id); }}
        onCancel={() => setDeleteRecipeConfirm(null)}
      />
    </div>
  );
}
