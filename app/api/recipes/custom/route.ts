import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customRecipes = await prisma.recipe.findMany({
      where: {
        userId: session.user.id,
        isCustom: true
      },
      include: {
        images: { take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ recipes: customRecipes });
  } catch (error) {
    console.error("Failed to fetch custom recipes:", error);
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
    const { title, description, instructions, ingredients, imageBase64 } = body;

    if (!title || !instructions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions: JSON.stringify(instructions.split('\n').filter((i: string) => i.trim() !== '')),
        isCustom: true,
        userId: session.user.id,
        ingredients: {
          create: Array.from(new Map(ingredients.map((ing: any) => [ing.name.toLowerCase().trim(), ing])).values()).map((ing: any) => ({
            ingredient: {
              connectOrCreate: {
                where: { name: ing.name.toLowerCase().trim() },
                create: { name: ing.name.toLowerCase().trim() }
              }
            },
            quantity: ing.quantity || "",
            unit: ""
          }))
        },
        images: imageBase64 ? {
          create: {
            url: imageBase64
          }
        } : undefined
      }
    });

    return NextResponse.json({ success: true, recipe: newRecipe }, { status: 201 });
  } catch (error) {
    console.error("Failed to create custom recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
