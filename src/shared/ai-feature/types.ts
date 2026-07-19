import type { ZodSchema } from "zod";
import type { AiFeature } from "@/types/database";

export interface AIServiceConfig<TInput, TResult> {
  feature: AiFeature;
  systemPrompt: string;
  buildUserPrompt: (input: TInput) => string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Marca o tipo de resultado para inferência (não usado em runtime). */
  __resultType?: TResult;
}

export interface AIRouteConfig<TInput, TResult> {
  service: (input: TInput, userId?: string) => Promise<TResult>;
  schema: ZodSchema<TInput>;
  feature: AiFeature;
  rateLimit?: { max: number; windowMs: number };
  errorMessage?: string;
}

export interface UseAIGeneratorConfig {
  endpoint: string;
  errorMessage: string;
}
