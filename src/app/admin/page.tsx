export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getAdminStats() {
  const supabase = await createClient();

  // Considera "online agora" quem teve last_seen_at nos últimos 5 minutos
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  // Considera "ativo hoje" quem teve last_seen_at nas últimas 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: allUsers },
    { count: totalDevotionals },
    { count: openPrayers },
    { data: metricsData },
    { count: totalEvents },
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
    supabase.from("events").select("*", { count: "exact", head: true }),
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
    totalEvents: totalEvents ?? 0,
    enrichedUsers,
  };
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
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
      label: "Eventos",
      value: stats.totalEvents,
      color: "#f472b6",
      href: "/admin/eventos",
      icon: "📅",
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
            Painel Master
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Controle em tempo real · SELAH · Dr. Edson Barroso
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Última Atualização</p>
          <p className="text-xs font-mono" style={{ color: "#c9a227" }}>{new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
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
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: kpi.color, boxShadow: `0 0 8px ${kpi.color}` }} />
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
      <div className="card p-5" style={{ borderColor: onlineUsers.length > 0 ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.06)", background: onlineUsers.length > 0 ? "rgba(52,211,153,0.04)" : "transparent" }}>
        <p className="text-xs tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: onlineUsers.length > 0 ? "#34d399" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-cinzel)" }}>
          {onlineUsers.length > 0 ? "🟢" : "⚪"} Usuários Online Agora ({onlineUsers.length})
        </p>
        {onlineUsers.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>Nenhum usuário online no momento.</p>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>
                    {u.full_name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                    Ativo
                  </span>
                  <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{formatMinutes(u.totalMinutes)} hoje</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm mb-4" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>Gerenciamento de Conteúdo</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/conteudo" className="btn-outline text-xs py-2 text-center">Devocionais</Link>
            <Link href="/admin/eventos" className="btn-outline text-xs py-2 text-center">Eventos</Link>
            <Link href="/admin/legendarios" className="btn-outline text-xs py-2 text-center">Legendários</Link>
            <Link href="/admin/igreja" className="btn-outline text-xs py-2 text-center">Igreja</Link>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm mb-4" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>Moderação e Usuários</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/usuarios" className="btn-outline text-xs py-2 text-center">Usuários</Link>
            <Link href="/admin/oracoes" className="btn-outline text-xs py-2 text-center">Orações</Link>
            <Link href="/admin/comunidade" className="btn-outline text-xs py-2 text-center">Comunidade</Link>
            <Link href="/admin/homenagens" className="btn-outline text-xs py-2 text-center">Homenagens</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
