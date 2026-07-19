/**
 * Task 6.3 — Teologia Service (refatorado para ai-feature kit)
 */
import { createAIService } from "@/shared/ai-feature";
import { TEOLOGIA_SYSTEM_PROMPT } from "../prompts/teologia.system";

export interface TeologiaInput {
  texto?: string;
  livro?: string;
  capitulo?: number;
}

export interface TeologiaDoutrina {
  doutrina: string;
  explicacao: string;
  versiculos_suporte: string[];
}

export interface TeologiaResult {
  titulo: string;
  doutrinas_principais: TeologiaDoutrina[];
  cristologia: string;
  pneumatologia: string;
  soteriologia: string;
  escatologia: string;
  hermeneutica: string;
  aplicacao_pratica: string;
  perspectivas_historicas: string;
}

export const generateTeologia = createAIService<TeologiaInput, TeologiaResult>({
  feature: "teologia",
  systemPrompt: TEOLOGIA_SYSTEM_PROMPT,
  buildUserPrompt: (input) => {
    const contexto = input.texto
      ? `Texto/versículo: "${input.texto}"`
      : `${input.livro} capítulo ${input.capitulo}`;
    return `Faça uma análise teológica de: ${contexto}`;
  },
});
