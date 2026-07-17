import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do supabase client ──────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}));

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

// Importar após o mock
import { prayerService } from "./prayer.service";
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

describe("prayerService.listPublic", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna pedidos públicos abertos ordenados por data", async () => {
    const prayers = [
      { id: "1", text: "Ore por mim", is_public: true, status: "open", created_at: "2024-01-01" },
      { id: "2", text: "Força na tribulação", is_public: true, status: "open", created_at: "2024-01-02" },
    ];

    buildSelectChain({ data: prayers, error: null });

    const result = await prayerService.listPublic();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
  });

  it("retorna array vazio quando não há pedidos", async () => {
    buildSelectChain({ data: null, error: null });

    const result = await prayerService.listPublic();

    expect(result).toEqual([]);
  });

  it("lança IntegrationError quando Supabase retorna erro", async () => {
    buildSelectChain({ data: null, error: { message: "DB error" } });

    await expect(prayerService.listPublic()).rejects.toThrow(IntegrationError);
  });
});

describe("prayerService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria e retorna o pedido inserido", async () => {
    const newPrayer = {
      id: "abc",
      user_id: "user-1",
      text: "Pedido de cura",
      is_public: true,
      via_whatsapp: false,
      status: "open",
      created_at: "2024-01-01",
    };

    buildInsertChain({ data: newPrayer, error: null });

    const result = await prayerService.create({
      user_id: "user-1",
      text: "Pedido de cura",
      is_public: true,
    });

    expect(result.id).toBe("abc");
    expect(result.text).toBe("Pedido de cura");
  });

  it("lança IntegrationError quando inserção falha", async () => {
    buildInsertChain({ data: null, error: { message: "Insert failed" } });

    await expect(
      prayerService.create({ user_id: "u1", text: "Teste", is_public: true })
    ).rejects.toThrow(IntegrationError);
  });
});

describe("prayerService.updateStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza o status do pedido sem lançar erro", async () => {
    buildUpdateChain({ data: null, error: null });

    await expect(
      prayerService.updateStatus("prayer-1", "answered")
    ).resolves.not.toThrow();
  });

  it("lança IntegrationError quando update falha", async () => {
    buildUpdateChain({ data: null, error: { message: "Update failed" } });

    await expect(
      prayerService.updateStatus("prayer-1", "answered")
    ).rejects.toThrow(IntegrationError);
  });
});
