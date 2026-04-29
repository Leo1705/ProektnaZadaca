"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string };
type Subject = { id: string; name: string; year: number; teacherId: string };
type Assignment = { id: string; teacherId: string; subjectId: string; year: number };

export function AssignClassesForm({
  teachers,
  subjects,
  assignments,
  subjectMap,
  defaultTeacherId,
}: {
  teachers: User[];
  subjects: Subject[];
  assignments: Assignment[];
  subjectMap: Record<string, Subject>;
  defaultTeacherId?: string;
}) {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState(defaultTeacherId ?? teachers[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultTeacherId) setTeacherId(defaultTeacherId);
  }, [defaultTeacherId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, subjectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Грешка при доделување.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Се случи грешка.");
    }
    setLoading(false);
  }

  const isDuplicate = assignments.some(
    (a) => a.teacherId === teacherId && a.subjectId === subjectId
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl border border-primary-50 shadow-soft space-y-4"
    >
      <h3 className="font-semibold text-slate-800">Додели наставник на предмет</h3>
      <p className="text-sm text-slate-600">
        Наставникот се доделува на предметот за годината на предметот (не може да се избере друга година).
      </p>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Наставник
        </label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Предмет
        </label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (Година {s.year})
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || isDuplicate}
        className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-60"
      >
        {loading ? "Се зачувува..." : isDuplicate ? "Веќе постои" : "Додели"}
      </button>
    </form>
  );
}
