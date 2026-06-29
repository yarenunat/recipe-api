'use client';
import { useState, useEffect } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { ChefHat, Clock, Flame, Utensils, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import RecipeOptionsMenu from "@/components/RecipeOptionsMenu";
import ClientShoppingButton from "./ClientShoppingButton";
import ClientCookingMode from "./ClientCookingMode";
import AddToCollectionButton from "@/components/AddToCollectionButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const getIngredientEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("yumurta") || n.includes("egg")) return "🥚";
  if (n.includes("süt") || n.includes("milk")) return "🥛";
  if (n.includes("un") || n.includes("flour")) return "🌾";
  if (n.includes("şeker") || n.includes("sugar")) return "🧊";
  if (n.includes("tuz") || n.includes("salt") || n.includes("karabiber") || n.includes("baharat") || n.includes("spice") || n.includes("pepper")) return "🧂";
  if (n.includes("zeytinyağı") || n.includes("olive")) return "🫒";
  if (n.includes("yağ") || n.includes("oil") || n.includes("butter") || n.includes("tereyağı")) return "🧈";
  if (n.includes("soğan") || n.includes("onion")) return "🧅";
  if (n.includes("sarımsak") || n.includes("garlic")) return "🧄";
  if (n.includes("peynir") || n.includes("cheese")) return "🧀";
  if (n.includes("tavuk") || n.includes("chicken")) return "🍗";
  if (n.includes("et") || n.includes("kıyma") || n.includes("meat") || n.includes("beef") || n.includes("sucuk") || n.includes("pork") || n.includes("steak")) return "🥩";
  if (n.includes("domates") || n.includes("tomato") || n.includes("salça")) return "🍅";
  if (n.includes("biber") || n.includes("chile") || n.includes("chili")) return "🌶️";
  if (n.includes("patates") || n.includes("potato")) return "🥔";
  if (n.includes("havuç") || n.includes("carrot")) return "🥕";
  if (n.includes("limon") || n.includes("lemon") || n.includes("lime")) return "🍋";
  if (n.includes("su") || n.includes("water")) return "💧";
  if (n.includes("pirinç") || n.includes("rice")) return "🍚";
  if (n.includes("makarna") || n.includes("pasta") || n.includes("noodle") || n.includes("spaghetti")) return "🍝";
  if (n.includes("ekmek") || n.includes("bread") || n.includes("toast")) return "🍞";
  if (n.includes("mantar") || n.includes("mushroom")) return "🍄";
  if (n.includes("balık") || n.includes("fish") || n.includes("salmon") || n.includes("tuna")) return "🐟";
  if (n.includes("çikolata") || n.includes("chocolate") || n.includes("kakao") || n.includes("cocoa")) return "🍫";
  if (n.includes("ceviz") || n.includes("fındık") || n.includes("badem") || n.includes("nut") || n.includes("walnut") || n.includes("almond")) return "🥜";
  if (n.includes("yoğurt") || n.includes("yogurt") || n.includes("yoghurt")) return "🥣";
  if (n.includes("sosis") || n.includes("sausage")) return "🌭";
  if (n.includes("bal ") || n.includes("honey")) return "🍯";
  if (n.includes("elma") || n.includes("apple")) return "🍎";
  if (n.includes("avocado") || n.includes("avokado")) return "🥑";
  if (n.includes("corn") || n.includes("mısır")) return "🌽";
  if (n.includes("bean") || n.includes("fasulye") || n.includes("lentil") || n.includes("mercimek")) return "🫘";
  if (n.includes("herb") || n.includes("ot") || n.includes("parsley") || n.includes("cilantro") || n.includes("coriander")) return "🌿";
  return "🥣";
};

export default function RecipePageClient({ recipe, instructions, locale }: { recipe: any; instructions: string[]; locale: string }) {
  const dict = useDictionary();
  const t = dict.recipe;

  const [displayRecipe, setDisplayRecipe] = useState(recipe);
  const [displayInstructions, setDisplayInstructions] = useState(instructions);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Basic heuristic to skip translation if it's already in the target language.
    // We check if it's already translated by looking at localStorage
    const cacheKey = `recipe-trans-${recipe.id}-${locale}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setDisplayRecipe(parsed.recipe);
        setDisplayInstructions(parsed.instructions);
        return;
      } catch (e) {
        console.error("Failed to parse cached translation", e);
      }
    }

    const translateRecipe = async () => {
      setIsTranslating(true);
      try {
        const languageNames: Record<string, string> = {
          tr: "Turkish",
          en: "English",
          es: "Spanish",
          zh: "Chinese (Simplified)",
          hi: "Hindi",
        };
        const targetLanguage = languageNames[locale] || "Turkish";

        let tipsArray: string[] = [];
        if (recipe.tips) {
          try {
            tipsArray = JSON.parse(recipe.tips);
          } catch (e) {
            if (typeof recipe.tips === "string") tipsArray = [recipe.tips];
          }
        }

        const res = await fetch("/api/recipes/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe,
            instructions,
            tipsArray,
            targetLanguage,
          }),
        });

        if (res.ok) {
          const parsed = await res.json();
          let newRecipe = { ...recipe };
          let newInstructions = [...instructions];

          if (parsed.title) {
            newRecipe.title = parsed.title;
            newRecipe.description = parsed.description || null;
            newRecipe.difficultyLevel = parsed.difficultyLevel || null;
            newRecipe.cuisineType = parsed.cuisineType || null;
            
            if (parsed.instructions && Array.isArray(parsed.instructions)) {
              newInstructions = parsed.instructions;
            }
            
            if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
              newRecipe.ingredients = recipe.ingredients.map((ing: any, idx: number) => {
                const parsedIng = parsed.ingredients[idx];
                return {
                  ...ing,
                  quantity: parsedIng ? parsedIng.quantity : ing.quantity,
                  ingredient: {
                    ...ing.ingredient,
                    name: parsedIng ? parsedIng.name : ing.ingredient.name,
                  }
                };
              });
            }

            if (parsed.tips && Array.isArray(parsed.tips)) {
              newRecipe.tips = JSON.stringify(parsed.tips);
            }

            setDisplayRecipe(newRecipe);
            setDisplayInstructions(newInstructions);

            // Save to cache
            localStorage.setItem(cacheKey, JSON.stringify({
              recipe: newRecipe,
              instructions: newInstructions
            }));
          }
        }
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateRecipe();
  }, [recipe, instructions, locale]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      <div className="max-w-5xl mx-auto relative">
        
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-700 font-medium animate-pulse">Translating recipe...</p>
            </div>
          </div>
        )}

        {/* Top Banner / Image */}
        <div className="relative w-full h-[40vh] md:h-[50vh] bg-white overflow-hidden md:rounded-b-[3rem] shadow-sm border-b border-slate-100">
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10"></div>
          <img
            src={displayRecipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop"}
            className="absolute inset-0 w-full h-full object-cover z-0"
            alt="Recipe Cover"
          />

          {/* Top Navbar */}
          <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-50">
            <Link href="/">
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={24} />
              </div>
            </Link>
            <div className="flex gap-2 items-center">
              <LanguageSwitcher />
              <AddToCollectionButton recipeId={displayRecipe.id} />
              <RecipeOptionsMenu recipe={displayRecipe} />
            </div>
          </div>

          {/* Floating Details (Mobile) */}
          <div className="absolute bottom-6 left-6 right-6 z-20 md:hidden">
            <div className="flex gap-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl py-3 px-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 flex-1">
                <Clock size={20} className="text-[var(--primary)] mb-1" />
                <span className="text-xs font-semibold text-slate-700">{displayRecipe.totalTime || 30}m</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl py-3 px-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 flex-1">
                <Flame size={20} className="text-[var(--primary)] mb-1" />
                <span className="text-xs font-semibold text-slate-700">{displayRecipe.calories || 450} kcal</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl py-3 px-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 flex-1">
                <Utensils size={20} className="text-[var(--primary)] mb-1" />
                <span className="text-xs font-semibold text-slate-700">{displayRecipe.difficultyLevel || "Med"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-8 md:mt-12">
          {/* Header Section */}
          <div className="md:flex md:justify-between md:items-start mb-8">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-3 tracking-tight text-slate-700">{displayRecipe.title}</h2>
              <p className="text-slate-500 leading-relaxed text-lg">{displayRecipe.description}</p>
            </div>

            {/* Desktop Metrics */}
            <div className="hidden md:flex gap-4 mt-6 md:mt-0">
              <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 min-w-[5rem]">
                <Clock size={20} className="text-[var(--primary)] mb-2" />
                <span className="text-sm font-semibold text-slate-700">{displayRecipe.totalTime || 30}m</span>
              </div>
              <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 min-w-[5rem]">
                <Flame size={20} className="text-[var(--primary)] mb-2" />
                <span className="text-sm font-semibold text-slate-700">{displayRecipe.calories || 450} kcal</span>
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Left Column: Ingredients */}
            <div className="md:col-span-5">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-600">
                    <Sparkles size={20} className="text-[var(--primary)]" />
                    {t.ingredients}
                  </h3>
                  <span className="text-xs font-bold text-white bg-[var(--primary)] px-2.5 py-1 rounded-full">
                    {displayRecipe.ingredients.length}
                  </span>
                </div>
                <ClientShoppingButton ingredients={displayRecipe.ingredients} />
              </div>

              <div className="flex flex-col gap-3">
                {displayRecipe.ingredients.map((ing: any, i: number) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="w-14 h-14 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="drop-shadow-sm">{getIngredientEmoji(ing.ingredient.name)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 capitalize leading-tight">{ing.ingredient.name}</span>
                      <span className="text-sm font-semibold text-[var(--primary)] mt-1">{ing.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="md:col-span-7 mt-8 md:mt-0">
              <ClientCookingMode instructions={displayInstructions} />

              <h3 className="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-600 mt-2">
                <ChefHat size={20} className="text-[var(--primary)]" />
                {t.instructions}
              </h3>

              <div className="space-y-4">
                {displayInstructions.map((step: string, i: number) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm border border-white">
                      {i + 1}
                    </div>
                    <p className="text-slate-500 leading-relaxed text-base pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
