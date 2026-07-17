import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, setUserLimitMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  setUserLimitMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/shared/services/auth/server", () => ({ requireAdminOrForbidden: authMock }));
vi.mock("@/features/admin/services/ai-budget-admin.service", () => ({
  aiBudgetAdminService: { setUserLimit: setUserLimitMock },
}));

import { PATCH } from "@/app/api/admin/ai-budget/users/[id]/route";
import { NextResponse } from "next/server";

function makeReq(body: unknown): Request {
  return new Request("http://x", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const params = Promise.resolve({ id: "u1" });

describe("/api/admin/ai-budget/users/[id] PATCH", () => {
  beforeEach(() => {
    authMock.mockReset();
    setUserLimitMock.mockClear();
  });

  it("401 sem auth", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Não autenticado" }, { status: 401 }));
    const res = await PATCH(makeReq({ limitBrl: 10 }), { params });
    expect(res.status).toBe(401);
  });

  it("403 não-admin", async () => {
    authMock.mockResolvedValue(NextResponse.json({ error: "Acesso negado" }, { status: 403 }));
    const res = await PATCH(makeReq({ limitBrl: 10 }), { params });
    expect(res.status).toBe(403);
  });

  it("400 quando body inválido", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await PATCH(makeReq({ limitBrl: -10 }), { params });
    expect(res.status).toBe(400);
  });

  it("200 quando limite numérico", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await PATCH(makeReq({ limitBrl: 10 }), { params });
    expect(res.status).toBe(200);
    expect(setUserLimitMock).toHaveBeenCalledWith("u1", 10);
  });

  it("200 quando limitBrl é null (limpa override)", async () => {
    authMock.mockResolvedValue({ user: { id: "admin" }, profile: { role: "admin" } });
    const res = await PATCH(makeReq({ limitBrl: null }), { params });
    expect(res.status).toBe(200);
    expect(setUserLimitMock).toHaveBeenCalledWith("u1", null);
  });
});
