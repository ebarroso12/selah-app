/**
 * Task 6.3 — Estudo Service (migrado para ai-feature kit)
 */
import { createAIService } from "@/shared/ai-feature";
import { ESTUDO_SYSTEM_PROMPT } from "../prompts/estudo.system";

export interface EstudoInput {
  texto?: string;
  livro?: string;
  capitulo?: number;
}

export interface EstudoSecao {
  secao: string;
  versiculo: string;
  explicacao: string;
  aplicacao: string;
}

export interface EstudoResult {
  titulo: string;
  contexto_historico: string;
  estrutura: EstudoSecao[];
  temas_principais: string[];
  perguntas_reflexao: string[];
  versiculos_relacionados: { referencia: string; texto: string }[];
  conclusao: string;
}

export const generateEstudo = createAIService<EstudoInput, EstudoResult>({
  feature: "estudo",
  systemPrompt: ESTUDO_SYSTEM_PROMPT,
  buildUserPrompt: (input) => {
    const contexto = input.texto
      ? `Texto/versículo específico: "${input.texto}"`
      : `Capítulo: ${input.livro} ${input.capitulo}`;
    return `Crie um guia de estudo para: ${contexto}`;
  },
});
