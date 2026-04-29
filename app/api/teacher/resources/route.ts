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
    const subjectId = formData.get("subjectId") as string | null;
    const moduleId = formData.get("moduleId") as string | null;
    const title = formData.get("title") as string | null;
    const type = formData.get("type") as string | null; // "link" | "file"
    const url = formData.get("url") as string | null; // for link
    const file = formData.get("file") as File | null;

    if (!subjectId || !title?.trim()) {
      return NextResponse.json(
        { error: "Недостасува предмет или наслов." },
        { status: 400 }
      );
    }
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, teacherId },
    });
    if (!subject) {
      return NextResponse.json({ error: "Предметот не постои или немате пристап." }, { status: 404 });
    }

    let resourceUrl = url?.trim() || "";
    if (type === "file" && file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || "";
      const filename = `res-${Date.now()}${ext}`;
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

    if (moduleId) {
      const module = await prisma.module.findFirst({
        where: { id: moduleId, subjectId },
      });
      if (!module) {
        return NextResponse.json({ error: "Модулот не постои." }, { status: 404 });
      }
      await prisma.resource.create({
        data: {
          moduleId,
          title: title.trim(),
          type: type === "link" ? "link" : "document",
          url: resourceUrl,
        },
      });
    } else {
      await prisma.subjectResource.create({
        data: {
          subjectId,
          title: title.trim(),
          type: type === "link" ? "link" : "file",
          url: resourceUrl,
        },
      });
    }
    return NextResponse.json({ success: true });
  }

  const body = await req.json();
  const { subjectId, moduleId, title, type, url } = body;
  if (!subjectId || !title?.trim()) {
    return NextResponse.json(
      { error: "Недостасува предмет или наслов." },
      { status: 400 }
    );
  }
  if (!url?.trim() && type === "link") {
    return NextResponse.json({ error: "Внесете URL за линк." }, { status: 400 });
  }
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, teacherId },
  });
  if (!subject) {
    return NextResponse.json({ error: "Предметот не постои или немате пристап." }, { status: 404 });
  }
  const resourceType = type === "link" ? "link" : "file";
  const resourceUrl = (url as string)?.trim() || "";

  if (moduleId) {
    const module = await prisma.module.findFirst({
      where: { id: moduleId, subjectId },
    });
    if (!module) {
      return NextResponse.json({ error: "Модулот не постои." }, { status: 404 });
    }
    await prisma.resource.create({
      data: {
        moduleId,
        title: title.trim(),
        type: resourceType === "link" ? "link" : "document",
        url: resourceUrl,
      },
    });
  } else {
    await prisma.subjectResource.create({
      data: {
        subjectId,
        title: title.trim(),
        type: resourceType,
        url: resourceUrl,
      },
    });
  }
  return NextResponse.json({ success: true });
}
