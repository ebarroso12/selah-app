"use client";

import { useState } from "react";
import { useBibleSearch } from "../hooks/useBibleSearch";
import type { BibleVersion } from "../types";

interface BibleSearchProps {
  version?: BibleVersion;
}

export function BibleSearch({ version = "ARC" }: BibleSearchProps) {
  const [query, setQuery] = useState("");
  const { results, loading, error, search, clear } = useBibleSearch();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) search(query, version);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) clear();
          }}
          placeholder="Buscar versículo (ex: amor, fé, coragem...)"
          className="flex-1 px-3 py-2 text-sm rounded-lg"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-wine px-4 text-sm"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="text-sm" style={{ color: "var(--wine-light)" }}>{error}</p>
      )}

      {results && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {results.total} resultado{results.total !== 1 ? "s" : ""} encontrado{results.total !== 1 ? "s" : ""}
          </p>
          {results.results.map((v) => (
            <div
              key={v.id}
              className="card p-3"
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
              >
                {v.book} {v.chapter}:{v.verse}
              </p>
              {v.headline ? (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text)", fontFamily: "var(--font-lora)" }}
                  dangerouslySetInnerHTML={{ __html: v.headline }}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-lora)" }}>
                  {v.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
