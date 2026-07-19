import { describe, it, expect } from "vitest";
import { priceUsage } from "@/shared/services/ai-budget/pricing";
import type { PricingTable } from "@/shared/services/ai-budget/types";

const PRICING: PricingTable = {
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4o": { input: 2.50, output: 10.00 },
};
const RATE = 5.20;

describe("priceUsage", () => {
  it("calcula custo input em BRL", () => {
    expect(priceUsage("gpt-4o-mini", 1_000_000, 0, PRICING, RATE)).toBeCloseTo(0.78, 4);
  });

  it("soma input e output", () => {
    expect(priceUsage("gpt-4o-mini", 100_000, 100_000, PRICING, RATE)).toBeCloseTo(0.39, 4);
  });

  it("usa preços do modelo certo", () => {
    expect(priceUsage("gpt-4o", 1_000_000, 0, PRICING, RATE)).toBeCloseTo(13.00, 4);
  });

  it("retorna 0 quando modelo não está na tabela", () => {
    expect(priceUsage("inexistente", 100_000, 100_000, PRICING, RATE)).toBe(0);
  });

  it("converte com taxa configurada", () => {
    expect(priceUsage("gpt-4o-mini", 1_000_000, 0, PRICING, 6.00)).toBeCloseTo(0.90, 4);
  });

  it("retorna 0 quando ambos tokens são 0", () => {
    expect(priceUsage("gpt-4o-mini", 0, 0, PRICING, RATE)).toBe(0);
  });
});
