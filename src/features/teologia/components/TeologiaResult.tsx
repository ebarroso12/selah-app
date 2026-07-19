"use client";

import type { TeologiaResult } from "../services/teologia.service";

const CAMPOS_TEOLOGICOS: { key: keyof TeologiaResult; label: string }[] = [
  { key: "cristologia", label: "Cristologia" },
  { key: "pneumatologia", label: "Pneumatologia" },
  { key: "soteriologia", label: "Soteriologia" },
  { key: "escatologia", label: "Escatologia" },
  { key: "hermeneutica", label: "Hermenêutica" },
  { key: "perspectivas_historicas", label: "Perspectivas Históricas" },
  { key: "aplicacao_pratica", label: "Aplicação Prática" },
];

interface TeologiaResultProps {
  analise: TeologiaResult;
}

export function TeologiaResultView({ analise }: TeologiaResultProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-cinzel)" }}>
          {analise.titulo}
        </h2>
        {analise.doutrinas_principais?.length > 0 && (
          <div>
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
            >
              Doutrinas Principais
            </p>
            <div className="space-y-4">
              {analise.doutrinas_principais.map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(201,162,39,0.04)", border: "1px solid rgba(201,162,39,0.12)" }}
                >
                  <h3 className="text-base mb-2" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                    {d.doutrina}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
                    {d.explicacao}
                  </p>
                  {d.versiculos_suporte?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {d.versiculos_suporte.map((v, j) => (
                        <span
                          key={j}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "rgba(201,162,39,0.12)", color: "rgba(201,162,39,0.8)" }}
                        >
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
