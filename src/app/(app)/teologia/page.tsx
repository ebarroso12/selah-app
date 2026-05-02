"use client";
import { useState } from "react";

interface Doutrina { doutrina: string; explicacao: string; versiculos_suporte: string[]; }
interface AnaliseTeologica {
  titulo: string;
  doutrinas_principais: Doutrina[];
  cristologia?: string;
  pneumatologia?: string;
  soteriologia?: string;
  escatologia?: string;
  hermeneutica?: string;
  aplicacao_pratica?: string;
  perspectivas_historicas?: string;
}

const SUGESTOES = [
  "João 1:1-14", "Romanos 3:21-26", "Filipenses 2:5-11", "Colossenses 1:15-20",
  "Hebreus 1:1-4", "1 João 4:7-12", "Apocalipse 1:4-8", "Gênesis 1:26-27",
];

export default function TeologiaPage() {
  const [input, setInput] = useState("");
  const [analise, setAnalise] = useState<AnaliseTeologica | null>(null);
  const [loading, setLoading] = useState(false);

  const analisar = async (texto?: string) => {
    const ref = texto || input;
    if (!ref.trim()) return;
    setLoading(true);
    setAnalise(null);
    try {
      const res = await fetch("/api/teologia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: ref }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalise(data);
    } catch {
      alert("Erro ao gerar análise teológica. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const CAMPOS_TEOLOGICOS = [
    { key: "cristologia", label: "Cristologia" },
    { key: "pneumatologia", label: "Pneumatologia" },
    { key: "soteriologia", label: "Soteriologia" },
    { key: "escatologia", label: "Escatologia" },
    { key: "hermeneutica", label: "Hermenêutica" },
    { key: "perspectivas_historicas", label: "Perspectivas Históricas" },
    { key: "aplicacao_pratica", label: "Aplicação Prática" },
  ] as const;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Teologia
        </p>
        <h1 className="text-2xl">Análise Teológica com IA</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Análise doutrinária profunda de qualquer texto bíblico — cristologia, soteriologia, pneumatologia e mais.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Ex: João 1:1-14, Filipenses 2:5-11, Romanos 3:21-26..."
            className="input-field flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analisar()}
          />
          <button onClick={() => analisar()} disabled={loading || !input.trim()}
            className="btn-primary py-2 px-5 shrink-0">
            {loading ? "Analisando..." : "✦ Analisar"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button key={s} onClick={() => { setInput(s); analisar(s); }}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: "rgba(201,162,39,0.08)", color: "rgba(201,162,39,0.8)", border: "1px solid rgba(201,162,39,0.2)" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="card p-12 text-center">
          <div className="text-3xl animate-pulse mb-3" style={{ color: "var(--gold)" }}>✦</div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Realizando análise teológica com IA...</p>
        </div>
      )}

      {analise && !loading && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-cinzel)" }}>{analise.titulo}</h2>
            {analise.doutrinas_principais?.length > 0 && (
              <div>
                <p className="text-xs tracking-widest uppercase mb-4"
                  style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                  Doutrinas Principais
                </p>
                <div className="space-y-4">
                  {analise.doutrinas_principais.map((d, i) => (
                    <div key={i} className="p-4 rounded-xl"
                      style={{ background: "rgba(201,162,39,0.04)", border: "1px solid rgba(201,162,39,0.12)" }}>
                      <h3 className="text-base mb-2" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                        {d.doutrina}
                      </h3>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {d.explicacao}
                      </p>
                      {d.versiculos_suporte?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {d.versiculos_suporte.map((v, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded"
                              style={{ background: "rgba(201,162,39,0.12)", color: "rgba(201,162,39,0.8)" }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {CAMPOS_TEOLOGICOS.map(({ key, label }) => {
            const valor = analise[key];
            if (!valor) return null;
            return (
              <div key={key} className="card p-6">
                <p className="text-xs tracking-widest uppercase mb-3"
                  style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                  {label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{valor}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
