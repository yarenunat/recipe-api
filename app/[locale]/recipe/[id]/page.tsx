import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChefHat, Clock, Flame, Utensils, ChevronLeft, MoreVertical, Sparkles } from "lucide-react";
import Link from "next/link";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";

export default async function RecipePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: { include: { ingredient: true } } }
  });

  if (!recipe) {
    notFound();
  }

  let instructions: string[] = [];
  try {
    instructions = JSON.parse(recipe.instructions as string);
  } catch (e) {
    if (typeof recipe.instructions === "string") {
      instructions = [recipe.instructions];
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Top Banner / Image */}
        <div className="relative w-full h-[40vh] md:h-[50vh] bg-white overflow-hidden md:rounded-b-[3rem] shadow-sm border-b border-slate-100">
          <div className="absolute inset-0 bg-white/30 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-white/20 z-10"></div>
          <img 
            src={recipe.images?.[0]?.url || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop"} 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
            alt="Recipe Cover"
          />
          
          {/* Top Navbar */}
          <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-20">
            <Link href="/">
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={24} />
              </div>
            </Link>
            <div className="flex gap-2">
              <DeleteRecipeButton id={recipe.id} />
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-colors text-slate-700 border border-slate-100">
                <MoreVertical size={24} />
              </div>
            </div>
          </div>

          {/* Floating Details */}
          <div className="absolute bottom-6 left-6 right-6 z-20 md:hidden">
            <div className="flex gap-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl py-3 px-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 flex-1">
                <Clock size={20} className="text-[var(--primary)] mb-1" />
                <span className="text-xs font-semibold text-slate-700">{recipe.totalTime || 30}m</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl py-3 px-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 flex-1">
                <Flame size={20} className="text-[var(--primary)] mb-1" />
                <span className="text-xs font-semibold text-slate-700">{recipe.calories || 450} kcal</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl py-3 px-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 flex-1">
                <Utensils size={20} className="text-[var(--primary)] mb-1" />
                <span className="text-xs font-semibold text-slate-700">{recipe.difficultyLevel || "Med"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-8 md:mt-12">
          {/* Header Section */}
          <div className="md:flex md:justify-between md:items-start mb-8">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-3 tracking-tight text-slate-700">{recipe.title}</h2>
              <p className="text-slate-500 leading-relaxed text-lg">
                {recipe.description}
              </p>
            </div>
            
            {/* Desktop Metrics */}
            <div className="hidden md:flex gap-4 mt-6 md:mt-0">
              <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 min-w-[5rem]">
                <Clock size={20} className="text-[var(--primary)] mb-2" />
                <span className="text-sm font-semibold text-slate-700">{recipe.totalTime || 30}m</span>
              </div>
              <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 min-w-[5rem]">
                <Flame size={20} className="text-[var(--primary)] mb-2" />
                <span className="text-sm font-semibold text-slate-700">{recipe.calories || 450} kcal</span>
              </div>
            </div>
          </div>

          {/* Two-Column Layout for Tablet/Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Left Column: Ingredients */}
            <div className="md:col-span-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-600">
                  <Sparkles size={20} className="text-[var(--primary)]" />
                  Ingredients
                </h3>
                <span className="text-sm text-slate-400 font-medium">{recipe.ingredients.length} items</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <span className="text-xl font-bold text-[var(--primary)]">{ing.quantity}</span>
                    </div>
                    <div>
                      <p className="font-semibold capitalize text-slate-600">{ing.ingredient.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Instructions */}
            <div className="md:col-span-7 mt-8 md:mt-0">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-600">
                <ChefHat size={20} className="text-[var(--primary)]" />
                Instructions
              </h3>

              <div className="space-y-4">
                {instructions.map((step, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm border border-white">
                      {i + 1}
                    </div>
                    <p className="text-slate-500 leading-relaxed text-base pt-1">
                      {step}
                    </p>
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
