import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword, avatar } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {};

    // Handle Name & Email & Avatar
    if (name) updates.name = name;
    if (avatar) updates.image = avatar;
    
    if (email && email !== user.email) {
      // Strict validation for common typos
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Geçersiz bir e-posta adresi girdiniz." }, { status: 400 });
      }

      const commonTypos = ["gmail.co", "hotmail.co", "outlook.co", "yahoo.co"];
      const domain = email.split("@")[1]?.toLowerCase();
      if (commonTypos.includes(domain)) {
        return NextResponse.json({ error: "E-posta uzantısı eksik görünüyor (örn: .com). Lütfen kontrol edin." }, { status: 400 });
      }

      // Check for email uniqueness
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 400 });
      }
      updates.email = email;
    }

    // Handle Password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Mevcut şifrenizi girmelisiniz." }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password || "");
      if (!isValid && user.password) { // If user.password is null, they signed up with OAuth
        return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Değişiklik yapılmadı." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updates
    });

    return NextResponse.json({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    });

  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Ayarlar güncellenirken bir hata oluştu." }, { status: 500 });
  }
}
