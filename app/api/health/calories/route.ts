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
    const dateStr = searchParams.get("date"); // YYYY-MM-DD format

    let whereClause: any = { userId: session.user.id };

    if (dateStr) {
      const targetDate = new Date(dateStr); // this gives midnight UTC
      const endOfDay = new Date(dateStr);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      whereClause.date = {
        gte: targetDate,
        lt: endOfDay
      };
    }

    const calorieLogs = await prisma.calorieLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyCalorieGoal: true }
    });

    return NextResponse.json({ logs: calorieLogs, goal: user?.dailyCalorieGoal || 2000 });
  } catch (error) {
    console.error("Failed to fetch calorie logs:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { calories, foodName, mealType, date, goal } = await req.json();
    const logDate = new Date(date);

    const log = await prisma.calorieLog.create({
      data: {
        userId: session.user.id,
        calories: parseInt(calories),
        foodName,
        mealType,
        date: logDate,
      }
    });

    if (goal) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { dailyCalorieGoal: parseInt(goal) }
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to log calories:", error);
    return NextResponse.json({ error: "Failed to log calories" }, { status: 500 });
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

    await prisma.calorieLog.delete({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
