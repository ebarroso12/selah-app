import { describe, it, expect, vi, beforeEach } from "vitest";

const profilesMaybeSingle = vi.fn();
const budgetsMaybeSingle = vi.fn();

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve({
    from: (table: string) => {
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ maybeSingle: profilesMaybeSingle }) }) };
      }
      if (table === "ai_budgets") {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: budgetsMaybeSingle }) }) }) };
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

import { checkBudget } from "@/shared/services/ai-budget/budget.service";

describe("checkBudget", () => {
  beforeEach(() => {
    profilesMaybeSingle.mockReset();
    budgetsMaybeSingle.mockReset();
  });

  it("admin sempre passa sem consultar ai_budgets", async () => {
    profilesMaybeSingle.mockResolvedValue({ data: { role: "admin", ai_budget_brl: null }, error: null });
    const result = await checkBudget("admin-user");
    expect(result.allowed).toBe(true);
    expect(budgetsMaybeSingle).not.toHaveBeenCalled();
  });

  it("usuário sem row em ai_budgets passa com saldo zero", async () => {
    profilesMaybeSingle.mockResolvedValue({ data: { role: "user", ai_budget_brl: null }, error: null });
    budgetsMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await checkBudget("user-1");
    expect(result.allowed).toBe(true);
    expect(result.usedBrl).toBe(0);
    expect(result.limitBrl).toBe(5);
  });

  it("usuário abaixo do limite passa", async () => {
    profilesMaybeSingle.mockResolvedValue({ data: { role: "user", ai_budget_brl: null }, error: null });
    budgetsMaybeSingle.mockResolvedValue({
      data: { cost_brl: 2.00, bonus_brl: 0, period_end: "2026-06-01T02:59:59.999Z" },
      error: null,
    });
    const result = await checkBudget("user-1");
    expect(result.allowed).toBe(true);
    expect(result.usedBrl).toBe(2);
  });

  it("usuário no limite é bloqueado", async () => {
    profilesMaybeSingle.mockResolvedValue({ data: { role: "user", ai_budget_brl: null }, error: null });
    budgetsMaybeSingle.mockResolvedValue({
      data: { cost_brl: 5.00, bonus_brl: 0, period_end: "2026-06-01T02:59:59.999Z" },
      error: null,
    });
    const result = await checkBudget("user-1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Limite");
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it("bonus_brl soma ao limite", async () => {
    profilesMaybeSingle.mockResolvedValue({ data: { role: "user", ai_budget_brl: null }, error: null });
    budgetsMaybeSingle.mockResolvedValue({
      data: { cost_brl: 5.00, bonus_brl: 3.00, period_end: "2026-06-01T02:59:59.999Z" },
      error: null,
    });
    const result = await checkBudget("user-1");
    expect(result.allowed).toBe(true);
    expect(result.limitBrl).toBe(8);
  });

  it("override individual prevalece sobre default", async () => {
    profilesMaybeSingle.mockResolvedValue({ data: { role: "user", ai_budget_brl: 10.00 }, error: null });
    budgetsMaybeSingle.mockResolvedValue({
      data: { cost_brl: 7.00, bonus_brl: 0, period_end: "2026-06-01T02:59:59.999Z" },
      error: null,
    });
    const result = await checkBudget("user-1");
    expect(result.allowed).toBe(true);
    expect(result.limitBrl).toBe(10);
  });
});
