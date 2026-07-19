/**
 * Smoke test — src/shared/lib/utils.ts
 * Cobre as funções utilitárias com casos básicos.
 */
import { describe, it, expect } from "vitest";
import { cn, formatDate, formatTime, getInitials } from "@/shared/lib/utils";

describe("cn()", () => {
  it("retorna string vazia para nenhum argumento", () => {
    expect(cn()).toBe("");
  });

  it("combina classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("remove classes falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("resolve conflitos do Tailwind (tw-merge)", () => {
    // px-2 e px-4 no mesmo elemento → px-4 vence
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatDate()", () => {
  it("formata data em pt-BR (contém o mês por extenso)", () => {
    // Usa noon local para evitar drift de fuso horário
    const result = formatDate(new Date(2025, 0, 5, 12, 0, 0)); // Jan 5 local
    expect(result).toMatch(/janeiro/i);
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/05/);
  });

  it("aceita objeto Date", () => {
    const result = formatDate(new Date(2025, 5, 15, 12, 0, 0)); // Jun 15 local
    expect(result).toMatch(/junho/i);
    expect(result).toMatch(/2025/);
  });
});

describe("formatTime()", () => {
  it("formata hora em pt-BR (HH:MM)", () => {
    // Cria data com hora fixa em UTC
    const d = new Date("2025-01-01T10:30:00");
    const result = formatTime(d);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("getInitials()", () => {
  it("retorna iniciais de nome simples", () => {
    expect(getInitials("João Silva")).toBe("JS");
  });

  it("usa apenas as 2 primeiras palavras", () => {
    expect(getInitials("Maria de Lourdes")).toBe("MD");
  });

  it("retorna inicial única para nome simples", () => {
    expect(getInitials("Pedro")).toBe("P");
  });

  it("retorna em maiúsculas", () => {
    expect(getInitials("ana beatriz")).toBe("AB");
  });
});
