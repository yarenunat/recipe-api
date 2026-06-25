"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Pencil, X, Plus, Minus, Image as ImageIcon, Check, Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  ingredient?: { name: string };
}

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  instructions: string;
  images?: { url: string }[];
  ingredients?: {
    ingredient: { name: string };
    quantity?: string | null;
  }[];
}

export default function RecipeOptionsMenu({ recipe }: { recipe: Recipe }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Edit state
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description || "");
  const [imageUrl, setImageUrl] = useState(recipe.images?.[0]?.url || "");

  let parsedInstructions: string[] = [];
  try {
    parsedInstructions = JSON.parse(recipe.instructions as string);
  } catch {
    parsedInstructions = typeof recipe.instructions === "string" ? [recipe.instructions] : [];
  }
  const [instructions, setInstructions] = useState<string[]>(parsedInstructions);
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>(
    (recipe.ingredients || []).map((ing) => ({
      name: ing.ingredient?.name || "",
      quantity: ing.quantity || "",
    }))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      } else {
        alert("Tarif silinemedi.");
      }
    } catch {
      alert("Bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          instructions,
          imageUrl,
          ingredients,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        router.refresh();
      } else {
        alert("Kaydedilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      alert("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "" }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: "name" | "quantity", value: string) => {
    setIngredients(ingredients.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));
  };

  const addStep = () => setInstructions([...instructions, ""]);
  const removeStep = (i: number) => setInstructions(instructions.filter((_, idx) => idx !== i));
  const updateStep = (i: number, value: string) => {
    setInstructions(instructions.map((step, idx) => idx === i ? value : step));
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Resim 3MB'dan küçük olmalıdır.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Options button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-colors text-slate-700 border border-slate-100"
          >
            {deleting ? <Loader2 size={20} className="animate-spin text-red-500" /> : <MoreVertical size={24} />}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] right-0 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
              >
                <button
                  onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  <Pencil size={16} className="text-[var(--primary)]" />
                  Düzenle
                </button>
                <div className="h-px bg-slate-100 mx-2" />
                <button
                  onClick={() => { setMenuOpen(false); setDeleteConfirmOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
                >
                  <Trash2 size={16} />
                  Sil
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-50 rounded-t-[2.5rem] z-[120] shadow-2xl max-h-[92vh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex-shrink-0 pt-3 pb-2 px-6">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800">Tarifi Düzenle</h2>
                  <button
                    onClick={() => setEditOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 pb-32 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Başlık</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 font-semibold transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Açıklama</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none font-medium transition-all"
                  />
                </div>

                {/* Image — File Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <ImageIcon size={12} className="inline mr-1" />
                    Tarif Fotoğrafı
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />

                  {imageUrl ? (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-100 group">
                      <img
                        src={imageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-slate-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-100"
                        >
                          <Camera size={16} /> Değiştir
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="bg-white text-red-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-50"
                        >
                          <X size={16} /> Kaldır
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                    >
                      <Camera size={28} />
                      <span className="text-sm font-semibold">Fotoğraf Seç</span>
                      <span className="text-xs">JPG, PNG — maks 3MB</span>
                    </button>
                  )}
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Malzemeler</label>
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                          placeholder="Miktar"
                          className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 text-sm font-bold transition-all"
                        />
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => updateIngredient(i, "name", e.target.value)}
                          placeholder="Malzeme adı"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 text-sm font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(i)}
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:opacity-70 transition-opacity"
                  >
                    <Plus size={16} /> Malzeme Ekle
                  </button>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Yapılış Adımları</label>
                  <div className="space-y-3">
                    {instructions.map((step, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                          {i + 1}
                        </div>
                        <textarea
                          value={step}
                          onChange={(e) => updateStep(i, e.target.value)}
                          rows={2}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none text-sm font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeStep(i)}
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition-colors mt-1"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addStep}
                    className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:opacity-70 transition-opacity"
                  >
                    <Plus size={16} /> Adım Ekle
                  </button>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[var(--primary)] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-[var(--primary)]/20 text-lg"
                >
                  {saving ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <Check size={22} />
                  )}
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Tarifi Sil"
        message="Bu tarifi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        variant="danger"
        onConfirm={() => { setDeleteConfirmOpen(false); handleDelete(); }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
