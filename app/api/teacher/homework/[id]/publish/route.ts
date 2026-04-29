import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "teacher") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const teacherId = (session.user as { id?: string }).id;
  const { id: homeworkId } = await params;

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId },
    include: { subject: true },
  });
  if (!homework || homework.subject.teacherId !== teacherId) {
    return NextResponse.json({ error: "Домашната не постои или немате пристап." }, { status: 404 });
  }

  await prisma.homework.update({
    where: { id: homeworkId },
    data: { published: true },
  });
  return NextResponse.json({ success: true });
}
