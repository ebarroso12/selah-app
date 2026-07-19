/**
 * Task 3.1 — Supabase clients: sem hardcode de keys
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const SUPABASE_DIR = path.resolve(__dirname, "../../../src/shared/services/supabase");

describe("Task 3.1 — Supabase clients", () => {
  it("browser client não contém chaves JWT hardcoded", () => {
    const content = fs.readFileSync(path.join(SUPABASE_DIR, "supabase.browser.ts"), "utf-8");
    expect(content).not.toMatch(/eyJhbGc/);
    expect(content).not.toMatch(/urmhuxluepexyycptflr/);
  });

  it("server client não contém chaves JWT hardcoded", () => {
    const content = fs.readFileSync(path.join(SUPABASE_DIR, "supabase.server.ts"), "utf-8");
    expect(content).not.toMatch(/eyJhbGc/);
    expect(content).not.toMatch(/urmhuxluepexyycptflr/);
  });

  it("database.ts exporta tipo Database com tabelas essenciais", async () => {
    // Verifica o arquivo de tipos gerados
    const dbTypes = fs.readFileSync(
      path.resolve(__dirname, "../../../src/types/database.ts"),
      "utf-8"
    );
    expect(dbTypes).toContain("profiles");
    expect(dbTypes).toContain("bible_verses");
    expect(dbTypes).toContain("ai_usage");
    expect(dbTypes).toContain("user_metrics");
    expect(dbTypes).toContain("AiFeature");
    expect(dbTypes).toContain("UserRole");
  });
});
