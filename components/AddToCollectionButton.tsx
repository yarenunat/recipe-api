"use client";

import { useState, useEffect } from "react";
import { Bookmark, Check, FolderOpen, Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDictionary } from "@/components/DictionaryProvider";

interface Collection {
  id: string;
  name: string;
  recipes?: { recipe: { id: string } }[];
}

export default function AddToCollectionButton({ recipeId }: { recipeId: string }) {
  const dict = useDictionary();
  const t = dict.components;

  const [modalOpen, setModalOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      fetchCollections();
    }
  }, [modalOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
        // Mark already-added collections
        const alreadyAdded = new Set<string>(
          data
            .filter((c: Collection) =>
              c.recipes?.some((r) => r.recipe?.id === recipeId)
            )
            .map((c: Collection) => c.id)
        );
        setAddedIds(alreadyAdded);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (collectionId: string) => {
    if (addedIds.has(collectionId)) return;
    setAddingId(collectionId);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        setAddedIds((prev) => new Set([...prev, collectionId]));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      // Create collection
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (createRes.ok) {
        const newCollection = await createRes.json();
        // Add recipe to it
        await fetch(`/api/collections/${newCollection.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
        setCollections((prev) => [newCollection, ...prev]);
        setAddedIds((prev) => new Set([...prev, newCollection.id]));
        setCreatingNew(false);
        setNewName("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-colors text-slate-700 border border-slate-100"
        title={t.add_to_collection_title}
      >
        <Bookmark size={20} />
      </button>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[120] shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex-shrink-0 pt-3 pb-4 px-6 border-b border-slate-100">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800">{t.add_to_collection_title}</h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3 pb-28">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
                  </div>
                ) : (
                  <>
                    {/* Create new */}
                    {!creatingNew ? (
                      <button
                        onClick={() => setCreatingNew(true)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all font-semibold"
                      >
                        <Plus size={20} />
                        {t.create_collection_button}
                      </button>
                    ) : (
                      <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder={t.collection_name_placeholder}
                          autoFocus
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                        />
                        <button
                          type="submit"
                          disabled={creating || !newName.trim()}
                          className="px-4 py-3 bg-[var(--primary)] text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center gap-1"
                        >
                          {creating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          {t.add_button}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCreatingNew(false); setNewName(""); }}
                          className="px-3 py-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </form>
                    )}

                    {collections.length === 0 && !creatingNew && (
                      <div className="text-center py-8 text-slate-400">
                        <FolderOpen size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">{t.no_collections_title}</p>
                        <p className="text-sm mt-1">{t.no_collections_desc}</p>
                      </div>
                    )}

                    {collections.map((col) => {
                      const isAdded = addedIds.has(col.id);
                      const isAdding = addingId === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleAdd(col.id)}
                          disabled={isAdded || isAdding}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                            isAdded
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-slate-100 bg-slate-50 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAdded ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
                            {isAdding ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : isAdded ? (
                              <Check size={18} />
                            ) : (
                              <FolderOpen size={18} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate ${isAdded ? "text-emerald-700" : "text-slate-700"}`}>
                              {col.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {isAdded ? t.added_success : `${col.recipes?.length || 0} ${t.recipes_count}`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
