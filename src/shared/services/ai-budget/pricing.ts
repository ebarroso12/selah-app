import type { PricingTable } from "./types";

/**
 * Calcula o custo em BRL de uma chamada à OpenAI.
 * Retorna 0 se o modelo não está na tabela.
 */
export function priceUsage(
  model: string,
  prompt: number,
  completion: number,
  pricing: PricingTable,
  usdToBrl: number,
): number {
  const modelPricing = pricing[model];
  if (!modelPricing) {
    console.warn(`[ai-budget/pricing] Modelo "${model}" não encontrado na tabela de preços. Custo computado como 0.`);
    return 0;
  }

  const inputCostUsd = (prompt / 1_000_000) * modelPricing.input;
  const outputCostUsd = (completion / 1_000_000) * modelPricing.output;
  return (inputCostUsd + outputCostUsd) * usdToBrl;
}
