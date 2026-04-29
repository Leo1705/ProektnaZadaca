import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { TeacherSubjectTabs } from "./TeacherSubjectTabs";

export default async function TeacherSubjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; submission?: string }>;
}) {
  const { id } = await params;
  const { tab, submission } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if ((session.user as { role?: string }).role !== "teacher" || !userId)
    redirect("/dashboard");

  if (!id || typeof id !== "string") notFound();

  const subject = await prisma.subject.findFirst({
    where: { id: String(id), teacherId: String(userId) },
    include: {
      modules: { orderBy: { order: "asc" }, include: { resources: true } },
      resources: true,
      students: { include: { student: true } },
    },
  });

  if (!subject) notFound();

  const homework = await prisma.homework.findMany({
    where: { subjectId: subject.id },
    orderBy: { dueDate: "asc" },
    include: {
      resources: true,
      submissions: { include: { student: true, feedback: true } },
    },
  });

  const subjectWithHomework = { ...subject, homework };

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <Link
        href="/dashboard/teacher/subjects"
        className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium mb-6 hover:underline"
      >
        ← Назад кон предмети
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">{subject.name}</h1>
      {subject.description && (
        <p className="text-slate-600 mb-6">{subject.description}</p>
      )}
      <p className="text-sm text-slate-500 mb-8">
        Година {subject.year} · {subject.students.length} запишани студенти
      </p>

      <TeacherSubjectTabs
        subject={subjectWithHomework}
        activeTab={tab ?? "content"}
        highlightSubmissionId={submission}
      />
    </div>
  );
}
