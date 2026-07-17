export const dynamic = "force-dynamic";
import { requireApproved } from "@/shared/services/auth/server";
import Sidebar from "@/shared/components/layout/Sidebar";
import BottomNav from "@/shared/components/layout/BottomNav";
import SessionTracker from "@/shared/components/layout/SessionTracker";
import { FirstVisitRedirect } from "@/shared/components/layout/FirstVisitRedirect";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redireciona para /login, /register ou /pending-approval conforme o estado do usuário
  const { profile } = await requireApproved();

  const isAdmin = profile.role === "admin";

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

      {/* Rastreamento de sessão — atualiza last_seen_at e user_metrics a cada 2 min */}
      <SessionTracker />

      {/* Redireciona para /bem-vindo na primeira vez que o usuário acessa */}
      <FirstVisitRedirect />
    </div>
  );
}
