import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listId } = await params;
    const { itemName } = await req.json();

    if (!itemName?.trim()) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    // Verify ownership
    const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Find or create ingredient
    let ingredient = await prisma.ingredient.findUnique({
      where: { name: itemName.trim().toLowerCase() }
    });

    if (!ingredient) {
      ingredient = await prisma.ingredient.create({
        data: { name: itemName.trim().toLowerCase() }
      });
    }

    // Add to shopping list
    const newItem = await prisma.shoppingItem.create({
      data: {
        shoppingListId: listId,
        ingredientId: ingredient.id,
      },
      include: {
        ingredient: true
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to add manual item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
