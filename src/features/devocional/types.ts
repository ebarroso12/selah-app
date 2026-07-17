import type { Devotional } from "@/types/database";

export type { Devotional };

/** Shape retornado pelo gerador interativo de IA */
export interface DevotionalGenerated {
  titulo: string;
  versiculo: string;
  referencia: string;
  reflexao: string;
  oracao: string;
  frase_destaque: string;
  topico: string;
}

export interface GenerateInteractiveInput {
  tipo: "tema" | "dia";
  tema?: string;
}
