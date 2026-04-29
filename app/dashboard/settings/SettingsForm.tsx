"use client";

import { useState } from "react";
import { User } from "lucide-react";

export function SettingsForm({
  userId,
  defaultName,
  defaultEmail,
  defaultImage,
}: {
  userId: string;
  defaultName: string;
  defaultEmail: string;
  defaultImage?: string | null;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (imageFile) formData.append("image", imageFile);
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Грешка при зачувување." });
        setLoading(false);
        return;
      }
      setMessage({ type: "success", text: "Поставките се зачувани." });
      if (data.email) setEmail(data.email);
      if (data.name) setName(data.name);
      setPassword("");
      setImageFile(null);
      if (data.image) window.location.reload();
    } catch {
      setMessage({ type: "error", text: "Се случи грешка." });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={
            message.type === "success"
              ? "bg-green-50 text-green-800 px-4 py-3 rounded-xl text-sm"
              : "bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm"
          }
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Слика на профил
        </label>
        <div className="flex items-center gap-4">
          {defaultImage ? (
            <img
              src={defaultImage}
              alt="Профил"
              className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Име и презиме
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          placeholder="Име и презиме"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Е-пошта
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          placeholder="име@пример.мк"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Нова лозинка (оставете празно за да не ја менувате)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-60 transition-all duration-200"
      >
        {loading ? "Се зачувува..." : "Зачувај поставки"}
      </button>
    </form>
  );
}
