import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { itemName } = await req.json();

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    // Verify ownership
    const list = await prisma.shoppingList.findUnique({ where: { id } });
    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Call Groq to generate the emoji
    let emoji = "🛒"; // default
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ 
            role: "system", 
            content: "You are an emoji generator. Output exactly ONE single emoji that best represents the given item. No text, no markdown, no explanation." 
          }, {
            role: "user",
            content: itemName
          }],
          temperature: 0.1,
          max_tokens: 10,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0].message.content.trim();
        // Extract the first emoji character if multiple are returned
        const match = content.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu);
        if (match && match.length > 0) {
          emoji = match[0];
        }
      } else {
        console.warn("Groq failed to fetch emoji, using default.");
      }
    } catch (e) {
      console.warn("Groq fetch error:", e);
    }

    // Upsert the ingredient
    const normalizedName = itemName.toLowerCase().trim();
    
    // First try to find existing to check if it has an icon
    let ingredient = await prisma.ingredient.findUnique({
      where: { name: normalizedName },
      include: { icon: true }
    });

    if (!ingredient) {
      ingredient = await prisma.ingredient.create({
        data: {
          name: normalizedName,
        }
      });
    }

    // If no icon exists, create one with the generated emoji
    if (!ingredient.icon) {
      await prisma.generatedIcon.create({
        data: {
          ingredientId: ingredient.id,
          url: `emoji:${emoji}`
        }
      });
    }

    // Create the shopping item
    const shoppingItem = await prisma.shoppingItem.create({
      data: {
        listId: id,
        ingredientId: ingredient.id,
        quantity: "1",
        unit: "pcs"
      },
      include: {
        ingredient: {
          include: {
            icon: true
          }
        }
      }
    });

    return NextResponse.json(shoppingItem);
  } catch (error: any) {
    console.error("Add item error:", error);
    return NextResponse.json({ error: error.message || "Failed to add item" }, { status: 500 });
  }
}
