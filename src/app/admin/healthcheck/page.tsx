"use client";

import { useState, useEffect } from "react";

interface CheckResult {
  check: string;
  status: "ok" | "warning" | "error" | "fixed";
  message: string;
  detail?: string;
}

interface HealthReport {
  timestamp: string;
  duration_ms: number;
  overall: "healthy" | "degraded" | "critical";
  checks: CheckResult[];
  fixes_applied: number;
  errors_found: number;
  ai_analysis?: string;
  ai_recommendations?: string[];
}

const STATUS_ICON: Record<string, string> = {
  ok: "✅",
  warning: "⚠️",
  error: "❌",
  fixed: "🔧",
};

const STATUS_COLOR: Record<string, string> = {
  ok: "rgba(34,197,94,0.15)",
  warning: "rgba(234,179,8,0.15)",
  error: "rgba(239,68,68,0.15)",
  fixed: "rgba(139,92,246,0.15)",
};

const STATUS_BORDER: Record<string, string> = {
  ok: "rgba(34,197,94,0.3)",
  warning: "rgba(234,179,8,0.3)",
  error: "rgba(239,68,68,0.3)",
  fixed: "rgba(139,92,246,0.3)",
};

const OVERALL_CONFIG = {
  healthy:  { label: "SAUDÁVEL",  color: "#22c55e", emoji: "🟢" },
  degraded: { label: "DEGRADADO", color: "#eab308", emoji: "🟡" },
  critical: { label: "CRÍTICO",   color: "#ef4444", emoji: "🔴" },
};

export default function HealthcheckPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET || "";

  async function runCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/healthcheck", {
        method: "POST",
        headers: { "Authorization": `Bearer ${(window as any).__CRON_SECRET__ || ""}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setReport(data);
      setLastRun(new Date().toLocaleTimeString("pt-BR"));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(runCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const overall = report ? OVERALL_CONFIG[report.overall] : null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)", fontSize: "1.1rem", letterSpacing: "0.06em" }}>
            🤖 Auto-Avaliação & Reparo
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            IA monitora e corrige o SELAH automaticamente
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Última: {lastRun}
            </span>
          )}
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "rgba(255,255,255,0.5)" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="accent-purple-500"
            />
            Auto (5min)
          </label>
          <button
            onClick={runCheck}
            disabled={loading}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Analisando...
              </>
            ) : (
              "▶ Executar"
            )}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="card p-4" style={{ border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)" }}>
          <p className="text-sm" style={{ color: "#f87171" }}>❌ {error}</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Verifique se o CRON_SECRET está configurado nas variáveis de ambiente do Vercel.
          </p>
        </div>
      )}

      {/* Estado inicial */}
      {!report && !loading && !error && (
        <div className="card p-10 flex flex-col items-center justify-center gap-4 text-center">
          <span style={{ fontSize: "3rem" }}>🤖</span>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
            Sistema pronto para análise
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Clique em "Executar" para rodar o healthcheck completo com IA.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && !report && (
        <div className="card p-10 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin text-4xl">⟳</div>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
            IA analisando o sistema...
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Verificando banco, tabelas, usuários, devocional e métricas...
          </p>
        </div>
      )}

      {/* Resultado */}
      {report && (
        <>
          {/* Status geral */}
          <div
            className="card p-5 flex items-center justify-between gap-4"
            style={{
              border: `1px solid ${overall?.color}44`,
              background: `${overall?.color}11`,
            }}
          >
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "2.5rem" }}>{overall?.emoji}</span>
              <div>
                <p style={{ fontFamily: "var(--font-cinzel)", color: overall?.color, letterSpacing: "0.08em", fontSize: "1.1rem" }}>
                  {overall?.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {report.checks.length} checks · {report.duration_ms}ms
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-xl font-bold" style={{ color: "#ef4444" }}>{report.errors_found}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Erros</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "#a78bfa" }}>{report.fixes_applied}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Reparos</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "#22c55e" }}>
                  {report.checks.filter(c => c.status === "ok").length}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>OK</p>
              </div>
            </div>
          </div>

          {/* Análise da IA */}
          {report.ai_analysis && (
            <div className="card p-5 space-y-3"
              style={{ border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.06)" }}>
              <p className="text-xs" style={{ color: "#a78bfa", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
                🧠 ANÁLISE DA IA
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                {report.ai_analysis}
              </p>
              {report.ai_recommendations && report.ai_recommendations.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  <p className="text-xs" style={{ color: "rgba(139,92,246,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                    RECOMENDAÇÕES
                  </p>
                  {report.ai_recommendations.map((rec, i) => (
                    <p key={i} className="text-xs flex gap-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <span style={{ color: "#a78bfa" }}>→</span> {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lista de checks */}
          <div className="space-y-2">
            <p className="text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
              DETALHES DOS CHECKS
            </p>
            {report.checks.map((check, i) => (
              <div
                key={i}
                className="rounded-lg p-3 flex items-start gap-3"
                style={{
                  background: STATUS_COLOR[check.status],
                  border: `1px solid ${STATUS_BORDER[check.status]}`,
                }}
              >
                <span style={{ fontSize: "1rem", lineHeight: 1.5 }}>{STATUS_ICON[check.status]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {check.message}
                  </p>
                  {check.detail && (
                    <p className="text-xs mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {check.detail}
                    </p>
                  )}
                </div>
                <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-cinzel)" }}>
                  {check.check.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
            Executado em {new Date(report.timestamp).toLocaleString("pt-BR")} · {report.duration_ms}ms
          </p>
        </>
      )}
    </div>
  );
}
