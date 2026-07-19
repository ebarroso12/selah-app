import { describe, it, expect } from "vitest";
import { AppError, BudgetExceededError } from "@/shared/lib/errors";

describe("BudgetExceededError", () => {
  it("é uma AppError com status 402 e code BUDGET_EXCEEDED", () => {
    const reset = new Date("2026-06-01T03:00:00.000Z");
    const err = new BudgetExceededError("Limite atingido", reset);
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(402);
    expect(err.code).toBe("BUDGET_EXCEEDED");
    expect(err.message).toBe("Limite atingido");
    expect(err.resetAt).toBe(reset);
  });

  it("usa mensagem default quando não fornecida", () => {
    const reset = new Date("2026-06-01T03:00:00.000Z");
    const err = new BudgetExceededError(undefined, reset);
    expect(err.message).toBe("Limite de IA atingido");
  });
});
