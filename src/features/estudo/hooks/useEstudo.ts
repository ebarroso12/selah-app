"use client";

import { useAIGenerator } from "@/shared/ai-feature/useAIGenerator";
import type { EstudoResult, EstudoInput } from "../services/estudo.service";

export function useEstudo() {
  return useAIGenerator<EstudoInput, EstudoResult>({
    endpoint: "/api/estudo",
    errorMessage: "Erro ao gerar guia de estudo",
  });
}
