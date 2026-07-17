import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@/shared/services/auth/server", () => ({ requireAdminOrForbidden: authMock }));
vi.mock("@/features/admin/services/ai-budget-admin.service", () => ({
  aiBudgetAdminService: {
    listUserBudgets: vi.fn().mockResolvedValue([]),
    getOverviewStats: vi.fn().mockResolvedValue({
      totalTokens: 0, totalCostBrl: 0, activeUsers: 0, totalUsers: 0,
      topUser: null, periodStart: "2026-05-01", periodEnd: "2026-06-01",
    }),
  },
}));

import { GET } from "@/app/api/admin/ai-budget/route";
import { NextResponse } from "next/server";

describe("/api/admin/ai-budget GET", () => {
  beforeEach(() => authMock.mockReset());

  it("401 sem auth", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Não autenticado" }, { status: 401 }));
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("403 não-admin", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Acesso negado" }, { status: 403 }));
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("200 com payload válido quando admin", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("overview");
    expect(json).toHaveProperty("users");
  });
});
