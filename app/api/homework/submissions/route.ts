import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Неовластено" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const homeworkId = searchParams.get("homeworkId");
  if (!homeworkId) {
    return NextResponse.json({ error: "Недостасува homeworkId" }, { status: 400 });
  }
  const userId = (session.user as { id?: string }).id;
  const submissions = await prisma.homeworkSubmission.findMany({
    where: { homeworkId, studentId: userId },
    orderBy: { submittedAt: "desc" },
    include: {
      feedback: { include: { teacher: true } },
    },
  });
  return NextResponse.json({ submissions });
}
