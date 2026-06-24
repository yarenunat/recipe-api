"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Flame, ChefHat, Search, Bookmark, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function SavedRecipesPage() {
  const { recipes, isRecipesLoaded, fetchRecipes, setRecipes } = useAppStore();

  useEffect(() => {
    if (!isRecipesLoaded) {
      fetchRecipes();
    }
  }, [isRecipesLoaded, fetchRecipes]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the recipe detail page
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes(prev => prev.filter(r => r.id !== id));
      } else {
        alert("Failed to delete recipe.");
      }
    } catch (error) {
      alert("Error deleting recipe.");
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="px-6 pt-12 pb-6 flex items-center justify-between z-50">
          <h1 className="text-2xl font-bold tracking-tight text-slate-700">My Recipes</h1>
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 text-[var(--primary)]">
            <Bookmark size={20} />
          </div>
        </header>

        <main className="px-6 mt-4">
          <p className="text-slate-500 mb-6">
            Here are all the delicious recipes you've generated so far.
          </p>

          {!isRecipesLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-slate-200 rounded-[2rem] h-72 animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-8 text-center border border-slate-100 shadow-sm mt-8">
              <ChefHat size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No recipes yet</h3>
              <p className="text-slate-500 mb-6">Start generating some AI recipes on the home page!</p>
              <Link href="/">
                <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
                  Go to Home
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link href={`/recipe/${recipe.id}`} key={recipe.id}>
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full relative">
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
                    
                    {/* Delete Button overlaid on card */}
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
        </main>
      </div>

      {/* Floating Bottom Nav - Matches Homepage */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-[4.5rem] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between px-3 z-40">
        <Link href="/" className="flex-1 flex justify-center">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <ChefHat size={22} />
          </button>
        </Link>
        <div className="flex-1 flex justify-center">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <Search size={22} />
          </button>
        </div>
        <Link href="/plan" className="flex-1 flex justify-center">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <CalendarIcon size={22} />
          </button>
        </Link>
        <div className="w-16 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--primary)] shadow-sm mx-2">
          <Bookmark size={22} />
        </div>
      </nav>
    </div>
  );
}
