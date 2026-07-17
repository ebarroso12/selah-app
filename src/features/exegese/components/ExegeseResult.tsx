"use client";

import type { ExegeseResult } from "../services/exegese.service";

const SECOES: { key: keyof ExegeseResult; label: string }[] = [
  { key: "contexto_historico", label: "Contexto Histórico" },
  { key: "contexto_literario", label: "Contexto Literário" },
  { key: "interpretacoes_historicas", label: "Interpretações Históricas" },
  { key: "aplicacao_contemporanea", label: "Aplicação Contemporânea" },
  { key: "conclusao", label: "Conclusão" },
];

interface ExegeseResultProps {
  exegese: ExegeseResult;
}

export function ExegeseResultView({ exegese }: ExegeseResultProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>
          {exegese.titulo}
        </h2>

        {exegese.analise_linguistica?.hebraico_grego && (
          <div
            className="p-4 rounded-xl mb-4"
            style={{ background: "rgba(201,162,39,0.04)", border: "1px solid rgba(201,162,39,0.15)", fontFamily: "serif" }}
          >
            <p
              className="text-xs mb-2"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Texto Original
            </p>
            <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>
              {exegese.analise_linguistica.hebraico_grego}
            </p>
          </div>
        )}
      </div>

      {exegese.analise_linguistica?.termos_importantes?.length > 0 && (
        <div className="card p-6">
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Análise Linguística
          </p>
          <div className="space-y-4">
            {exegese.analise_linguistica.termos_importantes.map((t, i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{ background: "var(--bg-2)", border: "1px solid rgba(201,162,39,0.1)" }}
              >
                <div className="flex items-start gap-4 mb-3 flex-wrap">
                  <div>
                    <span className="text-base font-semibold" style={{ color: "var(--text)" }}>
                      {t.termo}
                    </span>
                    {t.transliteracao && (
                      <span className="ml-2 text-sm italic" style={{ color: "var(--text-muted)" }}>
                        ({t.transliteracao})
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  <strong style={{ color: "var(--gold-label)" }}>Significado:</strong> {t.significado}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {exegese.analise_versicular?.length > 0 && (
        <div className="card p-6">
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Análise Versicular
          </p>
          <div className="space-y-4">
            {exegese.analise_versicular.map((av, i) => (
              <div key={i}>
                <p className="text-xs mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                  {av.versiculo}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {av.analise}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {exegese.temas_teologicos?.length > 0 && (
        <div className="card p-6">
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Temas Teológicos
          </p>
          <div className="flex flex-wrap gap-2">
            {exegese.temas_teologicos.map((t, i) => (
              <span key={i} className="badge badge-gold">{t}</span>
            ))}
          </div>
        </div>
      )}

      {SECOES.map(({ key, label }) => {
        const valor = exegese[key];
        if (!valor || typeof valor !== "string") return null;
        return (
          <div key={key} className="card p-6">
            <p
              className="text-xs tracking-widest uppercase mb-3"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
            >
              {label}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {valor}
            </p>
          </div>
        );
      })}
    </div>
  );
}
