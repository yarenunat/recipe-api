"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, Clock, Flame, Utensils, Plus, X, Search, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add recipe sheet
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Confirm dialogs
  const [deleteCollectionConfirm, setDeleteCollectionConfirm] = useState(false);
  const [removeRecipeConfirm, setRemoveRecipeConfirm] = useState<string | null>(null); // holds recipeId

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

  const openAddSheet = async () => {
    setAddSheetOpen(true);
    setRecipesLoading(true);
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setAllRecipes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleAddRecipe = async (recipeId: string) => {
    setAddingId(recipeId);
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        // Optimistically add to collection
        const added = allRecipes.find((r) => r.id === recipeId);
        if (added) {
          setCollection((prev: any) => ({
            ...prev,
            recipes: [
              ...prev.recipes,
              { recipe: { ...added, images: added.images } },
            ],
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  const handleDeleteCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/saved");
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveRecipe = async (e: React.MouseEvent, recipeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoveRecipeConfirm(recipeId);
  };

  const doRemoveRecipe = async (recipeId: string) => {
    try {
      const res = await fetch(`/api/collections/${id}?recipeId=${recipeId}`, { method: "DELETE" });
      if (res.ok) {
        setCollection({
          ...collection,
          recipes: collection.recipes.filter((cr: any) => cr.recipe.id !== recipeId),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const collectionRecipeIds = useMemo(
    () => new Set((collection?.recipes || []).map((cr: any) => cr.recipe.id)),
    [collection]
  );

  const filteredRecipes = useMemo(
    () =>
      allRecipes.filter((r) =>
        r.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allRecipes, searchQuery]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Link href="/saved">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={20} />
              </div>
            </Link>
            <button
              onClick={() => setDeleteCollectionConfirm(true)}
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
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm font-bold text-[var(--primary)]">
              {collection.recipes.length} Tarif
            </p>
            {/* Add Recipe Button */}
            <button
              onClick={openAddSheet}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-white rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Tarif Ekle
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 mt-8">
        {collection.recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 border-dashed"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Utensils size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">Koleksiyon Boş</h3>
            <p className="text-slate-400 text-sm max-w-[200px] font-medium mb-5">
              Bu koleksiyona henüz tarif eklenmemiş.
            </p>
            <button
              onClick={openAddSheet}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Tarif Ekle
            </button>
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
                      <div className="absolute inset-0 bg-white/20 z-10 group-hover:bg-transparent transition-colors" />
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

      {/* Add Recipe Bottom Sheet */}
      <AnimatePresence>
        {addSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddSheetOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[120] shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Sheet Header */}
              <div className="flex-shrink-0 pt-3 pb-4 px-6">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-slate-800">Tarif Ekle</h2>
                  <button
                    onClick={() => setAddSheetOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tarif ara..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 text-slate-700"
                  />
                </div>
              </div>

              {/* Recipe List */}
              <div className="overflow-y-auto flex-1 px-6 pb-28 space-y-3">
                {recipesLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Utensils size={36} className="mx-auto mb-3 text-slate-200" />
                    <p className="font-medium">Tarif bulunamadı</p>
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => {
                    const isInCollection = collectionRecipeIds.has(recipe.id);
                    const isAdding = addingId === recipe.id;
                    return (
                      <button
                        key={recipe.id}
                        onClick={() => !isInCollection && handleAddRecipe(recipe.id)}
                        disabled={isInCollection || isAdding}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left ${
                          isInCollection
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-100 bg-slate-50 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 active:scale-[0.98]"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                          <img
                            src={recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=200&auto=format&fit=crop"}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isInCollection ? "text-emerald-700" : "text-slate-700"}`}>
                            {recipe.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <Clock size={11} /> {recipe.totalTime || 30}dk
                            <Flame size={11} className="ml-1" /> {recipe.calories || 400} kcal
                          </p>
                        </div>
                        {/* Action Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isInCollection ? "bg-emerald-500 text-white" : "bg-white text-[var(--primary)] border border-slate-200"
                        }`}>
                          {isAdding ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isInCollection ? (
                            <Check size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm: Delete Collection */}
      <ConfirmDialog
        open={deleteCollectionConfirm}
        title="Koleksiyonu Sil"
        message="Bu koleksiyonu ve içindeki tüm tariflerin bağlantısını kalıcı olarak silmek istediğinize emin misiniz?"
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        variant="danger"
        onConfirm={() => { setDeleteCollectionConfirm(false); handleDeleteCollection(); }}
        onCancel={() => setDeleteCollectionConfirm(false)}
      />

      {/* Confirm: Remove Recipe from Collection */}
      <ConfirmDialog
        open={!!removeRecipeConfirm}
        title="Tarifi Çıkar"
        message="Bu tarifi koleksiyondan çıkarmak istediğinize emin misiniz?"
        confirmLabel="Evet, Çıkar"
        cancelLabel="Vazgeç"
        variant="warning"
        onConfirm={() => { const id = removeRecipeConfirm!; setRemoveRecipeConfirm(null); doRemoveRecipe(id); }}
        onCancel={() => setRemoveRecipeConfirm(null)}
      />
    </div>
  );
}

