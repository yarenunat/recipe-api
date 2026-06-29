"use client";

import { useParams } from "next/navigation";
import { useTranslationCache } from "@/hooks/useTranslationCache";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle2, Circle, Trash2, Plus, Sparkles, Loader2, ChevronLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ShoppingPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  const [deleteListConfirm, setDeleteListConfirm] = useState<string | null>(null);

  const dict = useDictionary();
  const t = dict.shopping;

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch("/api/shopping");
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (listId: string) => {
    const name = newItemName[listId];
    if (!name?.trim()) return;

    setIsAdding(prev => ({ ...prev, [listId]: true }));
    try {
      const res = await fetch(`/api/shopping/${listId}/add-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: name.trim() })
      });
      if (res.ok) {
        const newItem = await res.json();
        setLists(prev => prev.map(list => {
          if (list.id === listId) {
            return { ...list, items: [...list.items, newItem] };
          }
          return list;
        }));
        setNewItemName(prev => ({ ...prev, [listId]: "" }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(prev => ({ ...prev, [listId]: false }));
    }
  };

  const toggleItem = async (listId: string, itemId: string, isChecked: boolean) => {
    // Optimistic UI update
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map((item: any) => 
            item.id === itemId ? { ...item, isChecked: !isChecked } : item
          )
        };
      }
      return list;
    }));

    try {
      await fetch(`/api/shopping/item/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked: !isChecked })
      });
    } catch (err) {
      // Revert if failed
      fetchLists();
    }
  };

  const deleteList = async (listId: string) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    try {
      await fetch(`/api/shopping/${listId}`, { method: "DELETE" });
    } catch (err) {
      fetchLists();
    }
  };

  const getIngredientEmoji = (name: string) => {
    const n = name.toLowerCase();
    
    // Et & Şarküteri
    if (n.includes("sucuk") || n.includes("sosis") || n.includes("salam") || n.includes("pastırma")) return "🌭";
    if (n.includes("kıyma") || n.includes("et") || n.includes("kuşbaşı") || n.includes("köfte") || n.includes("beef") || n.includes("steak") || n.includes("meat")) return "🥩";
    if (n.includes("tavuk") || n.includes("göğüs") || n.includes("kanat") || n.includes("chicken")) return "🍗";
    if (n.includes("balık") || n.includes("hamsi") || n.includes("somon") || n.includes("ton") || n.includes("fish") || n.includes("salmon")) return "🐟";
    
    // Süt & Kahvaltılık
    if (n.includes("peynir") || n.includes("kaşar") || n.includes("tulum") || n.includes("lor") || n.includes("cheese")) return "🧀";
    if (n.includes("yumurta") || n.includes("egg")) return "🥚";
    if (n.includes("süt") || n.includes("ayran") || n.includes("kefir") || n.includes("milk")) return "🥛";
    if (n.includes("tereyağı") || n.includes("margarin") || n.includes("butter")) return "🧈";
    if (n.includes("zeytin") || n.includes("olive")) return "🫒";
    if (n.includes("yoğurt") || n.includes("yogurt")) return "🥣";
    if (n.includes("bal") || n.includes("reçel") || n.includes("pekmez") || n.includes("honey")) return "🍯";
    
    // Fırın & Tahıl
    if (n.includes("ekmek") || n.includes("pide") || n.includes("lavaş") || n.includes("toast") || n.includes("bread")) return "🍞";
    if (n.includes("simit") || n.includes("bagel") || n.includes("açma")) return "🥯";
    if (n.includes("makarna") || n.includes("erişte") || n.includes("şehriye") || n.includes("pasta") || n.includes("spaghetti") || n.includes("noodle")) return "🍝";
    if (n.includes("pirinç") || n.includes("bulgur") || n.includes("rice")) return "🍚";
    if (n.includes("un") || n.includes("flour") || n.includes("nişasta")) return "🌾";
    
    // Sebze & Meyve
    if (n.includes("domates") || n.includes("salça") || n.includes("tomato")) return "🍅";
    if (n.includes("soğan") || n.includes("onion")) return "🧅";
    if (n.includes("sarımsak") || n.includes("garlic")) return "🧄";
    if (n.includes("patates") || n.includes("potato")) return "🥔";
    if (n.includes("havuç") || n.includes("carrot")) return "🥕";
    if (n.includes("mantar") || n.includes("mushroom")) return "🍄";
    if (n.includes("marul") || n.includes("kıvırcık") || n.includes("nane") || n.includes("maydanoz") || n.includes("dereotu") || n.includes("roka") || n.includes("spinach") || n.includes("lettuce") || n.includes("salad")) return "🥬";
    if (n.includes("biber") || n.includes("pepper")) return "🌶️";
    if (n.includes("salatalık") || n.includes("hıyar") || n.includes("cucumber")) return "🥒";
    if (n.includes("patlıcan") || n.includes("eggplant")) return "🍆";
    if (n.includes("brokoli") || n.includes("broccoli")) return "🥦";
    if (n.includes("limon") || n.includes("lemon")) return "🍋";
    if (n.includes("elma") || n.includes("apple")) return "🍎";
    if (n.includes("muz") || n.includes("banana")) return "🍌";
    if (n.includes("çilek") || n.includes("strawberry")) return "🍓";
    if (n.includes("karpuz") || n.includes("watermelon")) return "🍉";
    if (n.includes("üzüm") || n.includes("grape")) return "🍇";
    if (n.includes("kiraz") || n.includes("cherry")) return "🍒";
    if (n.includes("şeftali") || n.includes("peach")) return "🍑";
    
    // Bakliyat & Kuruyemiş
    if (n.includes("nohut") || n.includes("fasulye") || n.includes("mercimek") || n.includes("bakla") || n.includes("bean") || n.includes("lentil")) return "🫘";
    if (n.includes("ceviz") || n.includes("fındık") || n.includes("fıstık") || n.includes("badem") || n.includes("nut")) return "🥜";
    
    // Diğer
    if (n.includes("şeker") || n.includes("sugar")) return "🧊";
    if (n.includes("tuz") || n.includes("salt")) return "🧂";
    if (n.includes("yağ") || n.includes("oil")) return "🫙";
    if (n.includes("çikolata") || n.includes("kakao") || n.includes("chocolate")) return "🍫";
    if (n.includes("kahve") || n.includes("coffee")) return "☕";
    if (n.includes("çay") || n.includes("tea")) return "🍵";
    if (n.includes("su") || n.includes("soda") || n.includes("water")) return "💧";
    if (n.includes("şarap") || n.includes("wine")) return "🍷";
    if (n.includes("bira") || n.includes("beer")) return "🍺";

    return "🛒";
  };

  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  // Gather strings to translate
  const listNames = lists.map(l => l.name);
  const ingredientNames = lists.flatMap(l => l.items.map((i: any) => i.ingredient?.name || ""));
  const allStringsToTranslate = [...listNames, ...ingredientNames];
  
  const translatedStrings = useTranslationCache(allStringsToTranslate, locale);

  const getTranslatedListName = (listIndex: number) => {
    return translatedStrings[listIndex] || lists[listIndex].name;
  };

  const getTranslatedItemName = (listIndex: number, itemIndex: number) => {
    let offset = lists.length;
    for (let i = 0; i < listIndex; i++) {
      offset += lists[i].items.length;
    }
    return translatedStrings[offset + itemIndex] || lists[listIndex].items[itemIndex].ingredient?.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-24">
        <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
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
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed">{t.subtitle}</p>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-6">
        {lists.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">{t.no_lists_title}</h3>
            <p className="text-slate-400 text-sm max-w-[200px] font-medium">{t.no_lists_desc}</p>
          </motion.div>
        ) : (
          lists.map((list, listIndex) => (
            <motion.div key={list.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
                <h2 className="text-xl font-bold text-slate-700 capitalize flex items-center gap-2">
                  <Sparkles size={18} className="text-[var(--primary)]" />
                  {getTranslatedListName(listIndex)}
                </h2>
                <button onClick={() => setDeleteListConfirm(list.id)} className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Add manual item form at the TOP */}
              <div className="mb-6 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder={t.add_item_placeholder} 
                  value={newItemName[list.id] || ""}
                  onChange={(e) => setNewItemName(prev => ({ ...prev, [list.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(list.id)}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 transition-all font-medium text-slate-700 text-sm"
                />
                <button 
                  onClick={() => handleAddItem(list.id)}
                  disabled={isAdding[list.id] || !newItemName[list.id]?.trim()}
                  className="w-12 h-12 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-[var(--primary)]/90 transition-colors shadow-sm flex-shrink-0"
                >
                  {isAdding[list.id] ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                </button>
              </div>

              <div className="space-y-3">
                {list.items.map((item: any, itemIndex: number) => (
                  <div key={item.id} onClick={() => toggleItem(list.id, item.id, item.isChecked)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${item.isChecked ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                    <div className={`flex-shrink-0 transition-colors ${item.isChecked ? 'text-[var(--primary)]' : 'text-slate-300'}`}>
                      {item.isChecked ? <CheckCircle2 size={24} className="fill-[var(--primary)] text-white" /> : <Circle size={24} />}
                    </div>
                    <div className="text-3xl mr-1 flex-shrink-0">
                      {item.ingredient?.icon?.url?.replace('emoji:', '') || getIngredientEmoji(item.ingredient?.name || "")}
                    </div>
                    <div className={`flex-1 transition-all ${item.isChecked ? 'opacity-50 line-through text-slate-400' : 'text-slate-700'}`}>
                      <p className="font-semibold capitalize text-[15px]">{getTranslatedItemName(listIndex, itemIndex)}</p>
                      {item.quantity && <p className="text-xs text-slate-400 mt-0.5">{item.quantity} {item.unit}</p>}
                    </div>
                  </div>
                ))}

                {list.items.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">{t.no_items}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>

      <ConfirmDialog
        open={!!deleteListConfirm}
        title={t.delete_list_title}
        message={t.delete_list_msg}
        confirmLabel={t.confirm_delete}
        cancelLabel={t.cancel}
        variant="danger"
        onConfirm={() => { const id = deleteListConfirm!; setDeleteListConfirm(null); deleteList(id); }}
        onCancel={() => setDeleteListConfirm(null)}
      />
    </>
  );
}
