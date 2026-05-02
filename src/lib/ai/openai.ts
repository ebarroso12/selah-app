/**
 * Helper para chamar a API OpenAI via fetch nativo.
 * Não requer instalação do SDK openai — usa apenas a variável OPENAI_API_KEY.
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIResult {
  content: string;
  usage: OpenAIUsage | null;
  model: string;
}

/** Retorna texto + dados de uso de tokens */
export async function callOpenAIFull(
  messages: OpenAIMessage[],
  options: OpenAIOptions = {}
): Promise<OpenAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY n\u00e3o configurada");
  const { model = "gpt-4o-mini", temperature = 0.7, max_tokens = 2048, response_format } = options;
  const body: Record<string, unknown> = { model, messages, temperature, max_tokens };
  if (response_format) body.response_format = response_format;
  const res = await fetch(
    (process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1") + "/chat/completions",
    { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`OpenAI API error ${res.status}: ${err}`); }
  const data = await res.json();
  return { content: data.choices?.[0]?.message?.content ?? "", usage: data.usage ?? null, model: data.model ?? model };
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  options: OpenAIOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada");
  }

  const {
    model = "gpt-4o-mini",
    temperature = 0.7,
    max_tokens = 2048,
    response_format,
  } = options;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens,
  };

  if (response_format) {
    body.response_format = response_format;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
