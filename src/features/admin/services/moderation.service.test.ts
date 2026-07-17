import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockFrom, mockSelect, mockUpdate, mockDelete } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockFrom = vi.fn(() => ({ select: mockSelect, update: mockUpdate, delete: mockDelete }));
  return { mockFrom, mockSelect, mockUpdate, mockDelete };
});

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

import { moderationService } from "./moderation.service";
import { IntegrationError } from "@/shared/lib/errors";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSelectChain(result: unknown) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    then: (fn: (v: unknown) => unknown) => Promise.resolve(result).then(fn),
  };
  mockSelect.mockReturnValue(chain);
  return chain;
}

function buildUpdateChain(result: unknown) {
  const chain = { eq: vi.fn().mockResolvedValue(result) };
  mockUpdate.mockReturnValue(chain);
  return chain;
}

function buildDeleteChain(result: unknown) {
  const chain = { eq: vi.fn().mockResolvedValue(result) };
  mockDelete.mockReturnValue(chain);
  return chain;
}

beforeEach(() => vi.clearAllMocks());

// ─── listPendingRegistrations ─────────────────────────────────────────────────
describe("moderationService.listPendingRegistrations", () => {
  it("retorna perfis com status pending", async () => {
    const profiles = [{ id: "u1", full_name: "João", status: "pending" }];
    buildSelectChain({ data: profiles, error: null });

    const result = await moderationService.listPendingRegistrations();

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(result).toEqual(profiles);
  });

  it("lança IntegrationError quando falha", async () => {
    buildSelectChain({ data: null, error: { message: "db error" } });

    await expect(moderationService.listPendingRegistrations()).rejects.toThrow(IntegrationError);
  });
});

// ─── listAllPrayers ───────────────────────────────────────────────────────────
describe("moderationService.listAllPrayers", () => {
  it("retorna todos os pedidos de oração ordenados", async () => {
    const prayers = [{ id: "p1", text: "Oração 1", status: "open" }];
    buildSelectChain({ data: prayers, error: null });

    const result = await moderationService.listAllPrayers();

    expect(mockFrom).toHaveBeenCalledWith("prayer_requests");
    expect(result).toEqual(prayers);
  });

  it("filtra por status quando passado", async () => {
    const chain = buildSelectChain({ data: [], error: null });

    await moderationService.listAllPrayers("answered");

    expect(chain.eq).toHaveBeenCalledWith("status", "answered");
  });
});

// ─── updatePrayerStatus ───────────────────────────────────────────────────────
describe("moderationService.updatePrayerStatus", () => {
  it("atualiza status da oração", async () => {
    buildUpdateChain({ error: null });

    await expect(moderationService.updatePrayerStatus("p1", "answered")).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("prayer_requests");
  });

  it("lança IntegrationError quando update falha", async () => {
    buildUpdateChain({ error: { message: "error" } });

    await expect(moderationService.updatePrayerStatus("p1", "answered")).rejects.toThrow(IntegrationError);
  });
});

// ─── listAllTestimonies ───────────────────────────────────────────────────────
describe("moderationService.listAllTestimonies", () => {
  it("retorna todos os testemunhos", async () => {
    const items = [{ id: "t1", content: "Testemunho", approved: false }];
    buildSelectChain({ data: items, error: null });

    const result = await moderationService.listAllTestimonies();

    expect(mockFrom).toHaveBeenCalledWith("testimonies");
    expect(result).toEqual(items);
  });
});

// ─── approveTestimony / rejectTestimony / deleteTestimony ─────────────────────
describe("moderationService.approveTestimony", () => {
  it("aprova testemunho", async () => {
    buildUpdateChain({ error: null });

    await expect(moderationService.approveTestimony("t1")).resolves.toBeUndefined();
  });

  it("lança IntegrationError quando falha", async () => {
    buildUpdateChain({ error: { message: "error" } });

    await expect(moderationService.approveTestimony("t1")).rejects.toThrow(IntegrationError);
  });
});

describe("moderationService.rejectTestimony", () => {
  it("rejeita testemunho", async () => {
    buildUpdateChain({ error: null });

    await expect(moderationService.rejectTestimony("t1")).resolves.toBeUndefined();
  });
});

describe("moderationService.deleteTestimony", () => {
  it("deleta testemunho", async () => {
    buildDeleteChain({ error: null });

    await expect(moderationService.deleteTestimony("t1")).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("testimonies");
  });
});

// ─── listAllHomenagens ────────────────────────────────────────────────────────
describe("moderationService.listAllHomenagens", () => {
  it("retorna todas as homenagens", async () => {
    const items = [{ id: "h1", homenageado_nome: "Pai", status: "pending" }];
    buildSelectChain({ data: items, error: null });

    const result = await moderationService.listAllHomenagens();

    expect(mockFrom).toHaveBeenCalledWith("homenagens");
    expect(result).toEqual(items);
  });
});

// ─── approveHomenagem / rejectHomenagem ───────────────────────────────────────
describe("moderationService.approveHomenagem", () => {
  it("aprova homenagem", async () => {
    buildUpdateChain({ error: null });

    await expect(moderationService.approveHomenagem("h1")).resolves.toBeUndefined();
  });
});

describe("moderationService.rejectHomenagem", () => {
  it("rejeita homenagem", async () => {
    buildUpdateChain({ error: null });

    await expect(moderationService.rejectHomenagem("h1")).resolves.toBeUndefined();
  });
});
