import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do supabase client ──────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}));

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

import { testimonyService } from "./testimony.service";
import { IntegrationError } from "@/shared/lib/errors";

// ─── Helpers para encadear métodos do builder ─────────────────────────────────
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

function buildInsertChain(result: unknown) {
  const chain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };
  mockInsert.mockReturnValue(chain);
  return chain;
}

function buildUpdateChain(result: unknown) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  };
  mockUpdate.mockReturnValue(chain);
  return chain;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("testimonyService.listApproved", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna testemunhos aprovados com perfil, ordenados por data", async () => {
    const testimonies = [
      {
        id: "1",
        title: "Cura milagrosa",
        content: "Deus me curou de uma doença grave.",
        type: "irmao",
        approved: true,
        user_id: "u1",
        created_at: "2024-01-01",
        profile: { full_name: "João Silva", church_name: "Igreja A", city: "SP" },
      },
    ];

    buildSelectChain({ data: testimonies, error: null });

    const result = await testimonyService.listApproved();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Cura milagrosa");
    expect(result[0].profile?.full_name).toBe("João Silva");
  });

  it("filtra por tipo quando tipo é fornecido", async () => {
    const testimonies = [
      {
        id: "2",
        title: "Restauração",
        content: "Deus restaurou meu casamento.",
        type: "legendario",
        approved: true,
        user_id: "u2",
        created_at: "2024-01-02",
        profile: null,
      },
    ];

    buildSelectChain({ data: testimonies, error: null });

    const result = await testimonyService.listApproved({ type: "legendario" });

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("legendario");
  });

  it("retorna array vazio quando não há testemunhos", async () => {
    buildSelectChain({ data: null, error: null });

    const result = await testimonyService.listApproved();

    expect(result).toEqual([]);
  });

  it("lança IntegrationError quando Supabase retorna erro", async () => {
    buildSelectChain({ data: null, error: { message: "DB error" } });

    await expect(testimonyService.listApproved()).rejects.toThrow(IntegrationError);
  });
});

describe("testimonyService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria e retorna o testemunho inserido com approved=false", async () => {
    const testimony = {
      id: "abc",
      user_id: "user-1",
      title: "Milagre na família",
      content: "Deus restaurou tudo que o inimigo roubou da minha família.",
      type: "irmao",
      approved: false,
      created_at: "2024-01-01",
    };

    buildInsertChain({ data: testimony, error: null });

    const result = await testimonyService.create({
      user_id: "user-1",
      title: "Milagre na família",
      content: "Deus restaurou tudo que o inimigo roubou da minha família.",
      type: "irmao",
    });

    expect(result.id).toBe("abc");
    expect(result.approved).toBe(false);
    expect(result.title).toBe("Milagre na família");
  });

  it("lança IntegrationError quando inserção falha", async () => {
    buildInsertChain({ data: null, error: { message: "Insert failed" } });

    await expect(
      testimonyService.create({
        user_id: "u1",
        title: "Título",
        content: "Conteúdo do testemunho com mais de cinquenta caracteres aqui.",
        type: "irmao",
      })
    ).rejects.toThrow(IntegrationError);
  });
});

describe("testimonyService.approve", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aprova testemunho sem lançar erro", async () => {
    buildUpdateChain({ data: null, error: null });

    await expect(testimonyService.approve("testimony-1")).resolves.not.toThrow();
  });

  it("lança IntegrationError quando update falha", async () => {
    buildUpdateChain({ data: null, error: { message: "Update failed" } });

    await expect(testimonyService.approve("testimony-1")).rejects.toThrow(IntegrationError);
  });
});
