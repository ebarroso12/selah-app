import { generateAI } from "@/shared/services/ai/ai.service";
import type { AIServiceConfig } from "./types";

/**
 * Cria um service de IA tipado. Encapsula o padrão "system+user prompt → JSON parse".
 * Reduz services específicos (estudo, exegese, teologia) a uma config declarativa.
 */
export function createAIService<TInput, TResult>(
  config: AIServiceConfig<TInput, TResult>,
): (input: TInput, userId?: string) => Promise<TResult> {
  return async (input, userId) => {
    const { content } = await generateAI({
      provider: "openai",
      model: config.model ?? "gpt-4o-mini",
      feature: config.feature,
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: config.buildUserPrompt(input) },
      ],
      maxTokens: config.maxTokens ?? 3000,
      temperature: config.temperature ?? 0.5,
      responseFormat: "json_object",
      userId,
    });
    return JSON.parse(content || "{}") as TResult;
  };
}
