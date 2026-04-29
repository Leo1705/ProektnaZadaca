import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Неовластено" }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const image = formData.get("image") as File | null;

  const updates: { name?: string; email?: string; passwordHash?: string; profileImage?: string } = {};

  if (name?.trim()) updates.name = name.trim();
  if (email?.trim()) {
    const existing = await prisma.user.findFirst({
      where: { email: email.trim(), NOT: { id: userId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Е-поштата веќе се користи од друг корисник." },
        { status: 400 }
      );
    }
    updates.email = email.trim();
  }
  if (password && password.length >= 6) {
    updates.passwordHash = await hash(password, 12);
  }
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(image.name) || ".jpg";
    const filename = `avatar-${userId}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    updates.profileImage = `/uploads/${filename}`;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Нема промени за зачувување." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    image: user.profileImage,
  });
}
