/**
 * Task 5.1 — Feature Devocional (service unit tests)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock supabase ────────────────────────────────────────────────────────────

const mockFrom = vi.fn();

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

// ─── Mock fetch para generateInteractive ─────────────────────────────────────

global.fetch = vi.fn();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Task 5.1 — devotional.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getToday ──
  it("getToday retorna null quando não há devocional para hoje", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const { getToday } = await import("@/features/devocional/services/devotional.service");
    const result = await getToday();
    expect(result).toBeNull();
  });

  it("getToday retorna devocional quando encontrado", async () => {
    const fakeDevocional = { id: "d1", title: "Teste", date: "2026-05-06" };
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeDevocional, error: null }),
    });

    const { getToday } = await import("@/features/devocional/services/devotional.service");
    const result = await getToday();
    expect(result).toEqual(fakeDevocional);
  });

  // ── getRecent ──
  it("getRecent retorna lista de devocionais", async () => {
    const fakeList = [
      { id: "d1", title: "Dev 1", date: "2026-05-05" },
      { id: "d2", title: "Dev 2", date: "2026-05-04" },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: fakeList, error: null }),
    });

    const { getRecent } = await import("@/features/devocional/services/devotional.service");
    const result = await getRecent(5);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Dev 1");
  });

  it("getRecent retorna [] em caso de erro", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
    });

    const { getRecent } = await import("@/features/devocional/services/devotional.service");
    const result = await getRecent();
    expect(result).toEqual([]);
  });

  // ── generateInteractive ──
  it("generateInteractive chama /api/devocional/interativo e retorna resultado", async () => {
    const fakeResult = {
      titulo: "Fé Inabalável",
      versiculo: "Tudo posso naquele que me fortalece.",
      referencia: "Filipenses 4:13",
      reflexao: "Uma reflexão profunda...",
      oracao: "Senhor, fortalece-me...",
      frase_destaque: "Com Cristo tudo é possível.",
      topico: "Fé",
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => fakeResult,
    });

    const { generateInteractive } = await import(
      "@/features/devocional/services/devotional.service"
    );
    const result = await generateInteractive({ tipo: "tema", tema: "Fé" });

    expect(result.titulo).toBe("Fé Inabalável");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/devocional/interativo",
      expect.any(Object),
    );
  });

  it("generateInteractive lança erro quando API falha", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Tema obrigatório" }),
    });

    const { generateInteractive } = await import(
      "@/features/devocional/services/devotional.service"
    );

    await expect(generateInteractive({ tipo: "tema" })).rejects.toThrow("Tema obrigatório");
  });
});
