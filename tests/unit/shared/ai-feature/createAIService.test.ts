/**
 * createAIService.test.ts
 * Kit compartilhado de IA bíblica — factory de services.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateAI = vi.fn();

vi.mock("@/shared/services/ai/ai.service", () => ({
  generateAI: (...args: unknown[]) => mockGenerateAI(...args),
}));

import { createAIService } from "@/shared/ai-feature/createAIService";

interface FakeInput {
  texto: string;
}
interface FakeResult {
  titulo: string;
}

describe("createAIService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateAI.mockResolvedValue({
      content: JSON.stringify({ titulo: "ok" }),
      usage: null,
      model: "gpt-4o-mini",
      durationMs: 0,
    });
  });

  it("chama generateAI com mensagens system + user corretas", async () => {
    const service = createAIService<FakeInput, FakeResult>({
      feature: "estudo",
      systemPrompt: "SYS",
      buildUserPrompt: (input) => `prompt:${input.texto}`,
    });

    await service({ texto: "hello" }, "user-1");

    const opts = mockGenerateAI.mock.calls[0][0];
    expect(opts.messages).toEqual([
      { role: "system", content: "SYS" },
      { role: "user", content: "prompt:hello" },
    ]);
  });

  it("usa o feature configurado", async () => {
    const service = createAIService<FakeInput, FakeResult>({
      feature: "teologia",
      systemPrompt: "SYS",
      buildUserPrompt: () => "p",
    });
    await service({ texto: "x" });
    expect(mockGenerateAI.mock.calls[0][0].feature).toBe("teologia");
  });

  it("aplica defaults (model gpt-4o-mini, maxTokens 3000, temperature 0.5)", async () => {
    const service = createAIService<FakeInput, FakeResult>({
      feature: "estudo",
      systemPrompt: "SYS",
      buildUserPrompt: () => "p",
    });
    await service({ texto: "x" });
    const opts = mockGenerateAI.mock.calls[0][0];
    expect(opts.model).toBe("gpt-4o-mini");
    expect(opts.maxTokens).toBe(3000);
    expect(opts.temperature).toBe(0.5);
    expect(opts.responseFormat).toBe("json_object");
  });

  it("permite override de model, maxTokens e temperature", async () => {
    const service = createAIService<FakeInput, FakeResult>({
      feature: "estudo",
      systemPrompt: "SYS",
      buildUserPrompt: () => "p",
      model: "gpt-4o",
      maxTokens: 1000,
      temperature: 0.9,
    });
    await service({ texto: "x" });
    const opts = mockGenerateAI.mock.calls[0][0];
    expect(opts.model).toBe("gpt-4o");
    expect(opts.maxTokens).toBe(1000);
    expect(opts.temperature).toBe(0.9);
  });

  it("faz JSON.parse do content e retorna como TResult", async () => {
    mockGenerateAI.mockResolvedValue({
      content: JSON.stringify({ titulo: "Guia" }),
      usage: null,
      model: "gpt-4o-mini",
      durationMs: 0,
    });
    const service = createAIService<FakeInput, FakeResult>({
      feature: "estudo",
      systemPrompt: "SYS",
      buildUserPrompt: () => "p",
    });
    const out = await service({ texto: "x" });
    expect(out).toEqual({ titulo: "Guia" });
  });

  it("retorna objeto vazio quando content é string vazia", async () => {
    mockGenerateAI.mockResolvedValue({
      content: "",
      usage: null,
      model: "gpt-4o-mini",
      durationMs: 0,
    });
    const service = createAIService<FakeInput, FakeResult>({
      feature: "estudo",
      systemPrompt: "SYS",
      buildUserPrompt: () => "p",
    });
    const out = await service({ texto: "x" });
    expect(out).toEqual({});
  });

  it("passa o userId para generateAI", async () => {
    const service = createAIService<FakeInput, FakeResult>({
      feature: "estudo",
      systemPrompt: "SYS",
      buildUserPrompt: () => "p",
    });
    await service({ texto: "x" }, "user-42");
    expect(mockGenerateAI.mock.calls[0][0].userId).toBe("user-42");
  });
});
