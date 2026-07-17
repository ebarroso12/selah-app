"use client";

import { useState, useCallback } from "react";
import type { UseAIGeneratorConfig } from "./types";

/**
 * Hook genérico para chamar uma rota de IA. Substitui hooks idênticos
 * (useEstudo, useTeologia, useExegese) por uma chamada parametrizada.
 */
export function useAIGenerator<TInput, TResult>(config: UseAIGeneratorConfig) {
  const [result, setResult] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (input: TInput) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setResult(json as TResult);
      } catch (e) {
        setError(e instanceof Error ? e.message : config.errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [config.endpoint, config.errorMessage],
  );

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, generate, clear } as const;
}
