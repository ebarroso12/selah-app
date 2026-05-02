"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import Link from "next/link";


interface AdminStats {
  totalUsers: number;
  onlineNow: number;
  activeToday: number;
  neverLoggedIn: number;
  totalMinutesAll: number;
  totalDevotionals: number;
  openPrayers: number;
  totalEvents: number;
  homenagensPendentes: number;
  users: any[];
}

export default function AdminDashboard() {
  const supabase = getBrowserClient();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Atualizar a cada 30 segundos como fallback
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Cadastrados", value: stats?.totalUsers || 0, color: "#c9a227", href: "/admin/usuarios", icon: "👥" },
    { label: "Online Agora", value: stats?.onlineNow || 0, color: "#34d399", href: "/admin/usuarios", icon: "🟢", urgent: (stats?.onlineNow || 0) > 0 },
    { label: "Ativos Hoje", value: stats?.activeToday || 0, color: "#60a5fa", href: "/admin/usuarios", icon: "📅" },
    { label: "Nunca Entraram", value: stats?.neverLoggedIn || 0, color: "#fbbf24", href: "/admin/usuarios", icon: "⚠️" },
    { label: "Devocionais", value: stats?.totalDevotionals || 0, color: "#a78bfa", href: "/admin/conteudo", icon: "📖" },
    { label: "Eventos", value: stats?.totalEvents || 0, color: "#f472b6", href: "/admin/eventos", icon: "📅" },
    { label: "Min. Uso Total", value: stats?.totalMinutesAll || 0, color: "#fb923c", href: "/admin/metricas", icon: "⏱️" },
    { label: "Homenagens Pend.", value: stats?.homenagensPendentes || 0, color: "#ef4444", href: "/admin/homenagens", icon: "🎖️" }
  ];

  const onlineUsers = stats?.users.filter(u => u.isOnline) || [];
  const [iaRunning, setIaRunning] = useState(false);
  const [iaResult, setIaResult] = useState<{ summary: string; logs: string[] } | null>(null);

  const runIaCheck = async () => {
    setIaRunning(true);
    setIaResult(null);
    try {
      const res = await fetch("/api/admin/ia-check", { method: "POST" });
      const data = await res.json();
      setIaResult(data);
      fetchStats(); // Atualiza as métricas após a correção
    } catch (err) {
      console.error("Erro na IA:", err);
    } finally {
      setIaRunning(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Painel Master</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Controle em Tempo Real · SELAH · Dr. Edson Barroso</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Sincronizado</p>
          <p className="text-xs font-mono" style={{ color: "#34d399" }}>{lastUpdate.toLocaleTimeString("pt-BR")}</p>
        </div>
      </div>

      {/* IA Assistant Section */}
      <div className="card p-4 border-[#c9a227]/30 bg-[#c9a227]/5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9a227]/20 flex items-center justify-center text-xl">🤖</div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>Assistente de Saúde IA</h3>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>Varredura de banco, correção de perfis e validação de sistema.</p>
            </div>
          </div>
          <button 
            onClick={runIaCheck}
            disabled={iaRunning}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${iaRunning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            style={{ background: "#c9a227", color: "#000" }}
          >
            {iaRunning ? "Executando Varredura..." : "IA: Diagnosticar e Corrigir"}
          </button>
        </div>

        {iaResult && (
          <div className="mt-4 p-3 rounded bg-black/40 border border-white/10 space-y-2">
            <p className="text-xs font-bold text-[#34d399]">{iaResult.summary}</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {iaResult.logs.map((log, i) => (
                <p key={i} className="text-[9px] font-mono text-white/50">{log}</p>
              ))}
            </div>
            <button onClick={() => setIaResult(null)} className="text-[9px] uppercase text-white/30 hover:text-white">Fechar Relatório</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className={"card p-4 block transition-all hover:scale-105" + (kpi.urgent ? " glow-gold" : "")} style={{ textDecoration: "none" }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: "1.1rem" }}>{kpi.icon}</span>
              {kpi.urgent && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: kpi.color, boxShadow: `0 0 8px ${kpi.color}` }} />}
            </div>
            <p className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-cinzel)" }}>{kpi.value.toLocaleString("pt-BR")}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>{kpi.label}</p>
          </Link>
        ))}
      </div>

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
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>{u.full_name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>Ativo</span>
                  <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{u.totalMinutes} min hoje</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
