import { describe, it, expect, vi, beforeEach } from "vitest";

const { checkBudgetMock, debitBudgetMock } = vi.hoisted(() => ({
  checkBudgetMock: vi.fn(),
  debitBudgetMock: vi.fn(),
}));

vi.mock("@/shared/services/ai-budget", () => ({
  checkBudget: checkBudgetMock,
  debitBudget: debitBudgetMock,
}));

vi.mock("@/shared/services/ai/openai.provider", () => ({
  callOpenAI: vi.fn().mockResolvedValue({
    content: "resposta",
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    model: "gpt-4o-mini",
  }),
}));

vi.mock("@/shared/services/ai/tracking", () => ({
  trackAiUsage: vi.fn(),
  trackSectionInteraction: vi.fn(),
}));

import { generateAI } from "@/shared/services/ai/ai.service";
import { BudgetExceededError } from "@/shared/lib/errors";

describe("generateAI + budget integration", () => {
  beforeEach(() => {
    checkBudgetMock.mockReset();
    debitBudgetMock.mockReset();
  });

  it("permite a chamada quando allowed=true", async () => {
    checkBudgetMock.mockResolvedValue({ allowed: true });
    const result = await generateAI({
      model: "gpt-4o-mini",
      feature: "estudo",
      messages: [{ role: "user", content: "oi" }],
      userId: "user-1",
    });
    expect(result.content).toBe("resposta");
    expect(checkBudgetMock).toHaveBeenCalledWith("user-1");
  });

  it("lança BudgetExceededError quando allowed=false", async () => {
    const resetAt = new Date("2026-06-01T03:00:00.000Z");
    checkBudgetMock.mockResolvedValue({
      allowed: false,
      reason: "Limite atingido",
      resetAt,
    });

    await expect(
      generateAI({
        model: "gpt-4o-mini",
        feature: "estudo",
        messages: [{ role: "user", content: "oi" }],
        userId: "user-1",
      }),
    ).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it("não chama checkBudget quando userId não é fornecido", async () => {
    await generateAI({
      model: "gpt-4o-mini",
      feature: "estudo",
      messages: [{ role: "user", content: "oi" }],
    });
    expect(checkBudgetMock).not.toHaveBeenCalled();
  });

  it("chama debitBudget após sucesso quando userId existe", async () => {
    checkBudgetMock.mockResolvedValue({ allowed: true });
    await generateAI({
      model: "gpt-4o-mini",
      feature: "estudo",
      messages: [{ role: "user", content: "oi" }],
      userId: "user-1",
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(debitBudgetMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ totalTokens: 15 }),
      "gpt-4o-mini",
    );
  });
});
