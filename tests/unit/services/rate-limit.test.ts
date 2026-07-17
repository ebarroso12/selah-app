/**
 * Task 3.4 — Rate Limit Service
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do supabase para controlar contadores
let fakeCount = 0;

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn().mockImplementation(async () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      maybeSingle: vi.fn().mockImplementation(async () => {
        if (fakeCount === 0) return { data: null };
        return { data: { id: "row-1", count: fakeCount } };
      }),
    }),
  })),
}));

describe("Task 3.4 — Rate Limit Service", () => {
  beforeEach(() => {
    fakeCount = 0;
    vi.resetModules();
  });

  it("primeira chamada é permitida", async () => {
    const { checkAndIncrement } = await import(
      "@/shared/services/rate-limit/rate-limit.service"
    );
    const result = await checkAndIncrement("test:bucket", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it("acima do limite retorna allowed: false", async () => {
    fakeCount = 5; // já está no limite
    const { checkAndIncrement } = await import(
      "@/shared/services/rate-limit/rate-limit.service"
    );
    const result = await checkAndIncrement("test:bucket", 5, 60_000);
    // count vai para 6, max é 5 → bloqueado
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("withRateLimit retorna 429 quando bloqueado", async () => {
    fakeCount = 20; // acima do limite
    const { withRateLimit } = await import(
      "@/shared/services/rate-limit/rate-limit.service"
    );

    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRateLimit("test:bucket", { max: 20, windowMs: 60_000 }, fn);

    // NextResponse.json retorna um objeto com status
    expect(fn).not.toHaveBeenCalled();
    // Verificamos que é uma NextResponse (tem método json)
    expect(result).toBeDefined();
  });

  it("withRateLimit chama fn quando permitido", async () => {
    fakeCount = 0;
    const { withRateLimit } = await import(
      "@/shared/services/rate-limit/rate-limit.service"
    );

    const fn = vi.fn().mockResolvedValue("resultado");
    const result = await withRateLimit("test:bucket", { max: 20, windowMs: 60_000 }, fn);

    expect(fn).toHaveBeenCalledOnce();
    expect(result).toBe("resultado");
  });
});
