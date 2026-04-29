import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const { name, description, year, teacherId } = await req.json();
  if (!name?.trim() || ![1, 2, 3, 4].includes(Number(year))) {
    return NextResponse.json(
      { error: "Име и година (1–4) се задолжителни." },
      { status: 400 }
    );
  }
  if (!teacherId) {
    return NextResponse.json(
      { error: "Изберете наставник." },
      { status: 400 }
    );
  }
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: "teacher" },
  });
  if (!teacher) {
    return NextResponse.json({ error: "Наставникот не постои." }, { status: 404 });
  }

  const subject = await prisma.subject.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      year: Number(year),
      teacherId,
    },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId,
      subjectId: subject.id,
      year: Number(year),
    },
  });

  return NextResponse.json({ success: true, subjectId: subject.id });
}
