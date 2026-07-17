"use client";

import type { EstudoInput } from "../services/estudo.service";

const SUGESTOES = [
  "João 3:1-21", "Romanos 8", "Salmos 23", "Mateus 5-7 (Sermão do Monte)",
  "Gênesis 1-2", "1 Coríntios 13", "Hebreus 11", "Apocalipse 21-22",
];

interface EstudoFormProps {
  onGenerate: (input: EstudoInput) => void;
  loading: boolean;
}

export function EstudoForm({ onGenerate, loading }: EstudoFormProps) {
  const handleSubmit = (texto: string) => {
    if (!texto.trim()) return;
    onGenerate({ texto });
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="estudo-input"
          type="text"
          placeholder="Ex: João 3:16, Romanos 8, Salmos 23, Sermão do Monte..."
          className="input-field flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit((e.target as HTMLInputElement).value);
            }
          }}
        />
        <button
          onClick={() => {
            const el = document.getElementById("estudo-input") as HTMLInputElement | null;
            handleSubmit(el?.value ?? "");
          }}
          disabled={loading}
          className="btn-primary py-2 px-5 shrink-0"
        >
          {loading ? "Gerando..." : "✦ Gerar Guia"}
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
