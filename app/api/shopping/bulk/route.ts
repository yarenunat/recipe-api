import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ingredients } = await req.json(); // Array of { id, quantity, name }

    let list = await prisma.shoppingList.findFirst({
      where: { userId: session.user.id }
    });

    if (!list) {
      list = await prisma.shoppingList.create({
        data: { name: "My Groceries", userId: session.user.id }
      });
    }

    for (const ing of ingredients) {
      await prisma.shoppingItem.create({
        data: {
          shoppingListId: list.id,
          ingredientId: ing.id,
          quantity: ing.quantity,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shopping list add error:", error);
    return NextResponse.json({ error: "Failed to add items" }, { status: 500 });
  }
}
