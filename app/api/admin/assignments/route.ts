import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const { teacherId, subjectId } = await req.json();
  if (!teacherId || !subjectId) {
    return NextResponse.json(
      { error: "Изберете наставник и предмет." },
      { status: 400 }
    );
  }

  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: "teacher" },
  });
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });
  if (!teacher || !subject) {
    return NextResponse.json({ error: "Наставникот или предметот не постои." }, { status: 404 });
  }

  // Годината на доделувањето е СЕКОГАШ годината на предметот — наставникот се доделува само за таа година
  const year = subject.year;

  const existing = await prisma.teacherAssignment.findFirst({
    where: { teacherId, subjectId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Наставникот веќе е доделен на овој предмет." },
      { status: 400 }
    );
  }

  await prisma.subject.update({
    where: { id: subjectId },
    data: { teacherId },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId,
      subjectId,
      year,
    },
  });

  return NextResponse.json({ success: true });
}
