import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, addBonusMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  addBonusMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/shared/services/auth/server", () => ({ requireAdminOrForbidden: authMock }));
vi.mock("@/features/admin/services/ai-budget-admin.service", () => ({
  aiBudgetAdminService: { addBonus: addBonusMock },
}));

import { POST } from "@/app/api/admin/ai-budget/users/[id]/bonus/route";
import { NextResponse } from "next/server";

function makeReq(body: unknown): Request {
  return new Request("http://x", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const params = Promise.resolve({ id: "u1" });

describe("/api/admin/ai-budget/users/[id]/bonus POST", () => {
  beforeEach(() => {
    authMock.mockReset();
    addBonusMock.mockClear();
  });

  it("401 sem auth", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Não autenticado" }, { status: 401 }));
    const res = await POST(makeReq({ amountBrl: 5 }), { params });
    expect(res.status).toBe(401);
  });

  it("403 não-admin", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Acesso negado" }, { status: 403 }));
    const res = await POST(makeReq({ amountBrl: 5 }), { params });
    expect(res.status).toBe(403);
  });

  it("400 quando amountBrl <= 0", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await POST(makeReq({ amountBrl: 0 }), { params });
    expect(res.status).toBe(400);
  });

  it("400 quando amountBrl negativo", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await POST(makeReq({ amountBrl: -5 }), { params });
    expect(res.status).toBe(400);
  });

  it("200 quando válido", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await POST(makeReq({ amountBrl: 10 }), { params });
    expect(res.status).toBe(200);
    expect(addBonusMock).toHaveBeenCalledWith("u1", 10);
  });
});
