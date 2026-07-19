import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("Security — /api/admin/setup-users removida", () => {
  it("arquivo da rota não existe no projeto", () => {
    const routePath = join(process.cwd(), "src/app/api/admin/setup-users/route.ts");
    expect(existsSync(routePath)).toBe(false);
  });
});
