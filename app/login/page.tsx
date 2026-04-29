import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 font-semibold mb-8 hover:text-primary-700 transition-colors"
        >
          ← Назад кон почетна
        </Link>
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-card border border-primary-50 p-8 animate-pulse h-80" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
