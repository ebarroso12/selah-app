"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const gold = "#c9a227";
const OPENCLAW_URL = "https://openclaw.n8ndredson.com/chat?session=agent%3Amain%3Amain";

interface Stats {
  totalUsers: number;
  activeToday: number;
  onlineNow: number;
  totalDevotionals: number;
  openPrayers: number;
  totalEvents: number;
  recentUsers: { id: string; name: string; email: string; created_at: string; status: string }[];
}

interface User {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  church_name: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  last_seen_at: string | null;
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(201,162,39,0.15)",
  borderRadius: 12,
  padding: "1rem",
};

function timeAgo(iso: string | null) {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

const STATUS_COLOR: Record<string, string> = {
  approved: "#34d399", pending: "#fbbf24", rejected: "#ef4444", banned: "#ef4444",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Ativo", pending: "Pendente", rejected: "Rejeitado", banned: "Banido",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaReport, setIaReport] = useState<string | null>(null);
  const [iaError, setIaError] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadUsers = useCallback(() => {
    setUsersLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data.users || []); setUsersLoading(false); })
      .catch(() => setUsersLoading(false));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleShowUsers = () => {
    setShowUsers(true);
    if (users.length === 0) loadUsers();
  };

  const handleUserAction = async (userId: string, action: "approve" | "ban" | "delete") => {
    setActionLoading(userId + action);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      loadUsers();
      loadStats();
    } catch (e) {}
    setActionLoading(null);
  };

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

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.church_name?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: "1.25rem", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel,serif)", color: gold, fontSize: "1.4rem", letterSpacing: "0.15em", margin: 0 }}>DASHBOARD</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: "4px 0 0" }}>Visão geral do SELAH</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadStats} style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 8, color: gold, padding: "0.4rem 0.8rem", fontSize: "0.78rem", cursor: "pointer" }}>
            ↻ Atualizar
          </button>
          <a href={OPENCLAW_URL} target="_blank" rel="noopener noreferrer"
            style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8, color: "#25D366", padding: "0.4rem 0.8rem", fontSize: "0.78rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            OpenClaw
          </a>
        </div>
      </div>

      {/* Métricas */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div style={{ width: 32, height: 32, border: `2px solid ${gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { icon: "👥", label: "Usuários", value: stats?.totalUsers ?? 0, clickable: true },
            { icon: "🟢", label: "Online Hoje", value: stats?.activeToday ?? 0, clickable: false },
            { icon: "⚡", label: "Online Agora", value: stats?.onlineNow ?? 0, clickable: false },
            { icon: "📖", label: "Devocionais", value: stats?.totalDevotionals ?? 0, clickable: false },
            { icon: "🙏", label: "Orações", value: stats?.openPrayers ?? 0, clickable: false },
            { icon: "📅", label: "Eventos", value: stats?.totalEvents ?? 0, clickable: false },
          ].map((m) => (
            <div key={m.label} onClick={m.clickable ? handleShowUsers : undefined}
              style={{ ...card, cursor: m.clickable ? "pointer" : "default", ...(m.clickable ? { borderColor: "rgba(201,162,39,0.4)" } : {}) }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{m.icon}</div>
              <div style={{ color: gold, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginTop: 4 }}>{m.label}</div>
              {m.clickable && <div style={{ color: gold, fontSize: "0.62rem", marginTop: 4, opacity: 0.7 }}>Ver lista ▶</div>}
            </div>
          ))}
        </div>
      )}

      {/* Lista de Usuários */}
      {showUsers && (
        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ color: gold, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Usuários ({filteredUsers.length})
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 8, color: "white", padding: "0.35rem 0.7rem", fontSize: "0.8rem", outline: "none", width: 150 }} />
              <button onClick={() => setShowUsers(false)}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", padding: "0.35rem 0.7rem", fontSize: "0.78rem", cursor: "pointer" }}>
                ✕
              </button>
            </div>
          </div>
          {usersLoading ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "rgba(255,255,255,0.4)" }}>Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "rgba(255,255,255,0.3)" }}>Nenhum usuário</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.15)" }}>
                    {["Nome", "Email", "Igreja/Cidade", "Cadastro", "Último Acesso", "Status", "Ações"].map((h) => (
                      <th key={h} style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, padding: "0.5rem 0.6rem", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td style={{ padding: "0.55rem 0.6rem", whiteSpace: "nowrap" }}>
                        <Link href={`/admin/usuarios/${u.id}`} style={{ color: gold, textDecoration: "none" }}>{u.full_name || "Sem nome"}</Link>
                      </td>
                      <td style={{ padding: "0.55rem 0.6rem", color: "rgba(255,255,255,0.45)", fontSize: "0.73rem" }}>{u.email}</td>
                      <td style={{ padding: "0.55rem 0.6rem", color: "rgba(255,255,255,0.45)", fontSize: "0.73rem" }}>{u.church_name || u.city ? `${u.church_name || ""}${u.city ? ` · ${u.city}` : ""}` : "—"}</td>
                      <td style={{ padding: "0.55rem 0.6rem", color: "rgba(255,255,255,0.35)", fontSize: "0.73rem", whiteSpace: "nowrap" }}>{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "0.55rem 0.6rem", color: "rgba(255,255,255,0.35)", fontSize: "0.73rem", whiteSpace: "nowrap" }}>{timeAgo(u.last_seen_at)}</td>
                      <td style={{ padding: "0.55rem 0.6rem" }}>
                        <span style={{ background: `${STATUS_COLOR[u.status] || "#888"}22`, color: STATUS_COLOR[u.status] || "#888", border: `1px solid ${STATUS_COLOR[u.status] || "#888"}44`, borderRadius: 6, padding: "0.15rem 0.45rem", fontSize: "0.68rem" }}>
                          {STATUS_LABEL[u.status] || u.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.55rem 0.6rem" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {u.status !== "approved" && (
                            <button onClick={() => handleUserAction(u.id, "approve")} disabled={actionLoading === u.id + "approve"}
                              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 5, color: "#34d399", padding: "0.15rem 0.4rem", fontSize: "0.68rem", cursor: "pointer" }}>
                              {actionLoading === u.id + "approve" ? "..." : "✓ Ativar"}
                            </button>
                          )}
                          {u.status !== "banned" && (
                            <button onClick={() => handleUserAction(u.id, "ban")} disabled={actionLoading === u.id + "ban"}
                              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 5, color: "#ef4444", padding: "0.15rem 0.4rem", fontSize: "0.68rem", cursor: "pointer" }}>
                              {actionLoading === u.id + "ban" ? "..." : "✕ Banir"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* IA Relatório */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ color: gold, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>IA — Relatório Automático</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.73rem", margin: "4px 0 0" }}>Análise inteligente da plataforma</p>
          </div>
          <button onClick={handleIaReport} disabled={iaLoading}
            style={{ background: iaLoading ? "rgba(201,162,39,0.05)" : "rgba(201,162,39,0.12)", border: `1px solid rgba(201,162,39,${iaLoading ? "0.1" : "0.35"})`, borderRadius: 8, color: iaLoading ? "rgba(201,162,39,0.4)" : gold, padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: iaLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {iaLoading ? (<><span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Gerando...</>) : <>✦ Gerar Relatório com IA</>}
          </button>
        </div>
        {iaError && <div style={{ marginTop: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.75rem", color: "#ef4444", fontSize: "0.8rem" }}>{iaError}</div>}
        {iaReport && <div style={{ marginTop: "0.75rem", background: "rgba(201,162,39,0.04)", border: "1px solid rgba(201,162,39,0.12)", borderRadius: 8, padding: "1rem", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{iaReport}</div>}
      </div>

      {/* Ações Rápidas */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Ações Rápidas</h2>
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
            <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1rem", background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)", borderRadius: 10, color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", textDecoration: "none" }}>
              <span>{a.icon}</span>{a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Últimos Cadastros */}
      {!showUsers && stats?.recentUsers && stats.recentUsers.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h2 style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Últimos Cadastros</h2>
            <button onClick={handleShowUsers} style={{ background: "none", border: "none", color: gold, fontSize: "0.75rem", cursor: "pointer" }}>Ver todos →</button>
          </div>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {stats.recentUsers.slice(0, 8).map((u, i) => (
              <Link key={u.id} href={`/admin/usuarios/${u.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: i < Math.min(7, stats.recentUsers.length - 1) ? "1px solid rgba(255,255,255,0.05)" : "none", textDecoration: "none" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>{u.name || "Sem nome"}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>{u.email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: STATUS_COLOR[u.status] || "#888", fontSize: "0.7rem" }}>{STATUS_LABEL[u.status] || u.status}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>{new Date(u.created_at).toLocaleDateString("pt-BR")}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
