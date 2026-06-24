import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { recipeId } = await req.json();

    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    // Verify ownership
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Add recipe to collection
    const collectionRecipe = await prisma.collectionRecipe.create({
      data: {
        collectionId: id,
        recipeId
      }
    });

    return NextResponse.json(collectionRecipe);
  } catch (error: any) {
    // Unique constraint error if already added
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Recipe already in collection" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add recipe to collection" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(req.url);
    const recipeId = url.searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.collectionRecipe.delete({
      where: {
        collectionId_recipeId: {
          collectionId: id,
          recipeId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove recipe from collection" }, { status: 500 });
  }
}
