"use client";

import type { ExegeseInput } from "../services/exegese.service";

const SUGESTOES = [
  "João 1:1", "Romanos 1:16-17", "Gênesis 1:1", "Mateus 28:19-20",
  "Filipenses 4:13", "João 3:16", "Salmos 23:1", "Hebreus 11:1",
];

interface ExegeseFormProps {
  onAnalyze: (input: ExegeseInput) => void;
  loading: boolean;
}

export function ExegeseForm({ onAnalyze, loading }: ExegeseFormProps) {
  const handleSubmit = (texto: string) => {
    if (!texto.trim()) return;
    onAnalyze({ texto });
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="exegese-input"
          type="text"
          placeholder="Ex: João 1:1, Gênesis 1:1, Romanos 1:16-17..."
          className="input-field flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit((e.target as HTMLInputElement).value);
            }
          }}
        />
        <button
          onClick={() => {
            const el = document.getElementById("exegese-input") as HTMLInputElement | null;
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
