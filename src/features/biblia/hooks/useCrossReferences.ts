"use client";

import { useState, useCallback } from "react";
import type { CrossReferencesResult, BibleVersion } from "../types";

export interface UseCrossReferencesReturn {
  data: CrossReferencesResult | null;
  loading: boolean;
  error: string | null;
  fetch: (params: {
    book: string;
    chapter: number;
    verseNumber: number;
    text: string;
    version?: BibleVersion;
  }) => Promise<void>;
  clear: () => void;
}

export function useCrossReferences(): UseCrossReferencesReturn {
  const [data, setData] = useState<CrossReferencesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRefs = useCallback(
    async (params: {
      book: string;
      chapter: number;
      verseNumber: number;
      text: string;
      version?: BibleVersion;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/biblia/referencias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verse: params.text,
            book: params.book,
            chapter: params.chapter,
            verseNumber: params.verseNumber,
            version: params.version ?? "ARC",
          }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json as CrossReferencesResult);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao buscar referências");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch: fetchRefs, clear };
}
