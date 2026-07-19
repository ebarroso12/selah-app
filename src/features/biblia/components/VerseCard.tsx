"use client";

import type { BibleVerse } from "../types";

interface VerseCardProps {
  verse: BibleVerse;
  selected?: boolean;
  favorited?: boolean;
  onSelect?: (v: BibleVerse) => void;
  onFavorite?: (v: BibleVerse) => void;
}

export function VerseCard({ verse, selected, favorited, onSelect, onFavorite }: VerseCardProps) {
  return (
    <div
      onClick={() => onSelect?.(verse)}
      className="group flex gap-3 p-3 rounded-lg transition-all cursor-pointer"
      style={{
        background: selected ? "rgba(201,168,76,0.08)" : "transparent",
        border: selected ? "1px solid rgba(201,168,76,0.25)" : "1px solid transparent",
      }}
    >
      {/* Número do versículo */}
      <span
        className="shrink-0 mt-0.5 text-xs font-bold w-6 text-right"
        style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
      >
        {verse.verse}
      </span>

      {/* Texto */}
      <p
        className="flex-1 text-sm leading-relaxed"
        style={{ color: "var(--text)", fontFamily: "var(--font-lora)", opacity: selected ? 1 : 0.88 }}
      >
        {verse.text}
      </p>

      {/* Botão favoritar */}
      {onFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(verse);
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title={favorited ? "Remover favorito" : "Favoritar"}
          style={{ color: favorited ? "var(--gold)" : "var(--text-muted)" }}
        >
          {favorited ? "★" : "☆"}
        </button>
      )}
    </div>
  );
}
