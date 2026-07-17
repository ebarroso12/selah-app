"use client";

import { useState, useCallback } from "react";
import type { BibleChapterResult, BibleVersion } from "../types";

export interface UseBibleChapterReturn {
  data: BibleChapterResult | null;
  loading: boolean;
  error: string | null;
  load: (version: BibleVersion, book: string, chapter: number) => Promise<void>;
}

export function useBibleChapter(): UseBibleChapterReturn {
  const [data, setData] = useState<BibleChapterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (version: BibleVersion, book: string, chapter: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/biblia/texto?book=${encodeURIComponent(book)}&chapter=${chapter}&version=${version}`,
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json as BibleChapterResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar capítulo");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, load };
}
