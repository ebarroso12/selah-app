import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

describe("healthcheck route — URLs", () => {
  it("não contém a URL antiga /api/devocional/generate (sem /ai/)", () => {
    const filePath = join(process.cwd(), "src/app/api/admin/healthcheck/route.ts");
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, "utf-8");
    // A URL antiga sem o prefixo /ai/ não deve existir no arquivo
    expect(content).not.toContain("/api/devocional/generate");
  });

  it("contém a URL nova /api/ai/devocional/generate", () => {
    const filePath = join(process.cwd(), "src/app/api/admin/healthcheck/route.ts");
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("/api/ai/devocional/generate");
  });
});
