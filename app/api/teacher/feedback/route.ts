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
  const { submissionId, comment } = await req.json();
  if (!submissionId || !comment?.trim()) {
    return NextResponse.json(
      { error: "Недостасува submissionId или коментар." },
      { status: 400 }
    );
  }

  const submission = await prisma.homeworkSubmission.findFirst({
    where: { id: submissionId },
    include: { homework: { include: { subject: true } } },
  });
  if (!submission || submission.homework.subject.teacherId !== teacherId) {
    return NextResponse.json({ error: "Неовластено" }, { status: 403 });
  }

  await prisma.feedback.create({
    data: {
      submissionId,
      teacherId: teacherId!,
      comment: comment.trim(),
    },
  });

  return NextResponse.json({ success: true });
}
