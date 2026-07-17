import { describe, it, expect, vi, beforeEach } from "vitest";

const budgetsSelectMaybeSingle = vi.fn();
const budgetsUpdateEq = vi.fn();
const budgetsUpsert = vi.fn();

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve({
    from: (table: string) => {
      if (table === "ai_budgets") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({ maybeSingle: budgetsSelectMaybeSingle }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: budgetsUpdateEq }),
          upsert: budgetsUpsert,
        };
      }
      throw new Error(`Tabela não mockada: ${table}`);
    },
  })),
}));

vi.mock("@/shared/services/ai-budget/settings", () => ({
  getBudgetSettings: vi.fn().mockResolvedValue({
    defaultBudgetBrl: 5.00,
    resetPeriod: "monthly",
    usdToBrl: 5.20,
    pricing: { "gpt-4o-mini": { input: 0.15, output: 0.60 } },
  }),
}));

import { debitBudget } from "@/shared/services/ai-budget/budget.service";

describe("debitBudget", () => {
  beforeEach(() => {
    budgetsSelectMaybeSingle.mockReset();
    budgetsUpdateEq.mockReset();
    budgetsUpsert.mockReset();
    budgetsUpdateEq.mockResolvedValue({ error: null });
    budgetsUpsert.mockResolvedValue({ error: null });
  });

  it("cria nova row se não existir", async () => {
    budgetsSelectMaybeSingle.mockResolvedValue({ data: null, error: null });
    await debitBudget("user-1", { promptTokens: 1000, completionTokens: 500, totalTokens: 1500 }, "gpt-4o-mini");

    expect(budgetsUpsert).toHaveBeenCalledTimes(1);
    const args = budgetsUpsert.mock.calls[0][0];
    expect(args.user_id).toBe("user-1");
    expect(args.tokens_used).toBe(1500);
    // 1000 * 0.15 / 1M + 500 * 0.60 / 1M = 0.00045 USD × 5.20 = 0.00234 BRL
    expect(Number(args.cost_brl)).toBeCloseTo(0.00234, 5);
  });

  it("incrementa row existente", async () => {
    budgetsSelectMaybeSingle.mockResolvedValue({
      data: { id: "b1", tokens_used: 1000, cost_brl: 0.50 },
      error: null,
    });
    await debitBudget("user-1", { promptTokens: 1000, completionTokens: 0, totalTokens: 1000 }, "gpt-4o-mini");

    // update foi chamado, não upsert
    expect(budgetsUpsert).not.toHaveBeenCalled();
    expect(budgetsUpdateEq).toHaveBeenCalledWith("id", "b1");
  });

  it("não faz nada se totalTokens é 0", async () => {
    await debitBudget("user-1", { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, "gpt-4o-mini");
    expect(budgetsSelectMaybeSingle).not.toHaveBeenCalled();
    expect(budgetsUpsert).not.toHaveBeenCalled();
    expect(budgetsUpdateEq).not.toHaveBeenCalled();
  });
});
