/**
 * Task 6.3 — Exegese Service
 */
import { createAIService } from "@/shared/ai-feature";
import { EXEGESE_SYSTEM_PROMPT } from "../prompts/exegese.system";

export interface ExegeseInput {
  texto?: string;
  livro?: string;
  capitulo?: number;
  versiculo?: number;
}

export interface ExegesisTermo {
  termo: string;
  transliteracao: string;
  significado: string;
}

export interface ExegeseResult {
  titulo: string;
  analise_linguistica: {
    hebraico_grego: string;
    termos_importantes: ExegesisTermo[];
  };
  contexto_historico: string;
  contexto_literario: string;
  analise_versicular: { versiculo: string; analise: string }[];
  temas_teologicos: string[];
  interpretacoes_historicas: string;
  aplicacao_contemporanea: string;
  conclusao: string;
}

export const generateExegese = createAIService<ExegeseInput, ExegeseResult>({
  feature: "exegese",
  systemPrompt: EXEGESE_SYSTEM_PROMPT,
  maxTokens: 3500,
  temperature: 0.4,
  buildUserPrompt: (input) => {
    const contexto = input.texto
      ? `"${input.texto}" (${input.livro} ${input.capitulo}:${input.versiculo})`
      : `${input.livro} ${input.capitulo}:${input.versiculo}`;
    return `Faça uma exegese de: ${contexto}`;
  },
});
