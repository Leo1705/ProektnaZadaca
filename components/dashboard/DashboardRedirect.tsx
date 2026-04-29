"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardRedirect({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (role === "teacher") {
      router.replace("/dashboard/teacher");
      return;
    }
    if (role === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [pathname, role, router]);

  return null;
}
