import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { getBudgetSettings } from "./settings";
import { computePeriod } from "./period";
import { priceUsage } from "./pricing";
import type { BudgetCheckResult } from "./types";

/**
 * Verifica se o usuário tem saldo para uma nova chamada de IA.
 * Admin sempre passa. Server-only.
 */
export async function checkBudget(userId: string): Promise<BudgetCheckResult> {
  const supabase = await createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, ai_budget_brl")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { allowed: true, limitBrl: Infinity, usedBrl: 0 };
  }

  const settings = await getBudgetSettings();
  const { start: periodStart, end: periodEnd } = computePeriod(settings.resetPeriod);

  const { data: budget } = await supabase
    .from("ai_budgets")
    .select("cost_brl, bonus_brl, period_end")
    .eq("user_id", userId)
    .eq("period_start", periodStart.toISOString())
    .maybeSingle();

  const usedBrl = Number(budget?.cost_brl ?? 0);
  const bonusBrl = Number(budget?.bonus_brl ?? 0);
  const userLimit = profile?.ai_budget_brl ?? settings.defaultBudgetBrl;
  const limitBrl = Number(userLimit) + bonusBrl;

  if (usedBrl >= limitBrl) {
    const resetAt = budget?.period_end ? new Date(budget.period_end) : periodEnd;
    return {
      allowed: false,
      reason: `Limite de IA atingido. Renova em ${resetAt.toLocaleDateString("pt-BR")}.`,
      resetAt,
      limitBrl,
      usedBrl,
    };
  }

  return { allowed: true, limitBrl, usedBrl };
}

export interface DebitUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Adiciona o custo de uma chamada de IA à wallet do usuário na janela corrente.
 * Fire-and-forget — chamado depois da resposta. Server-only.
 */
export async function debitBudget(
  userId: string,
  usage: DebitUsage,
  model: string,
): Promise<void> {
  if (usage.totalTokens <= 0) return;

  const settings = await getBudgetSettings();
  const { start: periodStart, end: periodEnd } = computePeriod(settings.resetPeriod);

  const costBrl = priceUsage(
    model,
    usage.promptTokens,
    usage.completionTokens,
    settings.pricing,
    settings.usdToBrl,
  );

  const supabase = await createServiceClient();

  const { data: existing } = await supabase
    .from("ai_budgets")
    .select("id, tokens_used, cost_brl")
    .eq("user_id", userId)
    .eq("period_start", periodStart.toISOString())
    .maybeSingle();

  if (existing) {
    await supabase
      .from("ai_budgets")
      .update({
        tokens_used: Number(existing.tokens_used) + usage.totalTokens,
        cost_brl: Number(existing.cost_brl) + costBrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("ai_budgets").upsert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tokens_used: usage.totalTokens,
      cost_brl: costBrl,
      bonus_brl: 0,
    });
  }
}
