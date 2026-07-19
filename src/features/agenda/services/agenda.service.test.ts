import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do supabase client ──────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
}));

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

import { agendaService } from "./agenda.service";
import { IntegrationError } from "@/shared/lib/errors";
import type { CalendarEvent } from "../types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockEvent: CalendarEvent = {
  id: "ev-1",
  user_id: "user-1",
  title: "Reunião de oração",
  date: "2026-05-15",
  time: "09:00",
  description: null,
  psalm_ref: "Salmos 37:5",
  psalm_text: "Entrega o teu caminho ao Senhor.",
  notify: true,
  created_at: "2026-05-10T00:00:00Z",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildListChain(result: unknown) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
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

function buildDeleteChain(result: unknown) {
  const chain = {
    eq: vi.fn().mockResolvedValue(result),
  };
  mockDelete.mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────
describe("agendaService.list", () => {
  it("retorna eventos do usuário ordenados por data", async () => {
    buildListChain({ data: [mockEvent], error: null });

    const result = await agendaService.list("user-1");

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
    expect(result).toEqual([mockEvent]);
  });

  it("lança IntegrationError quando supabase retorna erro", async () => {
    buildListChain({ data: null, error: { message: "db error" } });

    await expect(agendaService.list("user-1")).rejects.toThrow(IntegrationError);
  });

  it("retorna array vazio quando não há eventos", async () => {
    buildListChain({ data: [], error: null });

    const result = await agendaService.list("user-1");

    expect(result).toEqual([]);
  });
});

// ─── create ───────────────────────────────────────────────────────────────────
describe("agendaService.create", () => {
  it("cria evento e retorna o registro inserido", async () => {
    buildInsertChain({ data: mockEvent, error: null });

    const result = await agendaService.create("user-1", {
      title: "Reunião de oração",
      date: "2026-05-15",
      psalm_ref: "Salmos 37:5",
      psalm_text: "Entrega o teu caminho ao Senhor.",
    });

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
    expect(result).toEqual(mockEvent);
  });

  it("lança IntegrationError quando insert falha", async () => {
    buildInsertChain({ data: null, error: { message: "insert error" } });

    await expect(
      agendaService.create("user-1", { title: "Teste", date: "2026-05-15" })
    ).rejects.toThrow(IntegrationError);
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────
describe("agendaService.remove", () => {
  it("deleta evento por id sem retornar dado", async () => {
    buildDeleteChain({ error: null });

    await expect(agendaService.remove("ev-1")).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
  });

  it("lança IntegrationError quando delete falha", async () => {
    buildDeleteChain({ error: { message: "delete error" } });

    await expect(agendaService.remove("ev-1")).rejects.toThrow(IntegrationError);
  });
});
