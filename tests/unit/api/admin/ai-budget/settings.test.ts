import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@/shared/services/auth/server", () => ({ requireAdminOrForbidden: authMock }));
vi.mock("@/features/admin/services/ai-budget-admin.service", () => ({
  aiBudgetAdminService: {
    updateSettings: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("@/shared/services/ai-budget", () => ({
  getBudgetSettings: vi.fn().mockResolvedValue({
    defaultBudgetBrl: 5,
    resetPeriod: "monthly",
    usdToBrl: 5.2,
    pricing: { "gpt-4o-mini": { input: 0.15, output: 0.6 } },
  }),
  _resetSettingsCacheForTests: vi.fn(),
}));

import { GET, PATCH } from "@/app/api/admin/ai-budget/settings/route";
import { NextResponse } from "next/server";

function makeReq(body: unknown): Request {
  return new Request("http://x", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/admin/ai-budget/settings", () => {
  beforeEach(() => authMock.mockReset());

  it("GET 401 sem auth", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Não autenticado" }, { status: 401 }));
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET 200 retorna settings quando admin", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("defaultBudgetBrl");
  });

  it("PATCH 403 não-admin", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Acesso negado" }, { status: 403 }));
    const res = await PATCH(makeReq({ defaultBudgetBrl: 10 }));
    expect(res.status).toBe(403);
  });

  it("PATCH 400 quando payload inválido", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await PATCH(makeReq({ defaultBudgetBrl: -10 }));
    expect(res.status).toBe(400);
  });

  it("PATCH 200 quando válido", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await PATCH(makeReq({ defaultBudgetBrl: 10, resetPeriod: "monthly" }));
    expect(res.status).toBe(200);
  });
});
