/**
 * Task 9 — Auth obrigatório + rate limit + validação Zod (via ai-feature kit)
 */
import { z } from "zod";
import { createAIRoute } from "@/shared/ai-feature";
import {
  generateTeologia,
  type TeologiaInput,
} from "@/features/teologia/services/teologia.service";

const schema = z
  .object({
    texto: z.string().min(1).max(5000).optional(),
    livro: z.string().max(100).optional(),
    capitulo: z.union([z.string(), z.number()]).optional(),
  })
  .transform((data): TeologiaInput => ({
    texto: data.texto,
    livro: data.livro,
    capitulo: typeof data.capitulo === "string" ? Number(data.capitulo) : data.capitulo,
  }));

export const POST = createAIRoute<TeologiaInput, unknown>({
  service: generateTeologia,
  schema,
  feature: "teologia",
  errorMessage: "Erro ao gerar análise teológica",
});
