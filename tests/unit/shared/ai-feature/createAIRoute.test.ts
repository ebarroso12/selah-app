/**
 * createAIRoute.test.ts
 * Kit compartilhado de IA bíblica — factory de route handlers.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";

const mockRequireAuth = vi.fn();
const mockWithRateLimit = vi.fn();

vi.mock("@/shared/services/auth/server", () => ({
  requireAuthOrUnauthorized: (...args: unknown[]) => mockRequireAuth(...args),
}));

vi.mock("@/shared/services/rate-limit/rate-limit.service", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
}));

import { createAIRoute } from "@/shared/ai-feature/createAIRoute";

const schema = z.object({ texto: z.string().min(1).max(100) });
type Input = z.infer<typeof schema>;
type Result = { titulo: string };

function makeReq(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<ReturnType<typeof createAIRoute<Input, Result>>>[0];
}

function authenticate(userId = "user-1") {
  mockRequireAuth.mockResolvedValue({
    user: { id: userId },
    profile: { id: userId, role: "user", status: "active", permissions: [] },
  });
}

function unauthenticate() {
  mockRequireAuth.mockResolvedValue(
    NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
  );
}

describe("createAIRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // por padrão, o rate limit é transparente: executa fn() direto
    mockWithRateLimit.mockImplementation(async (_bucket, _opts, fn) => fn());
  });

  it("retorna 401 quando não autenticado", async () => {
    unauthenticate();
    const service = vi.fn();
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "estudo",
    });
    const res = await handler(makeReq({ texto: "ok" }));
    expect(res.status).toBe(401);
    expect(service).not.toHaveBeenCalled();
  });

  it("retorna 400 quando body falha no schema Zod", async () => {
    authenticate();
    const service = vi.fn();
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "estudo",
    });
    const res = await handler(makeReq({ texto: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Dados inválidos");
    expect(json.details).toBeDefined();
    expect(service).not.toHaveBeenCalled();
  });

  it("chama o service com parsed.data e auth.user.id quando válido", async () => {
    authenticate("user-77");
    const service = vi.fn().mockResolvedValue({ titulo: "ok" });
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "estudo",
    });
    const res = await handler(makeReq({ texto: "hello" }));
    expect(service).toHaveBeenCalledWith({ texto: "hello" }, "user-77");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ titulo: "ok" });
  });

  it("usa o feature como bucket do rate limit (formato feature:userId)", async () => {
    authenticate("user-42");
    const service = vi.fn().mockResolvedValue({ titulo: "ok" });
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "teologia",
    });
    await handler(makeReq({ texto: "ok" }));
    expect(mockWithRateLimit).toHaveBeenCalled();
    expect(mockWithRateLimit.mock.calls[0][0]).toBe("teologia:user-42");
  });

  it("aplica rate limit default (max=10, windowMs=60000) quando não configurado", async () => {
    authenticate();
    const service = vi.fn().mockResolvedValue({ titulo: "ok" });
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "estudo",
    });
    await handler(makeReq({ texto: "ok" }));
    expect(mockWithRateLimit.mock.calls[0][1]).toEqual({
      max: 10,
      windowMs: 60_000,
    });
  });

  it("aplica rate limit custom quando configurado", async () => {
    authenticate();
    const service = vi.fn().mockResolvedValue({ titulo: "ok" });
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "estudo",
      rateLimit: { max: 5, windowMs: 30_000 },
    });
    await handler(makeReq({ texto: "ok" }));
    expect(mockWithRateLimit.mock.calls[0][1]).toEqual({
      max: 5,
      windowMs: 30_000,
    });
  });

  it("retorna 500 e usa errorMessage custom quando o service lança erro", async () => {
    authenticate();
    const service = vi.fn().mockRejectedValue(new Error("boom"));
    const handler = createAIRoute<Input, Result>({
      service,
      schema,
      feature: "estudo",
      errorMessage: "Erro custom ao gerar estudo",
    });
    // silencia console.error do handler
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handler(makeReq({ texto: "ok" }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Erro custom ao gerar estudo");
    err.mockRestore();
  });
});
