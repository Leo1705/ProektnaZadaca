"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Погрешна е-пошта или лозинка.");
        setLoading(false);
        return;
      }
      // Redirect role-specific dashboards so middleware allows access
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "teacher") {
        router.push("/dashboard/teacher");
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    } catch {
      setError("Се случи грешка. Обидете се повторно.");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-primary-50 p-8 animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Најава</h1>
      <p className="text-slate-600 mb-6">
        Внесете ги вашите податоци за да влезете.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Е-пошта
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="име@пример.мк"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Лозинка
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-60 transition-all duration-200"
        >
          {loading ? "Се најавува..." : "Најави се"}
        </button>
      </form>
      <p className="mt-6 text-center text-slate-600 text-sm">
        Немате профил?{" "}
        <Link href="/register" className="text-primary-600 font-medium hover:underline">
          Регистрирајте се
        </Link>
      </p>
    </div>
  );
}
