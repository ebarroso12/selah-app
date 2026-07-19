import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do supabase client ──────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

import { eventService } from "./event.service";
import { IntegrationError } from "@/shared/lib/errors";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSelectChain(result: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  };
  mockSelect.mockReturnValue(chain);
  return chain;
}

function buildSelectAllChain(result: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
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

function buildDeleteChain(result: unknown) {
  const chain = {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  };
  mockDelete.mockReturnValue(chain);
  return chain;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("eventService.listUpcoming", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna eventos futuros ordenados por data de início", async () => {
    const events = [
      { id: "1", title: "Culto de Oração", category: "culto", date_start: "2026-06-01T20:00:00Z", created_at: "2026-01-01" },
      { id: "2", title: "RPM Legendários", category: "rpm", date_start: "2026-06-05T19:00:00Z", created_at: "2026-01-01" },
    ];
    buildSelectChain({ data: events, error: null });

    const result = await eventService.listUpcoming();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Culto de Oração");
  });

  it("retorna array vazio quando não há eventos", async () => {
    buildSelectChain({ data: null, error: null });

    const result = await eventService.listUpcoming();

    expect(result).toEqual([]);
  });

  it("lança IntegrationError quando Supabase retorna erro", async () => {
    buildSelectChain({ data: null, error: { message: "DB error" } });

    await expect(eventService.listUpcoming()).rejects.toThrow(IntegrationError);
  });
});

describe("eventService.listAll", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna todos os eventos ordenados por data", async () => {
    const events = [
      { id: "1", title: "Culto Passado", category: "culto", date_start: "2026-01-01T20:00:00Z", created_at: "2025-12-01" },
      { id: "2", title: "Retiro", category: "retiro", date_start: "2026-06-10T08:00:00Z", created_at: "2025-12-01" },
    ];
    buildSelectAllChain({ data: events, error: null });

    const result = await eventService.listAll();

    expect(result).toHaveLength(2);
  });

  it("lança IntegrationError quando Supabase retorna erro", async () => {
    buildSelectAllChain({ data: null, error: { message: "DB error" } });

    await expect(eventService.listAll()).rejects.toThrow(IntegrationError);
  });
});

describe("eventService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria e retorna o evento inserido", async () => {
    const event = {
      id: "abc",
      title: "TOP Legendários",
      category: "top",
      date_start: "2026-07-10T08:00:00Z",
      date_end: "2026-07-14T18:00:00Z",
      location: "Retiro Serra do Mar",
      created_at: "2026-01-01",
    };
    buildInsertChain({ data: event, error: null });

    const result = await eventService.create({
      title: "TOP Legendários",
      category: "top",
      date_start: "2026-07-10T08:00:00Z",
    });

    expect(result.id).toBe("abc");
    expect(result.title).toBe("TOP Legendários");
  });

  it("lança IntegrationError quando inserção falha", async () => {
    buildInsertChain({ data: null, error: { message: "Insert failed" } });

    await expect(
      eventService.create({ title: "Teste", category: "outro", date_start: "2026-06-01T20:00:00Z" })
    ).rejects.toThrow(IntegrationError);
  });
});

describe("eventService.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza evento sem lançar erro", async () => {
    buildUpdateChain({ data: null, error: null });

    await expect(
      eventService.update("event-1", { title: "Culto Atualizado" })
    ).resolves.not.toThrow();
  });

  it("lança IntegrationError quando update falha", async () => {
    buildUpdateChain({ data: null, error: { message: "Update failed" } });

    await expect(
      eventService.update("event-1", { title: "Culto" })
    ).rejects.toThrow(IntegrationError);
  });
});

describe("eventService.remove", () => {
  beforeEach(() => vi.clearAllMocks());

  it("remove evento sem lançar erro", async () => {
    buildDeleteChain({ data: null, error: null });

    await expect(eventService.remove("event-1")).resolves.not.toThrow();
  });

  it("lança IntegrationError quando delete falha", async () => {
    buildDeleteChain({ data: null, error: { message: "Delete failed" } });

    await expect(eventService.remove("event-1")).rejects.toThrow(IntegrationError);
  });
});
