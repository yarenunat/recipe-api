import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RecipePageClient from "./RecipePageClient";

export const revalidate = 60;

export default async function RecipePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      images: true,
      ingredients: { include: { ingredient: true } },
    },
  });

  if (!recipe) {
    notFound();
  }

  // Parse original instructions
  let instructions: string[] = [];
  try {
    instructions = JSON.parse(recipe.instructions as string);
  } catch (e) {
    if (typeof recipe.instructions === "string") {
      instructions = [recipe.instructions];
    }
  }

  // Parse original tips
  let tipsArray: string[] = [];
  if (recipe.tips) {
    try {
      tipsArray = JSON.parse(recipe.tips);
    } catch (e) {
      if (typeof recipe.tips === "string") {
        tipsArray = [recipe.tips];
      }
    }
  }

  // Pass the raw recipe, instructions and locale. Client component will handle translation if needed.
  return <RecipePageClient recipe={recipe} instructions={instructions} locale={locale} />;
}
