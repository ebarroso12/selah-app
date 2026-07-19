import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("Estrutura — componentes em shared/components", () => {
  const cwd = process.cwd();

  it("src/components/ não deve existir (foi migrado para shared)", () => {
    // O diretório raiz não deve mais ter arquivos
    expect(existsSync(join(cwd, "src/components/admin/InviteUser.tsx"))).toBe(false);
    expect(existsSync(join(cwd, "src/components/ui/MobileNav.tsx"))).toBe(false);
  });

  it("componentes devem estar em src/shared/components/", () => {
    expect(existsSync(join(cwd, "src/shared/components/admin/InviteUser.tsx"))).toBe(true);
    expect(existsSync(join(cwd, "src/shared/components/ui/MobileNav.tsx"))).toBe(true);
  });
});
