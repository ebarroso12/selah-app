/**
 * ai-routes-auth.test.ts
 * Tasks 6-10 — Auth obrigatório nas rotas de IA
 *
 * Cada rota deve:
 * - Retornar 401 quando não autenticado
 * - Retornar 200 quando autenticado com payload válido
 * - Retornar 400 quando payload inválido (validação Zod)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do Supabase ─────────────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockProfileSingle,
    })),
  })),
  createServiceClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockReturnThis(),
    })),
  })),
}));

// ─── Mock do rate limit — transparente nos testes unitários ──────────────────
vi.mock("@/shared/services/rate-limit/rate-limit.service", () => ({
  withRateLimit: vi.fn((bucket, opts, fn) => fn()),
}));

// ─── Mock dos services de IA ─────────────────────────────────────────────────
vi.mock("@/shared/services/ai/ai.service", () => ({
  generateAI: vi.fn().mockResolvedValue({
    content: JSON.stringify({ titulo: "Teste", versiculo: "João 3:16", reflexao: "ok", oracao: "ok", frase_destaque: "ok", topico: "fé" }),
  }),
}));

vi.mock("@/features/estudo/services/estudo.service", () => ({
  generateEstudo: vi.fn().mockResolvedValue({ titulo: "Estudo Teste", secoes: [] }),
}));

vi.mock("@/features/exegese/services/exegese.service", () => ({
  generateExegese: vi.fn().mockResolvedValue({ titulo: "Exegese Teste", contexto_historico: "" }),
}));

vi.mock("@/features/teologia/services/teologia.service", () => ({
  generateTeologia: vi.fn().mockResolvedValue({ titulo: "Teologia Teste", doutrinas: [] }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mockUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
  mockProfileSingle.mockResolvedValue({ data: null });
}

function mockAuthenticated(id = "user-123") {
  mockGetUser.mockResolvedValue({ data: { user: { id } } });
  mockProfileSingle.mockResolvedValue({
    data: { id, role: "user", status: "active", permissions: [] },
  });
}

function makeRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// =============================================================================
// Task 6 — /api/devocional/interativo
// =============================================================================
describe("Task 6 — /api/devocional/interativo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POST sem autenticação retorna 401", async () => {
    mockUnauthenticated();
    const { POST } = await import("@/app/api/devocional/interativo/route");
    const res = await POST(
      makeRequest("http://localhost/api/devocional/interativo", { tipo: "tema", tema: "Fé" }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST autenticado com tema válido retorna 200", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/devocional/interativo/route");
    const res = await POST(
      makeRequest("http://localhost/api/devocional/interativo", { tipo: "tema", tema: "Fé e esperança" }) as any,
    );
    expect(res.status).toBe(200);
  });

  it("POST autenticado com tema vazio retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/devocional/interativo/route");
    const res = await POST(
      makeRequest("http://localhost/api/devocional/interativo", { tipo: "tema", tema: "" }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado com tema muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/devocional/interativo/route");
    const res = await POST(
      makeRequest("http://localhost/api/devocional/interativo", { tipo: "tema", tema: "x".repeat(201) }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado tipo=dia (sem tema) retorna 200", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/devocional/interativo/route");
    const res = await POST(
      makeRequest("http://localhost/api/devocional/interativo", { tipo: "dia" }) as any,
    );
    expect(res.status).toBe(200);
  });
});

// =============================================================================
// Task 7 — /api/estudo
// =============================================================================
describe("Task 7 — /api/estudo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POST sem autenticação retorna 401", async () => {
    mockUnauthenticated();
    const { POST } = await import("@/app/api/estudo/route");
    const res = await POST(
      makeRequest("http://localhost/api/estudo", { livro: "João", capitulo: 3 }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST autenticado com payload válido retorna 200", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/estudo/route");
    const res = await POST(
      makeRequest("http://localhost/api/estudo", { livro: "João", capitulo: 3 }) as any,
    );
    expect(res.status).toBe(200);
  });

  it("POST autenticado com texto muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/estudo/route");
    const res = await POST(
      makeRequest("http://localhost/api/estudo", { texto: "x".repeat(5001) }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado com livro muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/estudo/route");
    const res = await POST(
      makeRequest("http://localhost/api/estudo", { livro: "x".repeat(101) }) as any,
    );
    expect(res.status).toBe(400);
  });
});

// =============================================================================
// Task 8 — /api/exegese
// =============================================================================
describe("Task 8 — /api/exegese", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POST sem autenticação retorna 401", async () => {
    mockUnauthenticated();
    const { POST } = await import("@/app/api/exegese/route");
    const res = await POST(
      makeRequest("http://localhost/api/exegese", { livro: "João", capitulo: 3, versiculo: 16 }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST autenticado com payload válido retorna 200", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/exegese/route");
    const res = await POST(
      makeRequest("http://localhost/api/exegese", { livro: "João", capitulo: 3, versiculo: 16 }) as any,
    );
    expect(res.status).toBe(200);
  });

  it("POST autenticado com texto muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/exegese/route");
    const res = await POST(
      makeRequest("http://localhost/api/exegese", { texto: "x".repeat(5001) }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado com livro muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/exegese/route");
    const res = await POST(
      makeRequest("http://localhost/api/exegese", { livro: "x".repeat(101) }) as any,
    );
    expect(res.status).toBe(400);
  });
});

// =============================================================================
// Task 9 — /api/teologia
// =============================================================================
describe("Task 9 — /api/teologia", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POST sem autenticação retorna 401", async () => {
    mockUnauthenticated();
    const { POST } = await import("@/app/api/teologia/route");
    const res = await POST(
      makeRequest("http://localhost/api/teologia", { livro: "Romanos", capitulo: 8 }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST autenticado com payload válido retorna 200", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/teologia/route");
    const res = await POST(
      makeRequest("http://localhost/api/teologia", { livro: "Romanos", capitulo: 8 }) as any,
    );
    expect(res.status).toBe(200);
  });

  it("POST autenticado com texto muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/teologia/route");
    const res = await POST(
      makeRequest("http://localhost/api/teologia", { texto: "x".repeat(5001) }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado com livro muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/teologia/route");
    const res = await POST(
      makeRequest("http://localhost/api/teologia", { livro: "x".repeat(101) }) as any,
    );
    expect(res.status).toBe(400);
  });
});

// =============================================================================
// Task 10 — /api/homenagens/reescrever
// =============================================================================
describe("Task 10 — /api/homenagens/reescrever", () => {
  beforeEach(() => vi.clearAllMocks());

  it("POST sem autenticação retorna 401", async () => {
    mockUnauthenticated();
    const { POST } = await import("@/app/api/homenagens/reescrever/route");
    const res = await POST(
      makeRequest("http://localhost/api/homenagens/reescrever", { texto: "Mensagem de homenagem" }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST autenticado com texto válido retorna 200", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/homenagens/reescrever/route");
    const res = await POST(
      makeRequest("http://localhost/api/homenagens/reescrever", { texto: "Mensagem de homenagem" }) as any,
    );
    expect(res.status).toBe(200);
  });

  it("POST autenticado sem texto retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/homenagens/reescrever/route");
    const res = await POST(
      makeRequest("http://localhost/api/homenagens/reescrever", { texto: "" }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado com texto muito longo retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/homenagens/reescrever/route");
    const res = await POST(
      makeRequest("http://localhost/api/homenagens/reescrever", { texto: "x".repeat(3001) }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST autenticado sem campo texto retorna 400", async () => {
    mockAuthenticated();
    const { POST } = await import("@/app/api/homenagens/reescrever/route");
    const res = await POST(
      makeRequest("http://localhost/api/homenagens/reescrever", {}) as any,
    );
    expect(res.status).toBe(400);
  });
});
