import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { getBudgetSettings, computePeriod } from "@/shared/services/ai-budget";
import { ValidationError } from "@/shared/lib/errors";

export interface UserBudgetRow {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  limitBrl: number;
  bonusBrl: number;
  tokensUsed: number;
  costBrl: number;
  pctUsed: number;
  status: "ok" | "warn" | "blocked";
}

export interface OverviewStats {
  totalTokens: number;
  totalCostBrl: number;
  activeUsers: number;
  totalUsers: number;
  topUser: { userId: string; fullName: string; costBrl: number } | null;
  periodStart: string;
  periodEnd: string;
}

export const aiBudgetAdminService = {
  async listUserBudgets(): Promise<UserBudgetRow[]> {
    const supabase = await createServiceClient();
    const settings = await getBudgetSettings();
    const { start } = computePeriod(settings.resetPeriod);

    const [{ data: profiles }, { data: budgets }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role, ai_budget_brl").order("full_name"),
      supabase.from("ai_budgets").select("user_id, tokens_used, cost_brl, bonus_brl").gte("period_start", start.toISOString()),
    ]);

    const budgetMap = new Map((budgets ?? []).map((b: { user_id: string }) => [b.user_id, b]));

    return (profiles ?? []).map((p: {
      id: string; full_name: string | null; email: string | null; role: string | null; ai_budget_brl: number | null;
    }) => {
      const b = budgetMap.get(p.id) as { tokens_used?: number; cost_brl?: number; bonus_brl?: number } | undefined;
      const limitBrl = p.ai_budget_brl ?? settings.defaultBudgetBrl;
      const bonusBrl = Number(b?.bonus_brl ?? 0);
      const effectiveLimit = Number(limitBrl) + bonusBrl;
      const costBrl = Number(b?.cost_brl ?? 0);
      const pct = effectiveLimit > 0 ? (costBrl / effectiveLimit) * 100 : 0;
      return {
        userId: p.id,
        fullName: p.full_name ?? "—",
        email: p.email ?? "",
        role: p.role ?? "user",
        limitBrl: Number(limitBrl),
        bonusBrl,
        tokensUsed: Number(b?.tokens_used ?? 0),
        costBrl,
        pctUsed: pct,
        status: pct >= 100 ? "blocked" : pct >= 80 ? "warn" : "ok",
      };
    });
  },

  async getOverviewStats(): Promise<OverviewStats> {
    const supabase = await createServiceClient();
    const settings = await getBudgetSettings();
    const { start, end } = computePeriod(settings.resetPeriod);

    const { data: budgets } = await supabase
      .from("ai_budgets")
      .select("user_id, tokens_used, cost_brl, profiles(full_name)")
      .gte("period_start", start.toISOString());

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const rows = (budgets ?? []) as Array<{
      user_id: string;
      tokens_used: number;
      cost_brl: number;
      profiles?: { full_name?: string | null } | null;
    }>;
    const totalTokens = rows.reduce((s, r) => s + Number(r.tokens_used ?? 0), 0);
    const totalCostBrl = rows.reduce((s, r) => s + Number(r.cost_brl ?? 0), 0);
    const top = [...rows].sort((a, b) => Number(b.cost_brl) - Number(a.cost_brl))[0];

    return {
      totalTokens,
      totalCostBrl,
      activeUsers: rows.length,
      totalUsers: totalUsers ?? 0,
      topUser: top ? {
        userId: top.user_id,
        fullName: top.profiles?.full_name ?? "—",
        costBrl: Number(top.cost_brl),
      } : null,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
  },

  async setUserLimit(userId: string, limitBrl: number | null): Promise<void> {
    if (limitBrl !== null && limitBrl < 0) {
      throw new ValidationError("Limite não pode ser negativo");
    }
    const supabase = await createServiceClient();
    const { error } = await supabase.from("profiles").update({ ai_budget_brl: limitBrl }).eq("id", userId);
    if (error) throw new Error(error.message);
  },

  async addBonus(userId: string, amountBrl: number): Promise<void> {
    if (amountBrl <= 0) throw new ValidationError("Bonus deve ser maior que zero");

    const supabase = await createServiceClient();
    const settings = await getBudgetSettings();
    const { start: periodStart, end: periodEnd } = computePeriod(settings.resetPeriod);

    const { data: existing } = await supabase
      .from("ai_budgets")
      .select("id, bonus_brl")
      .eq("user_id", userId)
      .eq("period_start", periodStart.toISOString())
      .maybeSingle();

    if (existing) {
      await supabase
        .from("ai_budgets")
        .update({
          bonus_brl: Number(existing.bonus_brl) + amountBrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("ai_budgets").insert({
        user_id: userId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        tokens_used: 0,
        cost_brl: 0,
        bonus_brl: amountBrl,
      });
    }
  },

  async resetUserBudget(userId: string): Promise<void> {
    const supabase = await createServiceClient();
    const settings = await getBudgetSettings();
    const { start: periodStart } = computePeriod(settings.resetPeriod);

    await supabase
      .from("ai_budgets")
      .update({
        tokens_used: 0,
        cost_brl: 0,
        bonus_brl: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("period_start", periodStart.toISOString());
  },

  async updateSettings(partial: Partial<{
    defaultBudgetBrl: number;
    resetPeriod: "monthly" | "weekly";
    usdToBrl: number;
    pricing: Record<string, { input: number; output: number }>;
  }>): Promise<void> {
    const supabase = await createServiceClient();
    const updates: Array<{ key: string; value: string }> = [];

    if (partial.defaultBudgetBrl !== undefined) updates.push({ key: "ai_default_budget_brl", value: String(partial.defaultBudgetBrl) });
    if (partial.resetPeriod !== undefined) updates.push({ key: "ai_reset_period", value: partial.resetPeriod });
    if (partial.usdToBrl !== undefined) updates.push({ key: "ai_usd_to_brl", value: String(partial.usdToBrl) });
    if (partial.pricing !== undefined) updates.push({ key: "ai_pricing_usd", value: JSON.stringify(partial.pricing) });

    for (const u of updates) {
      await supabase.from("app_settings").upsert({ ...u, updated_at: new Date().toISOString() });
    }
  },
};
