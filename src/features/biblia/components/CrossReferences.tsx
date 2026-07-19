"use client";

import type { CrossReference } from "../types";

interface CrossReferencesProps {
  references: CrossReference[];
  loading?: boolean;
  onClose?: () => void;
}

export function CrossReferences({ references, loading, onClose }: CrossReferencesProps) {
  if (loading) {
    return (
      <div className="card p-4 mt-3">
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Buscando referências cruzadas...
        </p>
      </div>
    );
  }

  if (!references.length) return null;

  return (
    <div className="card p-4 mt-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
        >
          Referências Cruzadas
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            ✕ Fechar
          </button>
        )}
      </div>
      {references.map((ref, i) => (
        <div
          key={i}
          className="pl-3"
          style={{ borderLeft: "2px solid rgba(201,168,76,0.3)" }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
          >
            {ref.reference}
          </p>
          <p className="text-sm mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-lora)" }}>
            {ref.text}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {ref.connection}
          </p>
        </div>
      ))}
    </div>
  );
}
