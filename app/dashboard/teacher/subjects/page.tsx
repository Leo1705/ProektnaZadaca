import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

export default async function TeacherSubjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if ((session.user as { role?: string }).role !== "teacher" || !userId)
    redirect("/dashboard");

  const subjects = await prisma.subject.findMany({
    where: { teacherId: userId },
    include: { _count: { select: { students: true, homework: true, modules: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Мои предмети</h1>
      <p className="text-slate-600 mb-8">
        Управувајте со модули, материјали и домашни за секој предмет.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {subjects.length === 0 ? (
          <p className="text-slate-500 col-span-2">
            Немате доделени предмети. Контактирајте го администраторот.
          </p>
        ) : (
          subjects.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/teacher/subjects/${s.id}`}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-primary-50 shadow-soft hover:shadow-card hover:border-primary-100 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-800 group-hover:text-primary-700">
                    {s.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Година {s.year} · {s._count.students} студенти · {s._count.modules} модули ·{" "}
                    {s._count.homework} домашни
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
