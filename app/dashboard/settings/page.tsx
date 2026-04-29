import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/login");

  return (
    <div className="p-6 sm:p-8 max-w-xl animate-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Поставки</h1>
      <p className="text-slate-600 mb-8">
        Променете ја лозинката, е-поштата или сликата на профилот.
      </p>
      <SettingsForm
        userId={userId}
        defaultName={session.user.name ?? ""}
        defaultEmail={session.user.email ?? ""}
        defaultImage={(session.user as { image?: string | null }).image}
      />
    </div>
  );
}
