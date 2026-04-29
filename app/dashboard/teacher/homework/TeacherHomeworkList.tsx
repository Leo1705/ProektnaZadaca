"use client";

import Link from "next/link";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import { BookOpen, ClipboardList, ChevronRight } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  homework: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    _count: { submissions: number };
    submissions: {
      id: string;
      feedback: { id: string }[];
    }[];
  }[];
};

export function TeacherHomeworkList({ subjects }: { subjects: Subject[] }) {
  const totalHomework = subjects.reduce((acc, s) => acc + s.homework.length, 0);
  if (totalHomework === 0) {
    return (
      <div className="rounded-2xl border border-primary-50 bg-white p-8 text-center text-slate-600">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-primary-300" />
        <p className="font-medium">Нема креирани домашни.</p>
        <p className="text-sm mt-1">
          Одете во <strong>Мои предмети</strong>, изберете предмет и во табот
          „Домашни“ додајте нова домашна.
        </p>
        <Link
          href="/dashboard/teacher/subjects"
          className="inline-block mt-4 text-primary-600 font-medium hover:underline"
        >
          Отвори ги предметите →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className="rounded-2xl border border-primary-50 bg-white overflow-hidden"
        >
          <div className="p-4 border-b border-primary-50 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </span>
            <h2 className="font-semibold text-slate-800">{subject.name}</h2>
          </div>
          <ul className="divide-y divide-primary-50">
            {subject.homework.length === 0 ? (
              <li className="p-4 text-slate-500 text-sm">
                Нема домашни за овој предмет.
              </li>
            ) : (
              subject.homework.map((h) => {
                const withoutFeedback = h.submissions.filter(
                  (s) => s.feedback.length === 0
                ).length;
                return (
                  <li key={h.id}>
                    <Link
                      href={`/dashboard/teacher/subjects/${subject.id}?tab=homework`}
                      className="flex items-center justify-between p-4 hover:bg-primary-50/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{h.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Рок:{" "}
                          {h.dueDate
                            ? format(new Date(h.dueDate), "d MMM yyyy", {
                                locale: mk,
                              })
                            : "Без рок"}
                          {" · "}
                          {h._count.submissions} поднесени
                          {withoutFeedback > 0 && (
                            <span className="text-amber-600 ml-1">
                              · {withoutFeedback} чекаат повратна информација
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
