import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

describe("arquivos de código morto não devem existir", () => {
  // Task 12
  it("src/app/api/kairo/route.ts não existe", () => {
    expect(existsSync(join(process.cwd(), "src/app/api/kairo/route.ts"))).toBe(false);
  });

  // Task 13
  it("src/app/api/devocional/generate/route.ts não existe", () => {
    expect(existsSync(join(process.cwd(), "src/app/api/devocional/generate/route.ts"))).toBe(false);
  });

  // Task 14
  it("src/lib/ai/openai.ts não existe", () => {
    expect(existsSync(join(process.cwd(), "src/lib/ai/openai.ts"))).toBe(false);
  });

  it("src/lib/metrics/token-tracker.ts não existe", () => {
    expect(existsSync(join(process.cwd(), "src/lib/metrics/token-tracker.ts"))).toBe(false);
  });
});
