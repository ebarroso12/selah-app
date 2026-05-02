export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/ui/Sidebar";
import BottomNav from "@/components/ui/BottomNav";
import type { Profile } from "@/types/database";

// Email do administrador — sempre lido da variável de ambiente
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  if (!profile) redirect("/register");
  if (profile.status === "rejected" || profile.status === "banned") {
    redirect("/login");
  }

  const isAdmin = Boolean(ADMIN_EMAIL) && user.email === ADMIN_EMAIL;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar visível apenas em desktop (md+) */}
      <div className="hidden md:block">
        <Sidebar profile={profile} isAdmin={isAdmin} />
      </div>

      {/* Conteúdo principal */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          // No mobile: padding inferior para não ficar atrás da BottomNav flutuante
          paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {/* BottomNav flutuante — apenas mobile */}
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
