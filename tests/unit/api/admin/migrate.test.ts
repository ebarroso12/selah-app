import { describe, it, expect, vi, afterEach } from "vitest";

// Mock do supabase.server para evitar erros de conexão real
vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn(async () => ({
    rpc: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Security — /api/admin/migrate", () => {
  it("POST sem header Authorization → 401", async () => {
    vi.stubEnv("CRON_SECRET", "token-correto");

    const { POST } = await import("@/app/api/admin/migrate/route");
    const res = await POST(
      new Request("http://localhost/api/admin/migrate", { method: "POST" }),
    );
    expect(res.status).toBe(401);
  });

  it("POST com ADMIN_EMAIL como bearer → 401 (não deve aceitar fallback de email)", async () => {
    vi.stubEnv("CRON_SECRET", "token-correto");
    vi.stubEnv("ADMIN_EMAIL", "admin@exemplo.com");

    const { POST } = await import("@/app/api/admin/migrate/route");
    const res = await POST(
      new Request("http://localhost/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: "Bearer admin@exemplo.com" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("POST com Authorization: Bearer (vazio) → 401", async () => {
    vi.stubEnv("CRON_SECRET", "token-correto");

    const { POST } = await import("@/app/api/admin/migrate/route");
    const res = await POST(
      new Request("http://localhost/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: "Bearer " },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("POST com CRON_SECRET correto → 200", async () => {
    vi.stubEnv("CRON_SECRET", "token-correto");

    const { POST } = await import("@/app/api/admin/migrate/route");
    const res = await POST(
      new Request("http://localhost/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: "Bearer token-correto" },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("POST sem CRON_SECRET configurado → 500", async () => {
    // CRON_SECRET não definido
    vi.stubEnv("CRON_SECRET", "");

    const { POST } = await import("@/app/api/admin/migrate/route");
    const res = await POST(
      new Request("http://localhost/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: "Bearer qualquer-coisa" },
      }),
    );
    expect(res.status).toBe(500);
  });
});
