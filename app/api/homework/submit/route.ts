import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const homeworkId = formData.get("homeworkId") as string | null;
  if (!file || !homeworkId) {
    return NextResponse.json(
      { error: "Недостасува датотека или домашна." },
      { status: 400 }
    );
  }

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId },
    include: { subject: true },
  });
  if (!homework) {
    return NextResponse.json({ error: "Домашната не постои." }, { status: 404 });
  }
  if (!homework.published) {
    return NextResponse.json(
      { error: "Домашната сè уште не е објавена од наставникот." },
      { status: 403 }
    );
  }

  const enrollment = await prisma.studentSubject.findFirst({
    where: { studentId: userId, subjectId: homework.subjectId },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Не сте запишани на предметот." }, { status: 403 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".bin";
  const filename = `${homeworkId}-${userId}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);
  const fileUrl = `/uploads/${filename}`;

  await prisma.homeworkSubmission.create({
    data: {
      homeworkId,
      studentId: userId!,
      fileUrl,
      comment: null,
    },
  });

  return NextResponse.json({ success: true, fileUrl });
}
