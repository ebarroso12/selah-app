/**
 * Task 3.2 — AI Service Layer
 * Mockamos os providers diretamente (não o SDK), isolando o ai.service.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mocks dos providers ───────────────────────────────────────────────────────

vi.mock("@/shared/services/ai/openai.provider", () => ({
  callOpenAI: vi.fn().mockResolvedValue({
    content: "Resposta do OpenAI",
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    model: "gpt-4o-mini",
  }),
}));


vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  }),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Task 3.2 — AI Service Layer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("generateAI com provider openai retorna content correto", async () => {
    const { generateAI } = await import("@/shared/services/ai/ai.service");
    const result = await generateAI({

      model: "gpt-4o-mini",
      feature: "kairo",
      messages: [{ role: "user", content: "Olá" }],
    });

    expect(result.content).toBe("Resposta do OpenAI");
    expect(result.usage?.totalTokens).toBe(150);
    expect(result.durationMs).toBeTypeOf("number");
  });

  it("generateAI dispara tracking quando userId fornecido", async () => {
    const { generateAI } = await import("@/shared/services/ai/ai.service");
    const { createServiceClient } = await import(
      "@/shared/services/supabase/supabase.server"
    );

    await generateAI({

      model: "gpt-4o-mini",
      feature: "estudo",
      messages: [{ role: "user", content: "teste" }],
      userId: "user-123",
    });

    // Aguarda fire-and-forget
    await new Promise((r) => setTimeout(r, 50));
    expect(createServiceClient).toHaveBeenCalled();
  });

  it("generateAI sem userId não dispara tracking", async () => {
    const { generateAI } = await import("@/shared/services/ai/ai.service");
    const { createServiceClient } = await import(
      "@/shared/services/supabase/supabase.server"
    );
    vi.clearAllMocks();

    await generateAI({

      model: "gpt-4o-mini",
      feature: "biblia_busca",
      messages: [{ role: "user", content: "teste" }],
      // sem userId
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(createServiceClient).not.toHaveBeenCalled();
  });
});
