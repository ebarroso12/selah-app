import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, resetUserBudgetMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  resetUserBudgetMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/shared/services/auth/server", () => ({ requireAdminOrForbidden: authMock }));
vi.mock("@/features/admin/services/ai-budget-admin.service", () => ({
  aiBudgetAdminService: { resetUserBudget: resetUserBudgetMock },
}));

import { POST } from "@/app/api/admin/ai-budget/users/[id]/reset/route";
import { NextResponse } from "next/server";

const params = Promise.resolve({ id: "u1" });

function emptyReq(): Request {
  return new Request("http://x", { method: "POST" });
}

describe("/api/admin/ai-budget/users/[id]/reset POST", () => {
  beforeEach(() => {
    authMock.mockReset();
    resetUserBudgetMock.mockClear();
  });

  it("401 sem auth", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Não autenticado" }, { status: 401 }));
    const res = await POST(emptyReq(), { params });
    expect(res.status).toBe(401);
  });

  it("403 não-admin", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Acesso negado" }, { status: 403 }));
    const res = await POST(emptyReq(), { params });
    expect(res.status).toBe(403);
  });

  it("200 quando admin", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await POST(emptyReq(), { params });
    expect(res.status).toBe(200);
    expect(resetUserBudgetMock).toHaveBeenCalledWith("u1");
  });
});
