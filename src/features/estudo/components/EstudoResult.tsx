"use client";

import type { EstudoResult } from "../services/estudo.service";

interface EstudoResultProps {
  guia: EstudoResult;
}

export function EstudoResultView({ guia }: EstudoResultProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>
          {guia.titulo}
        </h2>
        {guia.temas_principais?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {guia.temas_principais.map((t, i) => (
              <span key={i} className="badge badge-gold">{t}</span>
            ))}
          </div>
        )}
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Contexto Histórico
          </p>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {guia.contexto_historico?.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>

      {guia.estrutura?.length > 0 && (
        <div className="space-y-4">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Estrutura do Texto
          </p>
          {guia.estrutura.map((s, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: "rgba(201,162,39,0.2)",
                    color: "var(--gold)",
                    fontFamily: "var(--font-cinzel)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-base mb-1">{s.secao}</h3>
                  {s.versiculo && (
                    <p className="text-xs" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
                      {s.versiculo}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
                {s.explicacao}
              </p>
              {s.aplicacao && (
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "rgba(201,162,39,0.05)", borderLeft: "2px solid rgba(201,162,39,0.3)" }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{
                      color: "var(--gold-label)",
                      fontFamily: "var(--font-cinzel)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Aplicação
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{s.aplicacao}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {guia.perguntas_reflexao?.length > 0 && (
        <div className="card p-6">
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Perguntas para Reflexão
          </p>
          <ol className="space-y-3">
            {guia.perguntas_reflexao.map((q, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="shrink-0 text-sm"
                  style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
                >
                  {i + 1}.
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{q}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {guia.versiculos_relacionados?.length > 0 && (
        <div className="card p-6">
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Versículos Relacionados
          </p>
          <div className="space-y-3">
            {guia.versiculos_relacionados.map((v, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="shrink-0 text-xs pt-1"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
                >
                  {v.referencia}
                </span>
                <p className="scripture text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {v.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guia.conclusao && (
        <div
          className="card p-6"
          style={{ background: "rgba(201,162,39,0.04)", borderColor: "rgba(201,162,39,0.2)" }}
        >
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Conclusão
          </p>
          <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>
            {guia.conclusao}
          </p>
        </div>
      )}
    </div>
  );
}
