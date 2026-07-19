import type { AIMessage, AIProviderResult } from "./ai.service";

const BASE_URL = process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1";

export async function callOpenAI(
  messages: AIMessage[],
  model: string,
  temperature: number,
  maxTokens: number,
  responseFormat?: "json_object" | "text"
): Promise<AIProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada");

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const usage = data.usage
    ? {
        promptTokens: data.usage.prompt_tokens as number,
        completionTokens: data.usage.completion_tokens as number,
        totalTokens: data.usage.total_tokens as number,
      }
    : null;

  return { content, usage, model: data.model ?? model };
}
