import type { AiFeature } from "@/types/database";
import { callOpenAI } from "./openai.provider";
import { trackAiUsage, type TrackableSection, trackSectionInteraction } from "./tracking";
import { checkBudget, debitBudget } from "@/shared/services/ai-budget";
import { BudgetExceededError } from "@/shared/lib/errors";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProviderResult {
  content: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
  model: string;
}

export interface AIGenerateOpts {
  /** @deprecated Anthropic removido — sempre usa OpenAI. Campo ignorado. */
  provider?: string;
  model: string;
  feature: AiFeature;
  messages: AIMessage[];
  userId?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json_object" | "text";
  /** Se fornecido, também incrementa user_metrics para a seção */
  section?: TrackableSection;
}

export interface AIGenerateResult {
  content: string;
  usage: AIProviderResult["usage"];
  model: string;
  durationMs: number;
}

/**
 * Chama o provider configurado, mede duração, dispara tracking e
 * aplica controle de orçamento (check antes / debit depois).
 */
export async function generateAI(opts: AIGenerateOpts): Promise<AIGenerateResult> {
  const {
    model,
    feature,
    messages,
    userId,
    temperature = 0.7,
    maxTokens = 2048,
    responseFormat,
    section,
  } = opts;

  // CHECK orçamento (bloqueante) — apenas para usuários identificados
  if (userId) {
    const check = await checkBudget(userId);
    if (!check.allowed) {
      throw new BudgetExceededError(check.reason, check.resetAt ?? new Date());
    }
  }

  const start = Date.now();
  const result = await callOpenAI(messages, model, temperature, maxTokens, responseFormat);
  const durationMs = Date.now() - start;

  // DEBIT orçamento (fire-and-forget) + tracking
  if (userId && result.usage) {
    void debitBudget(userId, result.usage, result.model);
    void trackAiUsage({
      userId,
      feature,
      provider: "openai",
      model: result.model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      durationMs,
    });
  }

  if (userId && section) {
    void trackSectionInteraction(userId, section);
  }

  return { content: result.content, usage: result.usage, model: result.model, durationMs };
}
