import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.recipe.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
