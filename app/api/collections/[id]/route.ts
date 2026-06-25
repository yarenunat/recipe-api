import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            recipe: {
              include: { images: { take: 1 } }
            }
          }
        }
      }
    });

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const { recipeId } = await req.json();

    // Verify collection belongs to user
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Upsert to avoid duplicates
    const entry = await prisma.collectionRecipe.upsert({
      where: { collectionId_recipeId: { collectionId: id, recipeId } },
      create: { collectionId: id, recipeId },
      update: {},
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to add recipe to collection:", error);
    return NextResponse.json({ error: "Failed to add recipe to collection" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    if (recipeId) {
      // Remove specific recipe from collection
      await prisma.collectionRecipe.delete({
        where: { collectionId_recipeId: { collectionId: id, recipeId } },
      });
    } else {
      // Delete the whole collection
      await prisma.collection.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
