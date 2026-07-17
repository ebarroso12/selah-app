"use client";

import { useState, useCallback } from "react";
import { generateInteractive } from "../services/devotional.service";
import type { DevotionalGenerated, GenerateInteractiveInput } from "../types";

export function useGenerateDevotional() {
  const [result, setResult] = useState<DevotionalGenerated | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: GenerateInteractiveInput) => {
    if (input.tipo === "tema" && !input.tema?.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const generated = await generateInteractive(input);
      setResult(generated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao gerar devocional");
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, result, loading, error };
}
