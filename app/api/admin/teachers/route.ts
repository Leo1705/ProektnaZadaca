import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const { name, email, password } = await req.json();
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Име, е-пошта и лозинка (мин. 6 знаци) се задолжителни." },
      { status: 400 }
    );
  }
  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return NextResponse.json(
      { error: "Корисник со оваа е-пошта веќе постои." },
      { status: 400 }
    );
  }
  const passwordHash = await hash(password, 12);
  await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role: "teacher",
    },
  });
  return NextResponse.json({ success: true });
}
