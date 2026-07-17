import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do supabase client ──────────────────────────────────────────────────
const mockSelect = vi.fn();

const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

// ─── Mock do fetch global (para rewrite) ─────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { homenagensService } from "./homenagem.service";
import { IntegrationError } from "@/shared/lib/errors";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSelectChain(result: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  };
  mockSelect.mockReturnValue(chain);
  return chain;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("homenagensService.listApproved", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna homenagens aprovadas ordenadas por data", async () => {
    const homenagens = [
      {
        id: "1",
        autor_nome: "Dr. Edson",
        homenageado_nome: "Lisley",
        homenageado_parentesco: "Esposa",
        texto: "Uma mulher extraordinária.",
        status: "approved",
        fotos: [],
        foto_capa_index: 0,
        created_at: "2024-01-01",
      },
    ];

    buildSelectChain({ data: homenagens, error: null });

    const result = await homenagensService.listApproved();

    expect(result).toHaveLength(1);
    expect(result[0].autor_nome).toBe("Dr. Edson");
    expect(result[0].homenageado_nome).toBe("Lisley");
  });

  it("retorna array vazio quando não há homenagens", async () => {
    buildSelectChain({ data: null, error: null });

    const result = await homenagensService.listApproved();

    expect(result).toEqual([]);
  });

  it("lança IntegrationError quando Supabase retorna erro", async () => {
    buildSelectChain({ data: null, error: { message: "DB error" } });

    await expect(homenagensService.listApproved()).rejects.toThrow(IntegrationError);
  });
});

describe("homenagensService.rewrite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna o texto reescrito pela IA", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ texto: "Texto reescrito pela IA com até 2000 caracteres." }),
    });

    const result = await homenagensService.rewrite("Texto original da homenagem.");

    expect(result).toBe("Texto reescrito pela IA com até 2000 caracteres.");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/homenagens/reescrever",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("lança IntegrationError quando a API retorna erro", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Erro ao processar" }),
    });

    await expect(homenagensService.rewrite("Texto")).rejects.toThrow(IntegrationError);
  });

  it("lança IntegrationError quando a resposta não contém texto", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await expect(homenagensService.rewrite("Texto")).rejects.toThrow(IntegrationError);
  });
});
