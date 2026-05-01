import { createClient } from "@/lib/supabase/server";

async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalDevotionals },
    { count: openPrayers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("devotionals").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return { totalUsers, pendingUsers, totalDevotionals, openPrayers };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Usuarios Ativos", value: stats.totalUsers ?? 0, color: "#c9a227" },
    { label: "Aguardando Aprovacao", value: stats.pendingUsers ?? 0, color: "#fbbf24", urgent: (stats.pendingUsers ?? 0) > 0 },
    { label: "Devocionais Publicados", value: stats.totalDevotionals ?? 0, color: "#34d399" },
    { label: "Pedidos de Oracao Abertos", value: stats.openPrayers ?? 0, color: "#60a5fa" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl mb-1">Dashboard</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Visao geral do SELAH · Dr. Edson Barroso
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`card p-5 ${card.urgent ? "glow-gold" : ""}`}>
            <p className="text-3xl font-bold" style={{ color: card.color, fontFamily: "var(--font-cinzel)" }}>
              {card.value}
            </p>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              {card.label}
            </p>
            {card.urgent && (
              <a href="/admin/aprovacoes" className="text-xs mt-2 block"
                style={{ color: "#fbbf24", fontFamily: "var(--font-cinzel)", textDecoration: "underline" }}>
                Revisar agora
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Acoes Rapidas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/aprovacoes", label: "Aprovar Usuarios" },
            { href: "/admin/conteudo", label: "Novo Devocional" },
            { href: "/admin/usuarios", label: "Ver Todos os Usuarios" },
            { href: "/admin/metricas", label: "Ver Metricas" },
          ].map((action) => (
            <a key={action.href} href={action.href} className="btn-outline text-center text-xs py-2.5">
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
