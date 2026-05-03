"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeToday: number;
  onlineNow: number;
  totalDevotionals: number;
  openPrayers: number;
  totalEvents: number;
  recentUsers: { id: string; name: string; email: string; created_at: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const gold = "#c9a227";
  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,162,39,0.15)",
    borderRadius: 12,
    padding: "1.2rem",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <div style={{ color: gold, fontSize: "1rem" }}>Carregando...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: "2rem", color: "#ff6b6b" }}>
      <p>Erro ao carregar: {error}</p>
      <button onClick={() => window.location.reload()}
        style={{ marginTop: 12, padding: "8px 16px", background: gold, color: "#000", border: "none", borderRadius: 8, cursor: "pointer" }}>
        Recarregar
      </button>
    </div>
  );

  const metrics = [
    { label: "Total Usuários", value: stats?.totalUsers ?? 0, icon: "👥" },
    { label: "Ativos Hoje", value: stats?.activeToday ?? 0, icon: "📅" },
    { label: "Online Agora", value: stats?.onlineNow ?? 0, icon: "🟢" },
    { label: "Devocionais", value: stats?.totalDevotionals ?? 0, icon: "📖" },
    { label: "Orações", value: stats?.openPrayers ?? 0, icon: "🙏" },
    { label: "Eventos", value: stats?.totalEvents ?? 0, icon: "🎯" },
  ];

  const actions = [
    { href: "/admin/usuarios", label: "Usuários", icon: "👥" },
    { href: "/admin/conteudo", label: "Devocionais", icon: "📖" },
    { href: "/admin/oracoes", label: "Orações", icon: "🙏" },
    { href: "/admin/eventos", label: "Eventos", icon: "📅" },
    { href: "/admin/comunidade", label: "Comunidade", icon: "💬" },
    { href: "/admin/metricas", label: "Métricas", icon: "📈" },
  ];

  return (
    <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel,serif)", color: gold, fontSize: "1.4rem", letterSpacing: "0.15em", margin: 0 }}>
          DASHBOARD
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: "4px 0 0" }}>
          Visão geral do SELAH
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {metrics.map((m) => (
          <div key={m.label} style={card}>
            <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{m.icon}</div>
            <div style={{ color: gold, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Ações Rápidas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.5rem" }}>
          {actions.map((a) => (
            <Link key={a.href} href={a.href} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "0.75rem 1rem",
              background: "rgba(201,162,39,0.06)",
              border: "1px solid rgba(201,162,39,0.2)",
              borderRadius: 10, color: "rgba(255,255,255,0.8)",
              fontSize: "0.82rem", textDecoration: "none",
            }}>
              <span>{a.icon}</span>{a.label}
            </Link>
          ))}
        </div>
      </div>

      {stats?.recentUsers && stats.recentUsers.length > 0 && (
        <div>
          <h2 style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Usuários Recentes
          </h2>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {stats.recentUsers.slice(0, 8).map((u, i) => (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>{u.name || "Sem nome"}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>{u.email}</div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
