"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Settings,
  Users,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Контролна табла", icon: LayoutDashboard },
  { href: "/dashboard/subjects", label: "Предмети", icon: BookOpen },
  { href: "/dashboard/homework", label: "Домашни", icon: FileCheck },
  { href: "/dashboard/settings", label: "Поставки", icon: Settings },
];

const teacherNav: NavItem[] = [
  { href: "/dashboard/teacher", label: "Контролна табла", icon: LayoutDashboard },
  { href: "/dashboard/teacher/subjects", label: "Мои предмети", icon: BookOpen },
  { href: "/dashboard/teacher/homework", label: "Домашни", icon: FileCheck },
  { href: "/dashboard/settings", label: "Поставки", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Контролна табла", icon: LayoutDashboard },
  { href: "/dashboard/admin/teachers", label: "Наставници", icon: Users },
  { href: "/dashboard/admin/classes", label: "Одделенија", icon: GraduationCap },
  { href: "/dashboard/settings", label: "Поставки", icon: Settings },
];

export function Sidebar({
  role,
  userName,
  userYear,
}: {
  role: string;
  userName?: string | null;
  userYear?: number | null;
}) {
  const pathname = usePathname();
  const nav =
    role === "admin"
      ? adminNav
      : role === "teacher"
        ? teacherNav
        : studentNav;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-primary-100 flex flex-col shadow-soft">
      <div className="p-6 border-b border-primary-50">
        <Link
          href={role === "admin" ? "/dashboard/admin" : role === "teacher" ? "/dashboard/teacher" : "/dashboard"}
          className="flex items-center gap-2 text-primary-600 font-bold text-lg"
        >
          <span className="w-9 h-9 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm">
            Е
          </span>
          Е-Учење
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/dashboard/teacher" &&
              item.href !== "/dashboard/admin" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-500 text-white shadow-soft"
                  : "text-slate-600 hover:bg-primary-50 hover:text-primary-700"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-primary-50 space-y-2">
        {userName && (
          <div className="px-4 py-2 text-sm text-slate-600 truncate">
            {userName}
            {userYear && (
              <span className="block text-xs text-slate-400">Година {userYear}</span>
            )}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Одјава
        </button>
      </div>
    </aside>
  );
}
