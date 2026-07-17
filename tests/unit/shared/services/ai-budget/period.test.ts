import { describe, it, expect } from "vitest";
import { computePeriod } from "@/shared/services/ai-budget/period";

describe("computePeriod", () => {
  it("monthly: retorna 1º dia 00:00 BRT até último dia 23:59:59.999 BRT", () => {
    const date = new Date("2026-05-13T15:30:00.000Z");
    const { start, end } = computePeriod("monthly", date);
    expect(start.toISOString()).toBe("2026-05-01T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-06-01T02:59:59.999Z");
  });

  it("monthly: vira o mês quando estamos no último dia", () => {
    const date = new Date("2026-05-31T23:00:00.000Z");
    const { start, end } = computePeriod("monthly", date);
    expect(start.toISOString()).toBe("2026-05-01T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-06-01T02:59:59.999Z");
  });

  it("weekly: retorna segunda 00:00 BRT até domingo 23:59:59.999 BRT", () => {
    const date = new Date("2026-05-13T15:30:00.000Z");
    const { start, end } = computePeriod("weekly", date);
    expect(start.toISOString()).toBe("2026-05-11T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-05-18T02:59:59.999Z");
  });

  it("weekly: se já é segunda, retorna o início do próprio dia", () => {
    const date = new Date("2026-05-11T15:30:00.000Z");
    const { start } = computePeriod("weekly", date);
    expect(start.toISOString()).toBe("2026-05-11T03:00:00.000Z");
  });

  it("weekly: se é domingo, ainda pertence à semana iniciada na segunda anterior", () => {
    const date = new Date("2026-05-17T10:00:00.000Z");
    const { start, end } = computePeriod("weekly", date);
    expect(start.toISOString()).toBe("2026-05-11T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-05-18T02:59:59.999Z");
  });
});
