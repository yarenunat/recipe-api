"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ClientShoppingButton({ ingredients }: { ingredients: any[] }) {
  const dict = useDictionary();
  const t = dict.cooking;
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const payload = ingredients.map(ing => ({
        id: ing.ingredient.id,
        name: ing.ingredient.name,
        quantity: ing.quantity
      }));
      
      const res = await fetch("/api/shopping/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: payload }),
      });
      
      if (res.ok) setAdded(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={loading || added}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${added ? 'bg-emerald-500 text-white' : 'bg-white text-[var(--primary)] border border-slate-200 hover:bg-slate-50'}`}
    >
      {added ? <Check size={18} /> : <ShoppingCart size={18} />}
      {added ? t.added_to_list : t.add_all_to_list}
    </button>
  );
}
