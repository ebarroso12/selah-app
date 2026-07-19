"use client";

import { useState } from "react";
import { testimonyService } from "../services/testimony.service";
import type { NewTestimony, Testimony } from "../types";

export function useCreateTestimony() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(input: NewTestimony): Promise<Testimony | null> {
    setLoading(true);
    setError(null);
    try {
      const result = await testimonyService.create(input);
      return result;
    } catch {
      setError("Erro ao enviar testemunho. Tente novamente.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { create, loading, error };
}
