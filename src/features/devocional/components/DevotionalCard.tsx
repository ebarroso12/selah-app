"use client";

import type { Devotional } from "../types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface DevotionalCardProps {
  devotional: Devotional;
  /** Se true, renderiza o card expandido com reflexão e oração completas */
  expanded?: boolean;
}

export function DevotionalCard({ devotional: d, expanded = false }: DevotionalCardProps) {
  const verseRef = `${d.bible_book} ${d.bible_chapter}:${d.bible_verse_start}${
    d.bible_verse_end ? `–${d.bible_verse_end}` : ""
  }`;

  if (!expanded) {
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p
              className="text-xs mb-1"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
            >
              {formatDate(d.date)}
            </p>
            <h3 className="text-base">{d.title}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--gold-label)" }}>
              {verseRef}
            </p>
          </div>
          {d.generated_by_ai && (
            <span className="badge badge-gold shrink-0 text-xs">IA</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-1"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            {formatDate(d.date)}
          </p>
          <h2 className="text-xl leading-snug">{d.title}</h2>
        </div>
        {d.generated_by_ai && (
          <span className="badge badge-gold shrink-0">Gerado por IA</span>
        )}
      </div>

      <blockquote
        className="scripture text-base leading-relaxed p-5 rounded-xl mb-6"
        style={{ background: "rgba(201,162,39,0.05)", borderLeft: "3px solid rgba(201,162,39,0.5)" }}
      >
        {d.bible_passage}
        <footer
          className="mt-3 text-sm not-italic"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}
        >
          {verseRef}
        </footer>
      </blockquote>

      <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text)" }}>
        {d.reflection_text.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {d.prayer_text && (
        <div
          className="mt-8 p-5 rounded-xl"
          style={{ background: "var(--bg-2)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          <p
            className="text-xs mb-3"
            style={{
              color: "var(--gold-label)",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Oração
          </p>
          <p className="scripture text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {d.prayer_text}
          </p>
        </div>
      )}
    </div>
  );
}
