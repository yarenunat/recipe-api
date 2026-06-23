import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const recipes = await prisma.recipe.findMany({
      where: userId ? { userId } : {}, // Return all if no user is logged in for demo purposes
      include: {
        images: true,
        ingredients: { include: { ingredient: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description,
        instructions: JSON.stringify(body.instructions),
        cookingTime: body.cookingTime,
        prepTime: body.prepTime,
        totalTime: body.totalTime,
        servings: body.servings,
        difficultyLevel: body.difficultyLevel,
        userId: session.user.id,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
