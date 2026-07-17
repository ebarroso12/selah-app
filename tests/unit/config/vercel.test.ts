import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("vercel.json — headers de segurança", () => {
  const raw = readFileSync(join(process.cwd(), "vercel.json"), "utf-8");
  const config = JSON.parse(raw);
  const globalHeaders = config.headers?.find((h: any) => h.source === "/(.*)");
  const headerMap = Object.fromEntries(
    (globalHeaders?.headers ?? []).map((h: any) => [h.key, h.value])
  );

  it("deve ter Strict-Transport-Security", () => {
    expect(headerMap["Strict-Transport-Security"]).toBeDefined();
    expect(headerMap["Strict-Transport-Security"]).toContain("max-age=");
  });

  it("deve ter Content-Security-Policy", () => {
    expect(headerMap["Content-Security-Policy"]).toBeDefined();
    expect(headerMap["Content-Security-Policy"]).toContain("default-src");
  });
});
