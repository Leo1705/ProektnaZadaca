import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CreateTeacherForm } from "./CreateTeacherForm";

export default async function AdminTeachersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");

  const teachers = await prisma.user.findMany({
    where: { role: "teacher" },
    include: {
      taughtSubjects: { include: { _count: { select: { students: true } } } },
      _count: { select: { teacherAssignments: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Наставници</h1>
      <p className="text-slate-600 mb-8">
        Креирајте профили за наставници и доделете ги на предмети/одделенија.
      </p>

      <CreateTeacherForm />

      <ul className="mt-8 space-y-4">
        {teachers.length === 0 ? (
          <li className="text-slate-500">Нема креирани наставници.</li>
        ) : (
          teachers.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary-50 shadow-soft"
            >
              <div>
                <p className="font-semibold text-slate-800">{t.name}</p>
                <p className="text-sm text-slate-500">{t.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {t.taughtSubjects.length} предмети · {t._count.teacherAssignments} доделувања
                </p>
              </div>
              <Link
                href={`/dashboard/admin/classes?teacher=${t.id}`}
                className="text-sm text-primary-600 font-medium hover:underline"
              >
                Додели одделенија
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
