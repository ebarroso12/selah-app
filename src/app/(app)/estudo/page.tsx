"use client";

import { EstudoForm, EstudoResultView, useEstudo } from "@/features/estudo";

export default function EstudoPage() {
  const { result, loading, error, generate } = useEstudo();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Estudo Bíblico
        </p>
        <h1 className="text-2xl">Guia de Estudo com IA</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Digite uma referência bíblica ou tema e receba um guia de estudo completo gerado por IA.
        </p>
      </div>

      <EstudoForm onGenerate={generate} loading={loading} />

      {error && (
        <div className="card p-4 border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center">
          <div className="text-3xl animate-pulse mb-3" style={{ color: "var(--gold)" }}>✦</div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Gerando guia de estudo com IA...</p>
          <p className="text-xs mt-2" style={{ color: "var(--text-subtle)" }}>Isso pode levar alguns segundos</p>
        </div>
      )}

      {result && !loading && <EstudoResultView guia={result} />}
    </div>
  );
}
