import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, year } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Име, е-пошта и лозинка се задолжителни." },
        { status: 400 }
      );
    }
    const y = Number(year);
    if (![1, 2, 3, 4].includes(y)) {
      return NextResponse.json(
        { error: "Годината мора да биде од 1 до 4." },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Корисник со оваа е-пошта веќе постои." },
        { status: 400 }
      );
    }
    const passwordHash = await hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "student",
        year: y,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Грешка при регистрација." },
      { status: 500 }
    );
  }
}
