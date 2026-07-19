/**
 * Task 5.3 — Kairo Service (server-side)
 * Centraliza a chamada ao LLM via ai.service, incluindo o system prompt.
 */
import { generateAI, type AIMessage } from "@/shared/services/ai/ai.service";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { KAIRO_SYSTEM_PROMPT } from "../prompts/kairo.system";

export interface KairoMessage {
  role: "user" | "assistant";
  content: string;
}

export interface KairoSendResult {
  reply: string;
}

async function getSystemPrompt(): Promise<string> {
  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "kairo_system_prompt")
      .maybeSingle();
    return data?.value ?? KAIRO_SYSTEM_PROMPT;
  } catch {
    return KAIRO_SYSTEM_PROMPT;
  }
}

/**
 * Envia o histórico de mensagens para o LLM e retorna a resposta do KAIRO.
 * Deve ser chamado apenas em contexto de servidor (route handlers).
 *
 * @param messages  Histórico recente (últimas 20 mensagens para limitar tokens)
 * @param userId    ID do usuário autenticado — usado para tracking
 */
export async function sendMessage(
  messages: KairoMessage[],
  userId?: string,
): Promise<KairoSendResult> {
  // Limitar histórico para evitar tokens excessivos
  const recentMessages = messages.slice(-20);
  const systemPrompt = await getSystemPrompt();

  const aiMessages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    ...recentMessages,
  ];

  const { content } = await generateAI({
    provider: "openai",
    model: "gpt-4o-mini",
    feature: "kairo",
    messages: aiMessages,
    maxTokens: 1200,
    temperature: 0.75,
    userId,
    section: "kairo",
  });

  return { reply: content };
}
