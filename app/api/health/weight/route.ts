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
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 30;

    const weightLogs = await prisma.weightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      take: limit,
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currentWeight: true, targetWeight: true, height: true }
    });

    return NextResponse.json({ logs: weightLogs, profile: user });
  } catch (error) {
    console.error("Failed to fetch weight logs:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weight, date, targetWeight } = await req.json();
    const logDate = new Date(date);
    logDate.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC for @db.Date matching

    const log = await prisma.weightLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: logDate,
        }
      },
      update: { weight: parseFloat(weight) },
      create: {
        userId: session.user.id,
        weight: parseFloat(weight),
        date: logDate,
      }
    });

    // Update user's current and target weight
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        currentWeight: parseFloat(weight),
        ...(targetWeight ? { targetWeight: parseFloat(targetWeight) } : {})
      }
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to add weight log:", error);
    return NextResponse.json({ error: "Failed to log weight" }, { status: 500 });
  }
}
