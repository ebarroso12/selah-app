import type { BudgetPeriod } from "./period";

export type { BudgetPeriod };

export interface ModelPricing {
  /** USD por 1 milhão de tokens de input */
  input: number;
  /** USD por 1 milhão de tokens de output */
  output: number;
}

export type PricingTable = Record<string, ModelPricing>;

export interface BudgetSettings {
  defaultBudgetBrl: number;
  resetPeriod: BudgetPeriod;
  usdToBrl: number;
  pricing: PricingTable;
}

export interface BudgetState {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  tokensUsed: number;
  costBrl: number;
  bonusBrl: number;
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  resetAt?: Date;
  limitBrl: number;
  usedBrl: number;
}
