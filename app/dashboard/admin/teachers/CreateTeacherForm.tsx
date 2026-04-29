"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateTeacherForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Грешка при креирање.");
        setLoading(false);
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch {
      setError("Се случи грешка.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl border border-primary-50 shadow-soft space-y-4"
    >
      <h3 className="font-semibold text-slate-800">Креирај нов наставник</h3>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Име и презиме
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          placeholder="Проф. Име Презиме"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Е-пошта
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          placeholder="nastavnik@uciliste.mk"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Лозинка
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          placeholder="Минимум 6 знаци"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-60"
      >
        {loading ? "Се креира..." : "Креирај наставник"}
      </button>
    </form>
  );
}
