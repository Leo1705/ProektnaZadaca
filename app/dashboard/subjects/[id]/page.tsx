import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen,
  User,
  FileText,
  ExternalLink,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { SubjectModules } from "./SubjectModules";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if ((session.user as { role?: string }).role !== "student") redirect("/dashboard");

  const enrollment = await prisma.studentSubject.findFirst({
    where: { studentId: userId!, subjectId: id },
    include: {
      subject: {
        include: {
          teacher: true,
          modules: { orderBy: { order: "asc" }, include: { resources: true } },
          resources: true,
          homework: { orderBy: { dueDate: "asc" }, include: { resources: true } },
        },
      },
    },
  });

  if (!enrollment) notFound();

  const subject = {
    ...enrollment.subject,
    homework: enrollment.subject.homework.filter(
      (h) => (h as { published?: boolean }).published !== false
    ),
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <Link
        href="/dashboard/subjects"
        className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium mb-6 hover:underline"
      >
        ← Назад кон предмети
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <span className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{subject.name}</h1>
          {subject.description && (
            <p className="text-slate-600 mt-1">{subject.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3 text-slate-500 text-sm">
            <User className="w-4 h-4" />
            Наставник: {subject.teacher.name}
          </div>
        </div>
      </div>

      {subject.resources && subject.resources.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Документи и линкови на предметот
          </h2>
          <ul className="space-y-2">
            {subject.resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url.startsWith("http") ? r.url : r.url}
                  target={r.url.startsWith("http") ? "_blank" : undefined}
                  rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border border-primary-50 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                  {r.type === "link" ? (
                    <ExternalLink className="w-4 h-4 text-primary-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary-500" />
                  )}
                  <span className="font-medium text-slate-800">{r.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SubjectModules modules={subject.modules} />

      <section id="homework" className="mt-8">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary-500" />
          Домашни за овој предмет
        </h2>
        {subject.homework.length === 0 ? (
          <p className="text-slate-500 text-sm">Нема домашни.</p>
        ) : (
          <ul className="space-y-2">
            {subject.homework.map((h) => (
              <li key={h.id} className="rounded-xl bg-white border border-primary-50 overflow-hidden">
                <Link
                  href={`/dashboard/homework?subject=${subject.id}&task=${h.id}`}
                  className="flex items-center justify-between p-3 hover:bg-primary-50/50 transition-colors"
                >
                  <span className="font-medium text-slate-800">{h.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {h.resources && h.resources.length > 0 && (
                  <div className="px-3 pb-3 pt-0 border-t border-primary-50/50">
                    <p className="text-xs text-slate-500 mb-1">Материјали:</p>
                    <ul className="space-y-1">
                      {h.resources.map((r) => (
                        <li key={r.id}>
                          <a
                            href={r.url.startsWith("http") ? r.url : r.url}
                            target={r.url.startsWith("http") ? "_blank" : undefined}
                            rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                          >
                            {r.type === "link" ? (
                              <ExternalLink className="w-3.5 h-3.5" />
                            ) : (
                              <FileText className="w-3.5 h-3.5" />
                            )}
                            {r.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
