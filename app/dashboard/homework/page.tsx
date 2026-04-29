import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import Link from "next/link";
import { HomeworkList } from "./HomeworkList";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; task?: string }>;
}) {
  const { subject: subjectId, task: taskId } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if ((session.user as { role?: string }).role !== "student") redirect("/dashboard");

  const enrollments = await prisma.studentSubject.findMany({
    where: { studentId: userId! },
    include: {
      subject: {
        include: {
          homework: { orderBy: { dueDate: "asc" } },
          teacher: true,
        },
      },
    },
  });

  const subjects = enrollments.map((e) => ({
    ...e.subject,
    homework: e.subject.homework.filter(
      (h) => (h as { published?: boolean }).published !== false
    ),
  }));
  const selectedSubject = subjectId
    ? subjects.find((s) => s.id === subjectId)
    : subjects[0];

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Домашни</h1>
      <p className="text-slate-600 mb-8">
        Преглед на домашните по предмети и повратни информации.
      </p>

      <HomeworkList
        subjects={subjects}
        selectedSubjectId={selectedSubject?.id}
        selectedTaskId={taskId}
        userId={userId!}
      />
    </div>
  );
}
