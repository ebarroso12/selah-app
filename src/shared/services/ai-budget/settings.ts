import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import type { BudgetSettings, BudgetPeriod, PricingTable } from "./types";

const CACHE_TTL_MS = 30_000;
const KEYS = ["ai_default_budget_brl", "ai_reset_period", "ai_usd_to_brl", "ai_pricing_usd"];

let cache: { value: BudgetSettings; expiresAt: number } | null = null;

/**
 * Carrega configurações de orçamento (app_settings) com cache TTL 30s.
 * Server-only.
 */
export async function getBudgetSettings(): Promise<BudgetSettings> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", KEYS);

  if (error) {
    console.error("[ai-budget/settings] Erro ao ler app_settings:", error);
  }

  const map = new Map((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));

  const settings: BudgetSettings = {
    defaultBudgetBrl: parseFloat(map.get("ai_default_budget_brl") ?? "0"),
    resetPeriod: (map.get("ai_reset_period") as BudgetPeriod) ?? "monthly",
    usdToBrl: parseFloat(map.get("ai_usd_to_brl") ?? "1"),
    pricing: parsePricing(map.get("ai_pricing_usd")),
  };

  cache = { value: settings, expiresAt: now + CACHE_TTL_MS };
  return settings;
}

function parsePricing(raw: string | undefined): PricingTable {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PricingTable;
  } catch {
    console.error("[ai-budget/settings] ai_pricing_usd não é JSON válido");
    return {};
  }
}

/** Apenas para testes — limpa o cache estático. */
export function _resetSettingsCacheForTests(): void {
  cache = null;
}
