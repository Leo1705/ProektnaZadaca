import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssignClassesForm } from "./AssignClassesForm";
import { CreateSubjectForm } from "./CreateSubjectForm";

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ teacher?: string }>;
}) {
  const { teacher: teacherId } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");

  const [teachers, subjects] = await Promise.all([
    prisma.user.findMany({
      where: { role: "teacher" },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      include: { teacher: true },
      orderBy: [{ year: "asc" }, { name: "asc" }],
    }),
  ]);

  const assignments = await prisma.teacherAssignment.findMany({
    include: {
      teacher: true,
      // Subject relation not in schema - we have subjectId
    },
  });

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Одделенија и доделувања</h1>
      <p className="text-slate-600 mb-8">
        Креирајте предмети и доделете ги наставниците на одделенија.
      </p>

      <CreateSubjectForm teachers={teachers} />

      <AssignClassesForm
        teachers={teachers}
        subjects={subjects}
        assignments={assignments}
        subjectMap={subjectMap}
        defaultTeacherId={teacherId ?? undefined}
      />

      <section className="mt-10">
        <h2 className="font-semibold text-slate-800 mb-4">Тековни доделувања</h2>
        <ul className="space-y-2">
          {assignments.length === 0 ? (
            <li className="text-slate-500">Нема доделувања.</li>
          ) : (
            assignments.map((a) => {
              const sub = subjectMap[a.subjectId];
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-primary-50"
                >
                  <span className="font-medium text-slate-800">{a.teacher.name}</span>
                  <span className="text-slate-600">
                    {sub?.name ?? a.subjectId} · Година {a.year}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
