"use client";
import { useState } from "react";

interface PalavraOriginal {
  palavra: string;
  original: string;
  transliteracao: string;
  significado: string;
  uso_biblico: string;
}

interface Exegese {
  titulo: string;
  texto_original?: string;
  analise_linguistica: PalavraOriginal[];
  contexto_literario: string;
  contexto_historico_cultural: string;
  estrutura_retorica?: string;
  interpretacao: string;
  implicacoes_teologicas: string;
  aplicacao_contemporanea: string;
}

const SUGESTOES = [
  "João 1:1", "Romanos 1:16-17", "Gênesis 1:1", "Mateus 28:19-20",
  "Filipenses 4:13", "João 3:16", "Salmos 23:1", "Hebreus 11:1",
];

export default function ExegesePage() {
  const [input, setInput] = useState("");
  const [exegese, setExegese] = useState<Exegese | null>(null);
  const [loading, setLoading] = useState(false);

  const analisar = async (texto?: string) => {
    const ref = texto || input;
    if (!ref.trim()) return;
    setLoading(true);
    setExegese(null);
    try {
      const res = await fetch("/api/exegese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: ref }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExegese(data);
    } catch {
      alert("Erro ao gerar exegese. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Exegese
        </p>
        <h1 className="text-2xl">Análise Exegética com IA</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Análise profunda do texto original em hebraico/grego — linguística, histórica e hermenêutica.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Ex: João 1:1, Gênesis 1:1, Romanos 1:16-17..."
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
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Realizando exegese com IA...</p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>Analisando hebraico/grego original...</p>
        </div>
      )}

      {exegese && !loading && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>{exegese.titulo}</h2>
            {exegese.texto_original && (
              <div className="p-4 rounded-xl mb-4"
                style={{ background: "rgba(201,162,39,0.04)", border: "1px solid rgba(201,162,39,0.15)", fontFamily: "serif" }}>
                <p className="text-xs mb-2"
                  style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Texto Original
                </p>
                <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {exegese.texto_original}
                </p>
              </div>
            )}
          </div>

          {exegese.analise_linguistica?.length > 0 && (
            <div className="card p-6">
              <p className="text-xs tracking-widest uppercase mb-4"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Análise Linguística
              </p>
              <div className="space-y-4">
                {exegese.analise_linguistica.map((p, i) => (
                  <div key={i} className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,162,39,0.1)" }}>
                    <div className="flex items-start gap-4 mb-3 flex-wrap">
                      <div>
                        <span className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                          {p.palavra}
                        </span>
                        {p.original && (
                          <span className="ml-2 text-base" style={{ color: "var(--gold)", fontFamily: "serif" }}>
                            {p.original}
                          </span>
                        )}
                      </div>
                      {p.transliteracao && (
                        <span className="text-sm italic" style={{ color: "rgba(255,255,255,0.5)" }}>
                          ({p.transliteracao})
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
                      <strong style={{ color: "rgba(201,162,39,0.7)" }}>Significado:</strong> {p.significado}
                    </p>
                    {p.uso_biblico && (
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                        <strong>Uso bíblico:</strong> {p.uso_biblico}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {[
            { key: "contexto_literario", label: "Contexto Literário" },
            { key: "contexto_historico_cultural", label: "Contexto Histórico-Cultural" },
            { key: "estrutura_retorica", label: "Estrutura Retórica" },
            { key: "interpretacao", label: "Interpretação" },
            { key: "implicacoes_teologicas", label: "Implicações Teológicas" },
            { key: "aplicacao_contemporanea", label: "Aplicação Contemporânea" },
          ].map(({ key, label }) => {
            const valor = exegese[key as keyof Exegese] as string | undefined;
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
