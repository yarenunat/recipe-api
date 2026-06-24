import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider") || "groq";

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, dailyCalorieGoal: true, currentWeight: true, targetWeight: true, height: true }
    });

    // Fetch last 30 days of calorie logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const calorieLogs = await prisma.calorieLog.findMany({
      where: { userId: session.user.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" }
    });

    const weightLogs = await prisma.weightLog.findMany({
      where: { userId: session.user.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" }
    });

    // Aggregate data for the AI
    let dataSummary = `User Profile:
Name: ${user?.name || 'User'}
Goal Calories: ${user?.dailyCalorieGoal || 2000} kcal/day
Current Weight: ${user?.currentWeight || 'Unknown'} kg
Target Weight: ${user?.targetWeight || 'Unknown'} kg
Height: ${user?.height || 'Unknown'} cm

Recent Food Log Summary:
`;

    if (calorieLogs.length === 0) {
      dataSummary += "No food logged in the last 30 days.\n";
    } else {
      // Group by date to show daily totals
      const dailyTotals = calorieLogs.reduce((acc: any, log) => {
        const d = log.date.toISOString().split('T')[0];
        if (!acc[d]) acc[d] = { cals: 0, foods: [] };
        acc[d].cals += log.calories;
        acc[d].foods.push(log.foodName);
        return acc;
      }, {});

      for (const [date, info] of Object.entries(dailyTotals) as any) {
        dataSummary += `- ${date}: ${info.cals} kcal. Foods: ${info.foods.join(', ')}\n`;
      }
    }

    dataSummary += "\nWeight Log Summary:\n";
    if (weightLogs.length === 0) {
      dataSummary += "No weight logged in the last 30 days.\n";
    } else {
      weightLogs.forEach(log => {
        dataSummary += `- ${log.date.toISOString().split('T')[0]}: ${log.weight} kg\n`;
      });
    }

    const { text } = await generateText({
      model: getModel(provider as any),
      prompt: `You are an expert AI Dietitian and Health Coach. Analyze the following 30-day health data for the user and provide a highly motivational, insightful, and practical report.

Focus on:
1. Calorie adherence (are they meeting their goals?).
2. Diet quality (based on the foods they logged).
3. Weight trends (are they getting closer to their target weight?).
4. 3 actionable tips for the upcoming week.

Use a friendly, encouraging, and highly professional tone in Turkish. Format the response nicely with Markdown (bolding, bullet points).

DATA:
${dataSummary}`
    });

    return NextResponse.json({ report: text });
  } catch (error) {
    console.error("Failed to generate health report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
