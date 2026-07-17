/**
 * Task 8 — Auth obrigatório + rate limit + validação Zod
 */
import { z } from "zod";
import { createAIRoute } from "@/shared/ai-feature";
import {
  generateExegese,
  type ExegeseInput,
} from "@/features/exegese/services/exegese.service";

const schema = z
  .object({
    texto: z.string().min(1).max(5000).optional(),
    livro: z.string().max(100).optional(),
    capitulo: z.union([z.string(), z.number()]).optional(),
    versiculo: z.union([z.string(), z.number()]).optional(),
  })
  .transform((data): ExegeseInput => ({
    texto: data.texto,
    livro: data.livro,
    capitulo: typeof data.capitulo === "string" ? Number(data.capitulo) : data.capitulo,
    versiculo: typeof data.versiculo === "string" ? Number(data.versiculo) : data.versiculo,
  }));

export const POST = createAIRoute<ExegeseInput, unknown>({
  service: generateExegese,
  schema,
  feature: "exegese",
  errorMessage: "Erro ao gerar exegese",
});
