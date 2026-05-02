export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getAdminStats() {
  const supabase = await createClient();

  // Considera "online agora" quem teve last_seen_at nos últimos 5 minutos
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  // Considera "nunca entrou" quem não tem last_seen_at
  // Considera "ativo hoje" quem teve last_seen_at nas últimas 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: allUsers },
    { count: totalDevotionals },
    { count: openPrayers },
    { data: metricsData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, status, created_at, last_seen_at, city, state, is_legendario, gender")
      .order("created_at", { ascending: false }),
    supabase.from("devotionals").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("user_metrics")
      .select("user_id, session_duration_seconds, date"),
  ]);

  const users = allUsers ?? [];
  const metrics = metricsData ?? [];

  // Agrupar métricas por usuário
  const metricsByUser: Record<string, { totalSeconds: number; sessionDays: number }> = {};
  for (const m of metrics) {
    if (!metricsByUser[m.user_id]) {
      metricsByUser[m.user_id] = { totalSeconds: 0, sessionDays: 0 };
    }
    metricsByUser[m.user_id].totalSeconds += m.session_duration_seconds ?? 0;
    metricsByUser[m.user_id].sessionDays += 1;
  }

  // Enriquecer usuários com métricas
  const enrichedUsers = users.map((u) => ({
    ...u,
    totalMinutes: Math.round((metricsByUser[u.id]?.totalSeconds ?? 0) / 60),
    loginDays: metricsByUser[u.id]?.sessionDays ?? 0,
    isOnline: u.last_seen_at ? u.last_seen_at >= fiveMinAgo : false,
    activeToday: u.last_seen_at ? u.last_seen_at >= oneDayAgo : false,
    neverLoggedIn: !u.last_seen_at,
  }));

  const totalUsers = users.length;
  const onlineNow = enrichedUsers.filter((u) => u.isOnline).length;
  const neverLoggedIn = enrichedUsers.filter((u) => u.neverLoggedIn).length;
  const activeToday = enrichedUsers.filter((u) => u.activeToday).length;
  const totalMinutesAll = enrichedUsers.reduce((acc, u) => acc + u.totalMinutes, 0);

  return {
    totalUsers,
    onlineNow,
    neverLoggedIn,
    activeToday,
    totalMinutesAll,
    totalDevotionals: totalDevotionals ?? 0,
    openPrayers: openPrayers ?? 0,
    enrichedUsers,
  };
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const kpis = [
    {
      label: "Total Cadastrados",
      value: stats.totalUsers,
      color: "#c9a227",
      href: "/admin/usuarios",
      icon: "👥",
    },
    {
      label: "Online Agora",
      value: stats.onlineNow,
      color: "#34d399",
      href: "/admin/usuarios",
      icon: "🟢",
      urgent: stats.onlineNow > 0,
    },
    {
      label: "Ativos Hoje",
      value: stats.activeToday,
      color: "#60a5fa",
      href: "/admin/usuarios",
      icon: "📅",
    },
    {
      label: "Nunca Entraram",
      value: stats.neverLoggedIn,
      color: "#fbbf24",
      href: "/admin/usuarios",
      icon: "⚠️",
      urgent: stats.neverLoggedIn > 0,
    },
    {
      label: "Devocionais",
      value: stats.totalDevotionals,
      color: "#a78bfa",
      href: "/admin/conteudo",
      icon: "📖",
    },
    {
      label: "Orações Abertas",
      value: stats.openPrayers,
      color: "#f472b6",
      href: "/admin/metricas",
      icon: "🙏",
    },
    {
      label: "Min. Uso Total",
      value: stats.totalMinutesAll,
      color: "#fb923c",
      href: "/admin/metricas",
      icon: "⏱️",
    },
  ];

  const onlineUsers = stats.enrichedUsers.filter((u) => u.isOnline);
  const neverUsers = stats.enrichedUsers.filter((u) => u.neverLoggedIn);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
          Painel Master
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Controle total · SELAH · Dr. Edson Barroso
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={"card p-4 block transition-all hover:scale-105" + (kpi.urgent ? " glow-gold" : "")}
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: "1.1rem" }}>{kpi.icon}</span>
              {kpi.urgent && (
                <span className="w-2 h-2 rounded-full" style={{ background: kpi.color, boxShadow: `0 0 6px ${kpi.color}` }} />
              )}
            </div>
            <p className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-cinzel)" }}>
              {kpi.value.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
              {kpi.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Online agora */}
      {onlineUsers.length > 0 && (
        <div className="card p-5" style={{ borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.04)" }}>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#34d399", fontFamily: "var(--font-cinzel)" }}>
            🟢 Online Agora ({onlineUsers.length})
          </p>
          <div className="space-y-2">
            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)", fontSize: "0.82rem" }}>
                    {u.full_name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                    Online
                  </span>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{formatMinutes(u.totalMinutes)} de uso</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nunca entraram */}
      {neverUsers.length > 0 && (
        <div className="card p-5" style={{ borderColor: "rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.03)" }}>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#fbbf24", fontFamily: "var(--font-cinzel)" }}>
            ⚠️ Cadastrados mas Nunca Entraram ({neverUsers.length})
          </p>
          <div className="space-y-2">
            {neverUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)", fontSize: "0.82rem" }}>
                    {u.full_name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-cinzel)" }}>
                    Cadastro: {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                  <Link href={`/admin/usuarios/${u.id}`} className="text-xs" style={{ color: "rgba(201,162,39,0.7)", textDecoration: "none" }}>
                    Ver perfil →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela completa de todos os usuários */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
          <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
            Todos os Usuários ({stats.totalUsers})
          </p>
          <Link href="/admin/usuarios" className="text-xs" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", textDecoration: "none" }}>
            Gerenciar →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
                {["", "Nome / Email", "Último Acesso", "Logins", "Tempo de Uso", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3"
                    style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.enrichedUsers.map((u, i, arr) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  {/* Indicador online */}
                  <td className="px-4 py-3 w-8">
                    <span
                      className="w-2 h-2 rounded-full block"
                      style={{
                        background: u.isOnline ? "#34d399" : u.activeToday ? "#60a5fa" : "rgba(255,255,255,0.15)",
                        boxShadow: u.isOnline ? "0 0 6px #34d399" : "none",
                      }}
                    />
                  </td>
                  {/* Nome / Email */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem", textDecoration: "none" }}
                    >
                      {u.full_name}
                    </Link>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>{u.email}</p>
                  </td>
                  {/* Último acesso */}
                  <td className="px-4 py-3">
                    <p
                      style={{
                        color: u.isOnline ? "#34d399" : u.neverLoggedIn ? "#fbbf24" : "rgba(255,255,255,0.45)",
                        fontSize: "0.78rem",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      {u.isOnline ? "🟢 Online" : timeAgo(u.last_seen_at)}
                    </p>
                  </td>
                  {/* Logins (dias com sessão) */}
                  <td className="px-4 py-3">
                    <p style={{ color: u.loginDays > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", fontSize: "0.82rem", fontFamily: "var(--font-cinzel)" }}>
                      {u.loginDays > 0 ? `${u.loginDays}x` : "—"}
                    </p>
                  </td>
                  {/* Tempo de uso */}
                  <td className="px-4 py-3">
                    <p style={{ color: u.totalMinutes > 0 ? "rgba(251,146,60,0.9)" : "rgba(255,255,255,0.25)", fontSize: "0.78rem", fontFamily: "var(--font-cinzel)" }}>
                      {u.totalMinutes > 0 ? formatMinutes(u.totalMinutes) : "—"}
                    </p>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: u.status === "approved"
                          ? "rgba(52,211,153,0.1)"
                          : u.status === "banned"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(251,191,36,0.1)",
                        color: u.status === "approved" ? "#34d399" : u.status === "banned" ? "#ef4444" : "#fbbf24",
                        border: `1px solid ${u.status === "approved" ? "rgba(52,211,153,0.25)" : u.status === "banned" ? "rgba(239,68,68,0.25)" : "rgba(251,191,36,0.25)"}`,
                        fontFamily: "var(--font-cinzel)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {u.status === "approved" ? "Ativo" : u.status === "banned" ? "Banido" : u.status === "rejected" ? "Rejeitado" : "Pendente"}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.enrichedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Nenhum usuário cadastrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="card p-5">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Ações Rápidas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/usuarios", label: "Gerenciar Usuários", color: "#c9a227" },
            { href: "/admin/metricas", label: "Ver Métricas", color: "#34d399" },
            { href: "/admin/conteudo", label: "Novo Devocional", color: "#60a5fa" },
            { href: "/admin/aprovacoes", label: "Aprovações", color: "#fbbf24" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="btn-outline text-center text-xs py-3 block"
              style={{ textDecoration: "none", borderColor: action.color + "40", color: action.color }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
