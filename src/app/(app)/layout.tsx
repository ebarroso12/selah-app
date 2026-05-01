import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/ui/Sidebar";
import type { Profile } from "@/types/database";

const ADMIN_EMAIL = "edson.barroso@gmail.com";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  if (!profile || profile.status === "pending") redirect("/pending-approval");
  if (profile.status === "rejected" || profile.status === "banned") redirect("/login");

  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar profile={profile} isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
