import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  const year = (session.user as { year?: number }).year;
  if ((session.user as { role?: string }).role !== "student" || !userId)
    redirect("/dashboard");

  if (year != null) {
    const subjectsForYear = await prisma.subject.findMany({
      where: { year },
      select: { id: true },
    });
    for (const s of subjectsForYear) {
      await prisma.studentSubject.upsert({
        where: {
          studentId_subjectId: { studentId: userId, subjectId: s.id },
        },
        update: {},
        create: { studentId: userId, subjectId: s.id },
      });
    }
  }

  const subjects = await prisma.studentSubject.findMany({
    where: { studentId: userId },
    include: {
      subject: {
        include: { teacher: true },
      },
    },
    orderBy: { subject: { name: "asc" } },
  });

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Предмети</h1>
      <p className="text-slate-600 mb-8">
        Изберете предмет за да ги видите модулите, материјалите и домашните.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {subjects.length === 0 ? (
          <p className="text-slate-500 col-span-2">
            Немате запишани предмети. Контактирајте го администраторот.
          </p>
        ) : (
          subjects.map(({ subject }) => (
            <Link
              key={subject.id}
              href={`/dashboard/subjects/${subject.id}`}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-primary-50 shadow-soft hover:shadow-card hover:border-primary-100 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-800 group-hover:text-primary-700">
                    {subject.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {subject.teacher.name}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 shrink-0" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
