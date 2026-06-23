import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shoppingLists = await prisma.shoppingList.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { ingredient: true }
        }
      }
    });

    return NextResponse.json(shoppingLists);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shopping lists" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name,
        userId: session.user.id,
      }
    });

    return NextResponse.json(shoppingList, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create shopping list" }, { status: 500 });
  }
}
