import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // First find or create the user's default meal plan
    let mealPlan = await prisma.mealPlan.findFirst({
      where: { userId: session.user.id }
    });

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: session.user.id,
          name: "My Meal Plan"
        }
      });
    }

    const items = await prisma.mealPlanItem.findMany({
      where: {
        mealPlanId: mealPlan.id,
        ...(startDate && endDate ? { date: dateFilter } : {})
      },
      include: {
        recipe: {
          select: { id: true, title: true, images: { take: 1 } }
        }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch meal plan:", error);
    return NextResponse.json({ error: "Failed to fetch meal plan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId, customText, date, mealType } = await req.json();

    if (!date || !mealType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!recipeId && !customText) {
      return NextResponse.json({ error: "Must provide either recipeId or customText" }, { status: 400 });
    }

    let mealPlan = await prisma.mealPlan.findFirst({
      where: { userId: session.user.id }
    });

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: { userId: session.user.id, name: "My Meal Plan" }
      });
    }

    const item = await prisma.mealPlanItem.create({
      data: {
        mealPlanId: mealPlan.id,
        date: new Date(date),
        mealType,
        recipeId: recipeId || null,
        customText: customText || null,
      },
      include: {
        recipe: {
          select: { id: true, title: true, images: { take: 1 } }
        }
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to add meal plan item:", error);
    return NextResponse.json({ error: "Failed to add meal" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const item = await prisma.mealPlanItem.findUnique({
      where: { id },
      include: { mealPlan: true }
    });

    if (!item || item.mealPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.mealPlanItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete meal plan item" }, { status: 500 });
  }
}
