import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "teacher") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const teacherId = (session.user as { id?: string }).id;

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const homeworkId = formData.get("homeworkId") as string | null;
    const title = formData.get("title") as string | null;
    const type = formData.get("type") as string | null;
    const url = formData.get("url") as string | null;
    const file = formData.get("file") as File | null;

    if (!homeworkId || !title?.trim()) {
      return NextResponse.json(
        { error: "Недостасува домашна или наслов." },
        { status: 400 }
      );
    }
    const homework = await prisma.homework.findFirst({
      where: { id: homeworkId },
      include: { subject: true },
    });
    if (!homework || homework.subject.teacherId !== teacherId) {
      return NextResponse.json({ error: "Домашната не постои или немате пристап." }, { status: 404 });
    }

    let resourceUrl = url?.trim() || "";
    if (type === "file" && file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || "";
      const filename = `hw-${homeworkId}-${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      resourceUrl = `/uploads/${filename}`;
    } else if (type === "link" && url?.trim()) {
      resourceUrl = url.trim();
    } else {
      return NextResponse.json(
        { error: "Додајте линк или прикачете датотека." },
        { status: 400 }
      );
    }

    await prisma.homeworkResource.create({
      data: {
        homeworkId,
        title: title.trim(),
        type: type === "link" ? "link" : "file",
        url: resourceUrl,
      },
    });
    return NextResponse.json({ success: true });
  }

  const body = await req.json();
  const { homeworkId, title, type, url } = body;
  if (!homeworkId || !title?.trim()) {
    return NextResponse.json(
      { error: "Недостасува домашна или наслов." },
      { status: 400 }
    );
  }
  if (type !== "link" || !url?.trim()) {
    return NextResponse.json(
      { error: "За линк внесете URL." },
      { status: 400 }
    );
  }
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId },
    include: { subject: true },
  });
  if (!homework || homework.subject.teacherId !== teacherId) {
    return NextResponse.json({ error: "Домашната не постои или немате пристап." }, { status: 404 });
  }

  await prisma.homeworkResource.create({
    data: {
      homeworkId,
      title: title.trim(),
      type: "link",
      url: url.trim(),
    },
  });
  return NextResponse.json({ success: true });
}
