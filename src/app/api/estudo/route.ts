/**
 * Task 7 — Auth obrigatório + rate limit + validação Zod (migrado para ai-feature kit)
 */
import { z } from "zod";
import { createAIRoute } from "@/shared/ai-feature";
import {
  generateEstudo,
  type EstudoInput,
} from "@/features/estudo/services/estudo.service";

const schema = z
  .object({
    texto: z.string().min(1).max(5000).optional(),
    livro: z.string().max(100).optional(),
    capitulo: z.union([z.string(), z.number()]).optional(),
  })
  .transform(
    (data): EstudoInput => ({
      texto: data.texto,
      livro: data.livro,
      capitulo:
        typeof data.capitulo === "string"
          ? Number(data.capitulo)
          : data.capitulo,
    }),
  );

export const POST = createAIRoute<EstudoInput, unknown>({
  service: generateEstudo,
  schema,
  feature: "estudo",
  errorMessage: "Erro ao gerar guia de estudo",
});
