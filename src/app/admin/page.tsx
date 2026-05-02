export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getAdminStats() {
  const supabase = await createClient();
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: rejectedUsers },
    { count: totalDevotionals },
    { count: openPrayers },
    { count: answeredPrayers },
    { count: totalTestimonies },
    { data: recentUsers },
    { data: sessionData },
    { data: newAlerts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("devotionals").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "answered"),
    supabase.from("testimonies").select("*", { count: "exact", head: true }).eq("approved", true),
    supabase.from("profiles")
      .select("id, full_name, email, status, created_at, city, state, is_legendario")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("user_metrics")
      .select("session_duration_seconds")
      .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
    supabase.from("profiles")
      .select("id, full_name, email, phone, city, state, is_legendario, wants_to_be_legendario, created_at")
      .gte("created_at", twoDaysAgo)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const totalSessionMin = Math.round(
    (sessionData ?? []).reduce((acc: number, m: { session_duration_seconds?: number }) => acc + (m.session_duration_seconds ?? 0), 0) / 60
  );

  return {
    totalUsers: totalUsers ?? 0,
    pendingUsers: pendingUsers ?? 0,
    rejectedUsers: rejectedUsers ?? 0,
    totalDevotionals: totalDevotionals ?? 0,
    openPrayers: openPrayers ?? 0,
    answeredPrayers: answeredPrayers ?? 0,
    totalTestimonies: totalTestimonies ?? 0,
    recentUsers: recentUsers ?? [],
    totalSessionMin,
    newAlerts: newAlerts ?? [],
  };
}

const STATUS_BADGE: Record<string, string> = {
  approved: "badge-green",
  pending: "badge-gold",
  rejected: "badge-wine",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const kpis = [
    { label: "Usuarios Ativos", value: stats.totalUsers, color: "#c9a227", href: "/admin/usuarios?status=approved", urgent: false },
    { label: "Aguardando Aprovacao", value: stats.pendingUsers, color: "#fbbf24", href: "/admin/aprovacoes", urgent: stats.pendingUsers > 0 },
    { label: "Devocionais Publicados", value: stats.totalDevotionals, color: "#34d399", href: "/admin/conteudo", urgent: false },
    { label: "Oracoes Abertas", value: stats.openPrayers, color: "#60a5fa", href: "/admin/metricas", urgent: false },
    { label: "Oracoes Respondidas", value: stats.answeredPrayers, color: "#a78bfa", href: "/admin/metricas", urgent: false },
    { label: "Testemunhos Aprovados", value: stats.totalTestimonies, color: "#f472b6", href: "/admin/metricas", urgent: false },
    { label: "Usuarios Rejeitados", value: stats.rejectedUsers, color: "#f87171", href: "/admin/usuarios?status=rejected", urgent: false },
    { label: "Min. de Uso (30 dias)", value: stats.totalSessionMin, color: "#fb923c", href: "/admin/metricas", urgent: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
            Painel Master
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Controle total · SELAH · Dr. Edson Barroso
          </p>
        </div>
      </div>

      {/* Alertas de novos cadastros (últimas 48h) */}
      {stats.newAlerts.length > 0 && (
        <div className="card p-5" style={{ borderColor: "rgba(201,162,39,0.35)", background: "rgba(201,162,39,0.04)" }}>
          <p className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            🔔 {stats.newAlerts.length} novo{stats.newAlerts.length > 1 ? "s cadastro" : " cadastro"}{stats.newAlerts.length > 1 ? "s" : ""} (últimas 48h)
          </p>
          <div className="space-y-3">
            {(stats.newAlerts as {
              id: string; full_name: string; email: string; phone?: string;
              city: string; state: string; is_legendario: boolean;
              wants_to_be_legendario?: boolean; created_at: string;
            }[]).map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 pb-3"
                style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>
                    {a.full_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {a.email} · {a.phone ?? "—"} · {a.city}/{a.state}
                  </p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {a.is_legendario && (
                      <span className="badge badge-gold" style={{ fontSize: "0.6rem" }}>Legendário</span>
                    )}
                    {a.wants_to_be_legendario && (
                      <span className="badge" style={{ fontSize: "0.6rem", background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}>Pretende ser Legendário</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-cinzel)" }}>
                    {new Date(a.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <Link href={`/admin/usuarios/${a.id}`} className="text-xs mt-1 block"
                    style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", textDecoration: "none" }}>
                    Ver perfil →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}
            className={"card p-5 block transition-all hover:scale-105" + (kpi.urgent ? " glow-gold" : "")}
            style={{ textDecoration: "none" }}>
            <p className="text-3xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-cinzel)" }}>
              {kpi.value.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              {kpi.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Acoes Rapidas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/aprovacoes", label: "Aprovar Usuarios", color: "#fbbf24" },
            { href: "/admin/usuarios", label: "Gerenciar Usuarios", color: "#c9a227" },
            { href: "/admin/metricas", label: "Ver Metricas", color: "#34d399" },
            { href: "/admin/conteudo", label: "Novo Devocional", color: "#60a5fa" },
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="btn-outline text-center text-xs py-3 block"
              style={{ textDecoration: "none", borderColor: action.color + "40", color: action.color }}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
            Ultimos Cadastros
          </p>
          <Link href="/admin/usuarios" className="text-xs"
            style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", textDecoration: "none" }}>
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.12)" }}>
                {["Nome", "Email", "Cidade/UF", "Perfil", "Status", "Cadastro"].map((h) => (
                  <th key={h} className="text-left px-3 py-2"
                    style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.recentUsers as {
                id: string; full_name: string; email: string; status: string;
                created_at: string; city: string; state: string; is_legendario: boolean;
              }[]).map((u, i, arr) => (
                <tr key={u.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>
                      {u.full_name}
                    </p>
                    {u.is_legendario && (
                      <span className="badge badge-gold" style={{ fontSize: "0.55rem" }}>Legendario</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>{u.email}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>{u.city} / {u.state}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
                      {u.is_legendario ? "Legendario" : "Membro"}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={"badge " + (STATUS_BADGE[u.status] ?? "badge-gold")}>
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", fontFamily: "var(--font-cinzel)" }}>
                      {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center">
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Nenhum cadastro ainda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
