import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: {
        recipes: {
          include: { recipe: true }
        }
      }
    });

    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    const collection = await prisma.collection.create({
      data: {
        name,
        userId: session.user.id,
      }
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
