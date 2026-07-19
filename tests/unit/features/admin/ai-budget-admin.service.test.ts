import { describe, it, expect, vi, beforeEach } from "vitest";

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve({ from: fromMock })),
}));

vi.mock("@/shared/services/ai-budget", () => ({
  getBudgetSettings: vi.fn().mockResolvedValue({
    defaultBudgetBrl: 5,
    resetPeriod: "monthly",
    usdToBrl: 5.2,
    pricing: { "gpt-4o-mini": { input: 0.15, output: 0.60 } },
  }),
  computePeriod: vi.fn().mockReturnValue({
    start: new Date("2026-05-01T03:00:00.000Z"),
    end: new Date("2026-06-01T02:59:59.999Z"),
  }),
}));

import { aiBudgetAdminService } from "@/features/admin/services/ai-budget-admin.service";

describe("aiBudgetAdminService", () => {
  beforeEach(() => fromMock.mockReset());

  it("listUserBudgets retorna usuários com saldo zerado quando não há row em ai_budgets", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({ order: () => Promise.resolve({
            data: [{ id: "u1", full_name: "Yuri", email: "y@x.com", ai_budget_brl: null, role: "user" }],
            error: null,
          }) }),
        };
      }
      if (table === "ai_budgets") {
        return {
          select: () => ({ gte: () => Promise.resolve({ data: [], error: null }) }),
        };
      }
      // Fallback para chamadas internas do sistema de mock
      return {
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    });

    const rows = await aiBudgetAdminService.listUserBudgets();
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe("u1");
    expect(rows[0].costBrl).toBe(0);
    expect(rows[0].limitBrl).toBe(5);
  });

  it("setUserLimit faz UPDATE em profiles.ai_budget_brl", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({
      update: () => ({ eq: eqMock }),
    });
    await aiBudgetAdminService.setUserLimit("u1", 10.50);
    expect(eqMock).toHaveBeenCalledWith("id", "u1");
  });

  it("setUserLimit rejeita valor negativo", async () => {
    await expect(aiBudgetAdminService.setUserLimit("u1", -5)).rejects.toThrow();
  });

  it("addBonus rejeita valor ≤ 0", async () => {
    await expect(aiBudgetAdminService.addBonus("u1", 0)).rejects.toThrow();
    await expect(aiBudgetAdminService.addBonus("u1", -5)).rejects.toThrow();
  });

  it("resetUserBudget zera tokens_used, cost_brl e bonus_brl", async () => {
    const updateMock = vi.fn().mockReturnValue({
      eq: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    });
    fromMock.mockReturnValue({ update: updateMock });
    await aiBudgetAdminService.resetUserBudget("u1");
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      tokens_used: 0,
      cost_brl: 0,
      bonus_brl: 0,
    }));
  });
});
