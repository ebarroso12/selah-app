"use client";

import { useAIGenerator } from "@/shared/ai-feature/useAIGenerator";
import type { TeologiaResult, TeologiaInput } from "../services/teologia.service";

export function useTeologia() {
  return useAIGenerator<TeologiaInput, TeologiaResult>({
    endpoint: "/api/teologia",
    errorMessage: "Erro ao gerar análise teológica",
  });
}
