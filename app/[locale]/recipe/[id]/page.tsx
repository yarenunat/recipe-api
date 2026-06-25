import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RecipePageClient from "./RecipePageClient";

export const revalidate = 60;

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  let instructions: string[] = [];
  try {
    instructions = JSON.parse(recipe.instructions as string);
  } catch (e) {
    if (typeof recipe.instructions === "string") {
      instructions = [recipe.instructions];
    }
  }

  return <RecipePageClient recipe={recipe} instructions={instructions} />;
}
