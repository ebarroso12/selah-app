"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const gold = "var(--gold)";
const OPENCLAW_URL = "https://openclaw.n8ndredson.com/chat?session=agent%3Amain%3Amain";

interface UserStat {
  id: string;
  full_name: string;
  email: string;
  church_name: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  last_seen_at: string | null;
  totalMinutes: number;
  isOnline: boolean;
  activeToday: boolean;
}

interface StatsData {
  totalUsers: number;
  onlineNow: number;
  activeToday: number;
  neverLoggedIn: number;
  totalMinutesAll: number;
  totalDevotionals: number;
  openPrayers: number;
  totalEvents: number;
  homenagensPendentes: number;
  users: UserStat[];
}

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1rem",
};

function timeAgo(iso: string | null) {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Agora 🟢";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

function fmtMin(min: number) {
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
}

const STATUS_COLOR: Record<string, string> = {
  approved: "#34d399", pending: "#fbbf24", rejected: "#ef4444", banned: "#ef4444",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Ativo", pending: "Pendente", rejected: "Rejeitado", banned: "Banido",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaReport, setIaReport] = useState<string | null>(null);
  const [iaError, setIaError] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data: StatsData) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleIaReport = async () => {
    setIaLoading(true);
    setIaReport(null);
    setIaError(null);
    try {
      const res = await fetch("/api/admin/ia-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });
      const data = await res.json();
      if (data.report) setIaReport(data.report);
      else setIaError(data.error || "Erro ao gerar relatório");
    } catch (e: any) {
      setIaError(e.message);
    }
    setIaLoading(false);
  };

  const filteredUsers = (stats?.users ?? []).filter((u) => {
    const q = search.toLowerCase();
    return !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.church_name?.toLowerCase().includes(q);
  });

  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 10);

  return (
    <div style={{ padding: "1.25rem", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel,serif)", color: gold, fontSize: "1.4rem", letterSpacing: "0.15em", margin: 0 }}>DASHBOARD</h1>
          <p style={{ color: "var(--text-subtle)", fontSize: "0.8rem", margin: "4px 0 0" }}>Visão geral do SELAH</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadStats} style={{ background: "rgba(184,115,51,0.08)", border: "1px solid rgba(184,115,51,0.2)", borderRadius: 8, color: gold, padding: "0.4rem 0.8rem", fontSize: "0.78rem", cursor: "pointer" }}>
            ↻ Atualizar
          </button>
          <a href={OPENCLAW_URL} target="_blank" rel="noopener noreferrer"
            style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8, color: "#25D366", padding: "0.4rem 0.8rem", fontSize: "0.78rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            OpenClaw
          </a>
        </div>
      </div>

      {/* Métricas principais */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div style={{ width: 32, height: 32, border: `2px solid ${gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* KPIs de usuários */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { icon: "👥", label: "Cadastrados", value: stats?.totalUsers ?? 0, color: gold },
              { icon: "🟢", label: "Online Agora", value: stats?.onlineNow ?? 0, color: "#34d399" },
              { icon: "☀️", label: "Ativos Hoje", value: stats?.activeToday ?? 0, color: "#fb923c" },
              { icon: "⏱️", label: "Minutos Totais", value: stats?.totalMinutesAll ?? 0, color: "#a78bfa" },
              { icon: "📖", label: "Devocionais", value: stats?.totalDevotionals ?? 0, color: "#60a5fa" },
              { icon: "🙏", label: "Orações", value: stats?.openPrayers ?? 0, color: "#f472b6" },
              { icon: "📅", label: "Eventos", value: stats?.totalEvents ?? 0, color: "#34d399" },
              { icon: "🕊️", label: "Homenagens", value: stats?.homenagensPendentes ?? 0, color: "#fbbf24" },
            ].map((m) => (
              <div key={m.label} style={{ ...card }}>
                <div style={{ fontSize: "1.3rem", marginBottom: 6 }}>{m.icon}</div>
                <div style={{ color: m.color, fontSize: "1.7rem", fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-cinzel,serif)" }}>{m.value.toLocaleString("pt-BR")}</div>
                <div style={{ color: "var(--text-subtle)", fontSize: "0.68rem", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabela de usuários com tempo de uso */}
          <div style={{ ...card, marginBottom: "1.5rem", padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid rgba(184,115,51,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h2 style={{ color: gold, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontFamily: "var(--font-cinzel,serif)" }}>
                  Usuários Cadastrados ({stats?.totalUsers ?? 0})
                </h2>
                <p style={{ color: "var(--text-subtle)", fontSize: "0.7rem", margin: "3px 0 0" }}>
                  🟢 {stats?.onlineNow ?? 0} online agora · ☀️ {stats?.activeToday ?? 0} ativos hoje
                </p>
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "0.35rem 0.7rem", fontSize: "0.8rem", outline: "none", width: 160 }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(184,115,51,0.1)" }}>
                    {["Nome", "Email", "Igreja / Cidade", "Cadastro", "Último Acesso", "Tempo de Uso", "Status"].map((h) => (
                      <th key={h} style={{ color: "var(--gold-label)", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", whiteSpace: "nowrap", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-subtle)" }}>Nenhum usuário encontrado</td></tr>
                  ) : displayedUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < displayedUsers.length - 1 ? "1px solid var(--bg-2)" : "none", background: u.isOnline ? "rgba(52,211,153,0.03)" : "transparent" }}>
                      <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {u.isOnline && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block", flexShrink: 0 }} />}
                          <Link href={`/admin/usuarios/${u.id}`} style={{ color: u.isOnline ? "#34d399" : gold, textDecoration: "none", fontFamily: "var(--font-cinzel,serif)", fontSize: "0.78rem" }}>
                            {u.full_name || "Sem nome"}
                          </Link>
                        </div>
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-subtle)", fontSize: "0.72rem" }}>{u.email}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-subtle)", fontSize: "0.72rem" }}>
                        {u.church_name || u.city ? `${u.church_name || ""}${u.city ? ` · ${u.city}` : ""}` : "—"}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-subtle)", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.72rem", whiteSpace: "nowrap", color: u.isOnline ? "#34d399" : "var(--text-subtle)" }}>
                        {timeAgo(u.last_seen_at)}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                        <span style={{ color: u.totalMinutes > 0 ? "#fb923c" : "var(--text-subtle)", fontSize: "0.78rem", fontFamily: "var(--font-cinzel,serif)" }}>
                          {u.totalMinutes > 0 ? fmtMin(u.totalMinutes) : "—"}
                        </span>
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <span style={{ background: `${STATUS_COLOR[u.status] || "#888"}22`, color: STATUS_COLOR[u.status] || "#888", border: `1px solid ${STATUS_COLOR[u.status] || "#888"}44`, borderRadius: 6, padding: "0.15rem 0.45rem", fontSize: "0.65rem" }}>
                          {STATUS_LABEL[u.status] || u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length > 10 && (
              <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--bg-2)", textAlign: "center" }}>
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  style={{ background: "none", border: "none", color: gold, fontSize: "0.78rem", cursor: "pointer" }}
                >
                  {showAllUsers ? `▲ Mostrar menos` : `▼ Ver todos os ${filteredUsers.length} usuários`}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* IA Relatório */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ color: gold, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontFamily: "var(--font-cinzel,serif)" }}>IA — Relatório Automático</h2>
            <p style={{ color: "var(--text-subtle)", fontSize: "0.73rem", margin: "4px 0 0" }}>Análise inteligente da plataforma</p>
          </div>
          <button onClick={handleIaReport} disabled={iaLoading}
            style={{ background: iaLoading ? "rgba(184,115,51,0.05)" : "rgba(184,115,51,0.12)", border: `1px solid rgba(184,115,51,${iaLoading ? "0.1" : "0.35"})`, borderRadius: 8, color: iaLoading ? "rgba(184,115,51,0.4)" : gold, padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: iaLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {iaLoading ? (<><span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Gerando...</>) : <>✦ Gerar Relatório com IA</>}
          </button>
        </div>
        {iaError && <div style={{ marginTop: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.75rem", color: "#ef4444", fontSize: "0.8rem" }}>{iaError}</div>}
        {iaReport && <div style={{ marginTop: "0.75rem", background: "rgba(184,115,51,0.04)", border: "1px solid rgba(184,115,51,0.12)", borderRadius: 8, padding: "1rem", color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{iaReport}</div>}
      </div>

      {/* Ações Rápidas */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--text-subtle)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Ações Rápidas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.5rem" }}>
          {[
            { href: "/admin/usuarios", icon: "👥", label: "Usuários" },
            { href: "/admin/conteudo", icon: "📖", label: "Conteúdo" },
            { href: "/admin/oracoes", icon: "🙏", label: "Orações" },
            { href: "/admin/comunidade", icon: "💬", label: "Comunidade" },
            { href: "/admin/eventos", icon: "📅", label: "Eventos" },
            { href: "/admin/metricas", icon: "📊", label: "Métricas" },
            { href: "/admin/legendarios", icon: "⭐", label: "Legendários" },
            { href: "/admin/homenagens", icon: "🕊️", label: "Homenagens" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: "0.82rem", textDecoration: "none", fontWeight: 500 }}>
              <span>{a.icon}</span>{a.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
