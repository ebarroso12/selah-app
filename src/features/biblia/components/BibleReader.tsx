"use client";

import { useEffect, useRef } from "react";
import { VerseCard } from "./VerseCard";
import type { BibleChapterResult, BibleVerse } from "../types";

interface BibleReaderProps {
  data: BibleChapterResult | null;
  loading?: boolean;
  error?: string | null;
  selectedVerse: BibleVerse | null;
  onSelectVerse: (v: BibleVerse | null) => void;
  favoritedIds?: Set<number>;
  onFavorite?: (v: BibleVerse) => void;
}

export function BibleReader({
  data,
  loading,
  error,
  selectedVerse,
  onSelectVerse,
  favoritedIds,
  onFavorite,
}: BibleReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll topo ao mudar capítulo
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [data?.book, data?.chapter]);

  if (loading) {
    return (
      <div className="card p-6 text-center" style={{ minHeight: 300 }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center" style={{ minHeight: 300 }}>
        <p className="text-sm" style={{ color: "var(--wine-light)" }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-6 text-center" style={{ minHeight: 300 }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Selecione um livro e capítulo para começar a leitura.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="card p-4 overflow-y-auto space-y-1"
      style={{ maxHeight: "60vh" }}
    >
      {/* Cabeçalho */}
      <div className="pb-3 mb-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2
          className="text-lg"
          style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
        >
          {data.book} {data.chapter}
        </h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {data.version} · {data.totalVerses} versículos
        </p>
      </div>

      {/* Versículos */}
      {data.verses.map((verse) => (
        <VerseCard
          key={verse.id}
          verse={verse}
          selected={selectedVerse?.id === verse.id}
          favorited={favoritedIds?.has(verse.id)}
          onSelect={(v) => onSelectVerse(selectedVerse?.id === v.id ? null : v)}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}
