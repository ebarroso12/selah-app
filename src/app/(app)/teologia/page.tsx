"use client";

import { TeologiaForm, TeologiaResultView, useTeologia } from "@/features/teologia";

export default function TeologiaPage() {
  const { result, loading, error, generate } = useTeologia();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Teologia
        </p>
        <h1 className="text-2xl">Análise Teológica com IA</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Análise doutrinária profunda de qualquer texto bíblico — cristologia, soteriologia, pneumatologia e mais.
        </p>
      </div>

      <TeologiaForm onAnalyze={generate} loading={loading} />

      {error && (
        <div className="card p-4 border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center">
          <div className="text-3xl animate-pulse mb-3" style={{ color: "var(--gold)" }}>✦</div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Realizando análise teológica com IA...</p>
        </div>
      )}

      {result && !loading && <TeologiaResultView analise={result} />}
    </div>
  );
}
