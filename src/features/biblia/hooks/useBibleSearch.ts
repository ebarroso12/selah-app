"use client";

import { useState, useCallback } from "react";
import type { BibleSearchResult, BibleVersion } from "../types";

export interface UseBibleSearchReturn {
  results: BibleSearchResult | null;
  loading: boolean;
  error: string | null;
  search: (query: string, version?: BibleVersion) => Promise<void>;
  clear: () => void;
}

export function useBibleSearch(): UseBibleSearchReturn {
  const [results, setResults] = useState<BibleSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, version: BibleVersion = "ARC") => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/biblia/busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, version }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResults(json as BibleSearchResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na busca");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}
