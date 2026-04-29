import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import Link from "next/link";
import { BookOpen, ClipboardList, Users, FileText } from "lucide-react";

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if ((session.user as { role?: string }).role !== "teacher" || !userId)
    redirect("/dashboard");

  const [subjects, recentHomework, pendingFeedback] = await Promise.all([
    prisma.subject.findMany({
      where: { teacherId: userId },
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.homework.findMany({
      where: { subject: { teacherId: userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { subject: true },
    }),
    prisma.homeworkSubmission.findMany({
      where: {
        homework: { subject: { teacherId: userId } },
        feedback: { none: {} },
      },
      take: 5,
      include: {
        homework: { include: { subject: true } },
        student: true,
      },
    }),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-5xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Добредојдовте, {session.user.name}
      </h1>
      <p className="text-slate-600 mb-8">Преглед на вашите предмети и домашни.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </span>
            <span className="font-semibold text-slate-800">Предмети</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{subjects.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-600" />
            </span>
            <span className="font-semibold text-slate-800">Домашни</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{recentHomework.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </span>
            <span className="font-semibold text-slate-800">Чекаат повратни информации</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingFeedback.length}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          Вашите предмети
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {subjects.length === 0 ? (
            <p className="text-slate-500">Немате доделени предмети.</p>
          ) : (
            subjects.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/teacher/subjects/${s.id}`}
                className="flex items-center justify-between p-5 bg-white rounded-2xl border border-primary-50 shadow-soft hover:shadow-card hover:border-primary-100 transition-all"
              >
                <div>
                  <p className="font-semibold text-slate-800">{s.name}</p>
                  <p className="text-sm text-slate-500">
                    Година {s.year} · {s._count.students} студенти
                  </p>
                </div>
                <span className="text-primary-600 font-medium text-sm">Отвори →</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary-500" />
          Поднесени домашни без повратна информација
        </h2>
        {pendingFeedback.length === 0 ? (
          <p className="text-slate-500 text-sm">Нема нови поднесени домашни.</p>
        ) : (
          <ul className="space-y-2">
            {pendingFeedback.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`/dashboard/teacher/subjects/${sub.homework.subjectId}?tab=homework&submission=${sub.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-primary-50 hover:bg-primary-50/50 transition-colors"
                >
                  <span className="font-medium text-slate-800">
                    {sub.student.name} — {sub.homework.title}
                  </span>
                  <span className="text-sm text-slate-500">
                    {format(new Date(sub.submittedAt), "d MMM yyyy", { locale: mk })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
