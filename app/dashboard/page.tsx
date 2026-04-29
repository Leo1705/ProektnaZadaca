import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  BookOpen,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role;
  if (role !== "student" || !userId) redirect("/dashboard");

  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentSubjects: {
        include: {
          subject: {
            include: { teacher: true },
          },
        },
      },
    },
  });

  const subjectIds = student?.studentSubjects.map((s) => s.subjectId) ?? [];

  const [homeworkRaw, newestSubmissions, recentFeedback] = await Promise.all([
    prisma.homework.findMany({
      where: { subjectId: { in: subjectIds } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { subject: true },
    }),
    prisma.homeworkSubmission.findMany({
      where: { studentId: userId },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        homework: { include: { subject: true } },
      },
    }),
    prisma.feedback.findMany({
      where: {
        submission: { studentId: userId },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        submission: {
          include: {
            homework: { include: { subject: true } },
          },
        },
        teacher: true,
      },
    }),
  ]);

  const newestHomework = homeworkRaw
    .filter((h) => (h as { published?: boolean }).published !== false)
    .slice(0, 5);

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="animate-in">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Добредојдовте, {session.user.name}
        </h1>
        <p className="text-slate-600 mb-8">
          Еве преглед на вашите најнови активности.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6 animate-in">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <ClipboardList className="w-5 h-5 text-primary-500" />
            Најнови домашни
          </h2>
          <ul className="space-y-3">
            {newestHomework.length === 0 ? (
              <li className="text-slate-500 text-sm">Нема домашни.</li>
            ) : (
              newestHomework.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/dashboard/subjects/${h.subjectId}#homework`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-primary-700">
                        {h.title}
                      </p>
                      <p className="text-sm text-slate-500">{h.subject.name}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6 animate-in">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <FileText className="w-5 h-5 text-primary-500" />
            Најнови документи / поднесени домашни
          </h2>
          <ul className="space-y-3">
            {newestSubmissions.length === 0 ? (
              <li className="text-slate-500 text-sm">Нема поднесени домашни.</li>
            ) : (
              newestSubmissions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/homework?subject=${s.homework.subjectId}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-primary-700">
                        {s.homework.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {s.homework.subject.name} ·{" "}
                        {format(new Date(s.submittedAt), "d MMM yyyy", {
                          locale: mk,
                        })}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="mt-6 bg-white rounded-2xl border border-primary-50 shadow-soft p-6 animate-in">
        <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          Повратни информации од наставници
        </h2>
        <ul className="space-y-4">
          {recentFeedback.length === 0 ? (
            <li className="text-slate-500 text-sm">Нема повратни информации.</li>
          ) : (
            recentFeedback.map((f) => (
              <li
                key={f.id}
                className="p-4 rounded-xl bg-primary-50/50 border border-primary-100"
              >
                <p className="text-slate-800">{f.comment}</p>
                <p className="text-sm text-slate-500 mt-2">
                  {f.teacher.name} — {f.submission.homework.title} (
                  {f.submission.homework.subject.name})
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(f.createdAt), "d MMM yyyy, HH:mm", {
                    locale: mk,
                  })}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="mt-6">
        <Link
          href="/dashboard/subjects"
          className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
        >
          <BookOpen className="w-4 h-4" />
          Сите предмети →
        </Link>
      </div>
    </div>
  );
}
