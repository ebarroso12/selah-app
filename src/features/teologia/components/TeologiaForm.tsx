"use client";

import type { TeologiaInput } from "../services/teologia.service";

const SUGESTOES = [
  "João 1:1-14", "Romanos 3:21-26", "Filipenses 2:5-11", "Colossenses 1:15-20",
  "Hebreus 1:1-4", "1 João 4:7-12", "Apocalipse 1:4-8", "Gênesis 1:26-27",
];

interface TeologiaFormProps {
  onAnalyze: (input: TeologiaInput) => void;
  loading: boolean;
}

export function TeologiaForm({ onAnalyze, loading }: TeologiaFormProps) {
  const handleSubmit = (texto: string) => {
    if (!texto.trim()) return;
    onAnalyze({ texto });
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="teologia-input"
          type="text"
          placeholder="Ex: João 1:1-14, Filipenses 2:5-11, Romanos 3:21-26..."
          className="input-field flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit((e.target as HTMLInputElement).value);
            }
          }}
        />
        <button
          onClick={() => {
            const el = document.getElementById("teologia-input") as HTMLInputElement | null;
            handleSubmit(el?.value ?? "");
          }}
          disabled={loading}
          className="btn-primary py-2 px-5 shrink-0"
        >
          {loading ? "Analisando..." : "✦ Analisar"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGESTOES.map((s) => (
          <button
            key={s}
            onClick={() => handleSubmit(s)}
            className="text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              background: "rgba(201,162,39,0.08)",
              color: "var(--gold-label)",
              border: "1px solid rgba(201,162,39,0.2)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
