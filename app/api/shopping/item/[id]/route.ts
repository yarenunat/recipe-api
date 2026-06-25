import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isChecked } = await req.json();

    // Verify ownership indirectly by finding if the item belongs to a list owned by the user
    const item = await prisma.shoppingItem.findUnique({
      where: { id },
      include: { shoppingList: true }
    });

    if (!item || item.shoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updatedItem = await prisma.shoppingItem.update({
      where: { id },
      data: { isChecked }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
