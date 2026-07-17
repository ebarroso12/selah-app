import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("adminService — segurança", () => {
  it("não deve ter DEFAULT_PASSWORD hardcoded no código", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/admin/services/admin.service.ts"),
      "utf-8"
    );
    // Garante que a string "Mudar123" não existe no código
    expect(source).not.toContain("Mudar123");
    // Garante que usa geração de senha (crypto ou randomUUID)
    expect(source.toLowerCase()).toMatch(/crypto|randombytes|randomuuid|randompassword/i);
  });
});
