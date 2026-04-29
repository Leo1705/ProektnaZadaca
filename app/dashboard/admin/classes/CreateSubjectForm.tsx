"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string };

export function CreateSubjectForm({ teachers }: { teachers: User[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(1);
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, year, teacherId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Грешка при креирање на предмет.");
        setLoading(false);
        return;
      }
      setName("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Се случи грешка.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl border border-primary-50 shadow-soft space-y-4 mb-8"
    >
      <h3 className="font-semibold text-slate-800">Креирај нов предмет</h3>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Име на предмет
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          placeholder="напр. Програмирање"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Опис (опционално)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          placeholder="Кратко опишување"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Година
          </label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
          >
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>
                Година {y}
              </option>
            ))}
          </select>
        </div>
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
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-60"
      >
        {loading ? "Се креира..." : "Креирај предмет"}
      </button>
    </form>
  );
}
