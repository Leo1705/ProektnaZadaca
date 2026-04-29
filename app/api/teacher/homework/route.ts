import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "teacher") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const teacherId = (session.user as { id?: string }).id;
  const body = await req.json();
  const { subjectId, title, description, dueDate, maxPoints, published } = body;
  if (!subjectId || !title?.trim()) {
    return NextResponse.json(
      { error: "Недостасува предмет или наслов на домашна." },
      { status: 400 }
    );
  }
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, teacherId },
  });
  if (!subject) {
    return NextResponse.json({ error: "Предметот не постои или немате пристап." }, { status: 404 });
  }
  const homework = await prisma.homework.create({
    data: {
      subjectId,
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      maxPoints: maxPoints != null ? Number(maxPoints) : null,
      published: published === true,
    },
  });
  return NextResponse.json({ success: true, homework: { id: homework.id } });
}
