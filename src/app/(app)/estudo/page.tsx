"use client";
import { useState } from "react";

interface SecaoEstudo { secao: string; versiculo: string; explicacao: string; aplicacao: string; }
interface VersiculoRelacionado { referencia: string; texto: string; }
interface GuiaEstudo {
  titulo: string;
  contexto_historico: string;
  estrutura: SecaoEstudo[];
  temas_principais: string[];
  perguntas_reflexao: string[];
  versiculos_relacionados: VersiculoRelacionado[];
  conclusao: string;
}

const SUGESTOES = [
  "João 3:1-21", "Romanos 8", "Salmos 23", "Mateus 5-7 (Sermão do Monte)",
  "Gênesis 1-2", "1 Coríntios 13", "Hebreus 11", "Apocalipse 21-22",
];

export default function EstudoPage() {
  const [input, setInput] = useState("");
  const [guia, setGuia] = useState<GuiaEstudo | null>(null);
  const [loading, setLoading] = useState(false);

  const gerarGuia = async (texto?: string) => {
    const ref = texto || input;
    if (!ref.trim()) return;
    setLoading(true);
    setGuia(null);
    try {
      const res = await fetch("/api/estudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: ref }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGuia(data);
    } catch {
      alert("Erro ao gerar guia de estudo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Estudo Bíblico
        </p>
        <h1 className="text-2xl">Guia de Estudo com IA</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Digite uma referência bíblica ou tema e receba um guia de estudo completo gerado por IA.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Ex: João 3:16, Romanos 8, Salmos 23, Sermão do Monte..."
            className="input-field flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gerarGuia()}
          />
          <button onClick={() => gerarGuia()} disabled={loading || !input.trim()}
            className="btn-primary py-2 px-5 shrink-0">
            {loading ? "Gerando..." : "✦ Gerar Guia"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button key={s} onClick={() => { setInput(s); gerarGuia(s); }}
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
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Gerando guia de estudo com IA...</p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>Isso pode levar alguns segundos</p>
        </div>
      )}

      {guia && !loading && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>{guia.titulo}</h2>
            {guia.temas_principais?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {guia.temas_principais.map((t, i) => (
                  <span key={i} className="badge badge-gold">{t}</span>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs tracking-widest uppercase mb-3"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Contexto Histórico
              </p>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                {guia.contexto_historico?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>

          {guia.estrutura?.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs tracking-widest uppercase"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Estrutura do Texto
              </p>
              {guia.estrutura.map((s, i) => (
                <div key={i} className="card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: "rgba(201,162,39,0.2)", color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base mb-1">{s.secao}</h3>
                      {s.versiculo && (
                        <p className="text-xs" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)" }}>
                          {s.versiculo}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {s.explicacao}
                  </p>
                  {s.aplicacao && (
                    <div className="p-3 rounded-lg"
                      style={{ background: "rgba(201,162,39,0.05)", borderLeft: "2px solid rgba(201,162,39,0.3)" }}>
                      <p className="text-xs mb-1"
                        style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Aplicação
                      </p>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{s.aplicacao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {guia.perguntas_reflexao?.length > 0 && (
            <div className="card p-6">
              <p className="text-xs tracking-widest uppercase mb-4"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Perguntas para Reflexão
              </p>
              <ol className="space-y-3">
                {guia.perguntas_reflexao.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 text-sm" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
                      {i + 1}.
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{q}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {guia.versiculos_relacionados?.length > 0 && (
            <div className="card p-6">
              <p className="text-xs tracking-widest uppercase mb-4"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Versículos Relacionados
              </p>
              <div className="space-y-3">
                {guia.versiculos_relacionados.map((v, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 text-xs pt-1" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                      {v.referencia}
                    </span>
                    <p className="scripture text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{v.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guia.conclusao && (
            <div className="card p-6"
              style={{ background: "rgba(201,162,39,0.04)", borderColor: "rgba(201,162,39,0.2)" }}>
              <p className="text-xs tracking-widest uppercase mb-3"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Conclusão
              </p>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{guia.conclusao}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
