"use client";

import { useState } from "react";
import { homenagensService } from "../services/homenagem.service";

export function useRewriteText() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rewrite(texto: string): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      return await homenagensService.rewrite(texto);
    } catch {
      setError("Não foi possível reescrever. Tente novamente.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { rewrite, loading, error };
}
