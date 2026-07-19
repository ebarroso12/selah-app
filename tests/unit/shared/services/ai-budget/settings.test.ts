import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const supabaseFromMock = vi.fn();

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve({ from: supabaseFromMock })),
}));

import { getBudgetSettings, _resetSettingsCacheForTests } from "@/shared/services/ai-budget/settings";

describe("getBudgetSettings", () => {
  beforeEach(() => {
    _resetSettingsCacheForTests();
    supabaseFromMock.mockReset();
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            { key: "ai_default_budget_brl", value: "5.00" },
            { key: "ai_reset_period", value: "monthly" },
            { key: "ai_usd_to_brl", value: "5.20" },
            { key: "ai_pricing_usd", value: '{"gpt-4o-mini":{"input":0.15,"output":0.60}}' },
          ],
          error: null,
        }),
      }),
    });
  });

  afterEach(() => { _resetSettingsCacheForTests(); });

  it("retorna os 4 settings parseados", async () => {
    const s = await getBudgetSettings();
    expect(s.defaultBudgetBrl).toBe(5);
    expect(s.resetPeriod).toBe("monthly");
    expect(s.usdToBrl).toBe(5.2);
    expect(s.pricing["gpt-4o-mini"]).toEqual({ input: 0.15, output: 0.60 });
  });

  it("cacheia — 2ª chamada não consulta banco", async () => {
    await getBudgetSettings();
    await getBudgetSettings();
    expect(supabaseFromMock).toHaveBeenCalledTimes(1);
  });

  it("aplica defaults seguros quando chave ausente", async () => {
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    const s = await getBudgetSettings();
    expect(s.defaultBudgetBrl).toBe(0);
    expect(s.resetPeriod).toBe("monthly");
    expect(s.usdToBrl).toBe(1);
    expect(s.pricing).toEqual({});
  });
});
