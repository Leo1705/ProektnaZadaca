import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardRedirect } from "@/components/dashboard/DashboardRedirect";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = (session.user as { role?: string }).role ?? "student";

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar
        role={role}
        userName={session.user.name}
        userYear={(session.user as { year?: number }).year}
      />
      <main className="flex-1 overflow-auto">
        <DashboardRedirect role={role} />
        {children}
      </main>
    </div>
  );
}
