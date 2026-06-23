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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const mealPlans = await prisma.mealPlanItem.findMany({
      where: {
        mealPlan: { userId: session.user.id },
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        }
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json(mealPlans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
