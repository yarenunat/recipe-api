import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const params = await props.params;
    const id = params.id;

    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (recipe.userId && recipe.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.recipe.delete({
      where: { id }
    });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const params = await props.params;
    const id = params.id;

    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (recipe.userId && recipe.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, instructions, imageUrl, ingredients } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (instructions !== undefined) updates.instructions = JSON.stringify(instructions);

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: updates,
    });

    // Update image if provided
    if (imageUrl !== undefined) {
      const existingImage = await prisma.recipeImage.findFirst({ where: { recipeId: id } });
      if (imageUrl === "") {
        if (existingImage) {
          await prisma.recipeImage.delete({ where: { id: existingImage.id } });
        }
      } else if (existingImage) {
        await prisma.recipeImage.update({
          where: { id: existingImage.id },
          data: { url: imageUrl },
        });
      } else {
        await prisma.recipeImage.create({
          data: { recipeId: id, url: imageUrl },
        });
      }
    }

    // Update ingredients if provided
    if (ingredients !== undefined && Array.isArray(ingredients)) {
      // Delete old ingredients
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
      // Re-create
      for (const ing of ingredients) {
        const normalizedName = ing.name.toLowerCase().trim();
        let ingredient = await prisma.ingredient.findUnique({ where: { name: normalizedName } });
        if (!ingredient) {
          ingredient = await prisma.ingredient.create({ data: { name: normalizedName } });
        }
        await prisma.recipeIngredient.create({
          data: {
            recipeId: id,
            ingredientId: ingredient.id,
            quantity: ing.quantity || "",
          },
        });
      }
    }

    revalidatePath(`/recipe/${id}`);
    revalidatePath("/");
    return NextResponse.json({ success: true, recipe: updatedRecipe });
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
