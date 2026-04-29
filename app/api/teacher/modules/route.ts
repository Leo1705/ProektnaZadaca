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
  const { subjectId, title, description, order } = await req.json();
  if (!subjectId || !title?.trim()) {
    return NextResponse.json(
      { error: "Недостасува предмет или наслов на модул." },
      { status: 400 }
    );
  }
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, teacherId },
  });
  if (!subject) {
    return NextResponse.json({ error: "Предметот не постои или немате пристап." }, { status: 404 });
  }
  const nextOrder =
    order != null
      ? Number(order)
      : ((await prisma.module.count({ where: { subjectId } })) + 1);
  const module = await prisma.module.create({
    data: {
      subjectId,
      title: title.trim(),
      description: description?.trim() || null,
      order: nextOrder,
    },
  });
  return NextResponse.json({ success: true, module });
}
