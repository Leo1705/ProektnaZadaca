import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { TeacherHomeworkList } from "./TeacherHomeworkList";

export default async function TeacherHomeworkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if ((session.user as { role?: string }).role !== "teacher" || !userId)
    redirect("/dashboard");

  const subjects = await prisma.subject.findMany({
    where: { teacherId: userId },
    include: {
      homework: {
        orderBy: { dueDate: "asc" },
        include: {
          _count: { select: { submissions: true } },
          submissions: {
            include: {
              feedback: true,
              student: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 sm:p-8 max-w-4xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Домашни</h1>
      <p className="text-slate-600 mb-8">
        Преглед на сите домашни по предмети и поднесени решенија.
      </p>
      <TeacherHomeworkList subjects={subjects} />
    </div>
  );
}
