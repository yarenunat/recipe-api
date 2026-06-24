import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    await prisma.recipe.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
