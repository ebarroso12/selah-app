"use client";

import { useAIGenerator } from "@/shared/ai-feature/useAIGenerator";
import type { ExegeseResult, ExegeseInput } from "../services/exegese.service";

export function useExegese() {
  return useAIGenerator<ExegeseInput, ExegeseResult>({
    endpoint: "/api/exegese",
    errorMessage: "Erro ao gerar exegese",
  });
}
