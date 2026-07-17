"use client";

import { ExegeseForm, ExegeseResultView, useExegese } from "@/features/exegese";

export default function ExegesePage() {
  const { result, loading, error, generate } = useExegese();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Exegese
        </p>
        <h1 className="text-2xl">Análise Exegética com IA</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Análise profunda do texto original em hebraico/grego — linguística, histórica e hermenêutica.
        </p>
      </div>

      <ExegeseForm onAnalyze={generate} loading={loading} />

      {error && (
        <div className="card p-4 border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center">
          <div className="text-3xl animate-pulse mb-3" style={{ color: "var(--gold)" }}>✦</div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Realizando exegese com IA...</p>
          <p className="text-xs mt-2" style={{ color: "var(--text-subtle)" }}>Analisando hebraico/grego original...</p>
        </div>
      )}

      {result && !loading && <ExegeseResultView exegese={result} />}
    </div>
  );
}
