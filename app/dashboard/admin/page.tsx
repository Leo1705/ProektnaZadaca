import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, BookOpen, GraduationCap } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/dashboard");

  const [teachersCount, subjectsCount, studentsCount] = await Promise.all([
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.subject.count(),
    prisma.user.count({ where: { role: "student" } }),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Администратор</h1>
      <p className="text-slate-600 mb-8">
        Управување со наставници и доделување на одделенија.
      </p>

      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        <div className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </span>
            <span className="font-semibold text-slate-800">Наставници</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{teachersCount}</p>
          <Link
            href="/dashboard/admin/teachers"
            className="text-sm text-primary-600 font-medium mt-2 inline-block hover:underline"
          >
            Управувај →
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </span>
            <span className="font-semibold text-slate-800">Предмети</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{subjectsCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-600" />
            </span>
            <span className="font-semibold text-slate-800">Студенти</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{studentsCount}</p>
        </div>
      </div>

      <section>
        <h2 className="font-semibold text-slate-800 mb-4">Брзи линкови</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/admin/teachers"
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            Креирај наставник
          </Link>
          <Link
            href="/dashboard/admin/classes"
            className="px-5 py-2.5 border border-primary-200 text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition-colors"
          >
            Додели одделенија
          </Link>
        </div>
      </section>
    </div>
  );
}
