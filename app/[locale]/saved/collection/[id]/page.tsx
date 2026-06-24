"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, Clock, Flame, Utensils } from "lucide-react";
import { motion } from "framer-motion";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data);
      } else {
        router.push("/saved");
      }
    } catch (e) {
      console.error(e);
      router.push("/saved");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/saved");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveRecipe = async (e: React.MouseEvent, recipeId: string) => {
    e.preventDefault();
    if (!confirm("Remove this recipe from the collection?")) return;
    try {
      const res = await fetch(`/api/collections/${id}/recipes?recipeId=${recipeId}`, { method: "DELETE" });
      if (res.ok) {
        setCollection({
          ...collection,
          recipes: collection.recipes.filter((cr: any) => cr.recipe.id !== recipeId)
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Link href="/saved">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={20} />
              </div>
            </Link>
            
            <button 
              onClick={handleDeleteCollection}
              className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-slate-500 mt-2 font-medium">{collection.description}</p>
          )}
          <p className="text-sm font-bold text-[var(--primary)] mt-3">
            {collection.recipes.length} Recipes
          </p>
        </div>
      </header>

      <main className="px-6 mt-8">
        {collection.recipes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Utensils size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">Empty Collection</h3>
            <p className="text-slate-400 text-sm max-w-[200px] font-medium">This collection doesn't have any recipes yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {collection.recipes.map((cr: any) => {
              const recipe = cr.recipe;
              return (
                <Link href={`/recipe/${recipe.id}`} key={recipe.id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full relative"
                  >
                    <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 z-10 group-hover:bg-transparent transition-colors"></div>
                      <img 
                        src={recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop"} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-700 leading-tight mb-2 line-clamp-2 pr-8">{recipe.title}</h3>
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
                      onClick={(e) => handleRemoveRecipe(e, recipe.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm z-20 border border-slate-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
