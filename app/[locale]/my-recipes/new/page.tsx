"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Plus, X, Upload, Image as ImageIcon, Check } from "lucide-react";

export default function NewRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          instructions,
          ingredients: ingredients.filter(i => i.name.trim() !== ""),
          imageBase64
        })
      });

      if (res.ok) {
        router.push("/my-recipes");
      } else {
        alert("Tarif kaydedilirken bir hata oluştu.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-10 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/my-recipes">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Yeni Tarif Ekle
            </h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !instructions.trim()}
            className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
            Kaydet
          </button>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image Upload */}
          <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100">
            <div className="relative h-56 rounded-[1.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-100 transition-colors">
              {imageBase64 ? (
                <>
                  <img src={imageBase64} alt="Recipe" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-white text-slate-800 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                      <Upload size={16} /> Resmi Değiştir
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                    <ImageIcon size={28} className="text-[var(--primary)]" />
                  </div>
                  <span className="font-bold text-slate-600">Tarif Resmi Ekle</span>
                  <span className="text-sm">Dokun veya tıkla</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="font-black text-lg text-slate-700 flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-500 flex items-center justify-center text-xs">1</span> 
              Temel Bilgiler
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tarif Adı *</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Örn: Ev Yapımı Mantı"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Kısa Açıklama</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Bu tarif hakkında biraz bilgi verin..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 font-medium text-slate-600 placeholder:text-slate-300 transition-all min-h-[100px] resize-y"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="font-black text-lg text-slate-700 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-500 flex items-center justify-center text-xs">2</span> 
              Malzemeler
            </h2>
            
            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      value={ing.name}
                      onChange={e => updateIngredient(idx, 'name', e.target.value)}
                      placeholder="Malzeme (Örn: Un)"
                      className="w-2/3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 font-medium text-slate-600 text-sm"
                    />
                    <input 
                      type="text" 
                      value={ing.quantity}
                      onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                      placeholder="Miktar (Örn: 2 bardak)"
                      className="w-1/3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 font-medium text-slate-600 text-sm"
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeIngredient(idx)}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 hover:bg-rose-100 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              type="button" 
              onClick={addIngredient}
              className="w-full mt-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={16} /> Malzeme Ekle
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="font-black text-lg text-slate-700 flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-500 flex items-center justify-center text-xs">3</span> 
              Yapılışı *
            </h2>
            <textarea 
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Adım adım nasıl yapıldığını anlatın..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 font-medium text-slate-600 placeholder:text-slate-300 transition-all min-h-[200px] resize-y"
              required
            />
          </div>

          {/* Spacer for bottom */}
          <div className="h-10"></div>
        </form>
      </main>
    </div>
  );
}
