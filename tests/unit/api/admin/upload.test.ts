import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

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
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

/** Cria um Request com formData() mockado para evitar timeout do JSDOM */
function makeRequestWithFormData(fields: Record<string, string | File>) {
  const formData = new Map(Object.entries(fields));
  const req = {
    formData: async () => ({
      get: (key: string) => formData.get(key) ?? null,
    }),
  };
  return req;
}

describe("Security — POST /api/admin/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/test.jpg" },
    });
  });

  it("POST sem sessão retorna 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { POST } = await import("@/app/api/admin/upload/route");

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/jpeg" }), "test.jpg");

    const request = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(request as any);
    expect(res.status).toBe(401);
  });

  it("POST com user não-admin retorna 403", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "user", permissions: [] },
    });

    const { POST } = await import("@/app/api/admin/upload/route");

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/jpeg" }), "test.jpg");

    const request = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(request as any);
    expect(res.status).toBe(403);
  });

  it("POST com admin e tipo de arquivo inválido retorna 400", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "admin", permissions: [] },
    });

    const { POST } = await import("@/app/api/admin/upload/route");

    // Arquivo PDF com tipo inválido — objeto simples simulando File
    const fakeFile = {
      name: "test.pdf",
      type: "application/pdf",
      size: 100,
      arrayBuffer: async () => new ArrayBuffer(4),
    } as unknown as File;

    const request = makeRequestWithFormData({ file: fakeFile, folder: "misc" });

    const res = await POST(request as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/tipo/i);
  });

  it("POST com folder contendo path traversal sanitiza o caminho", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "admin", permissions: [] },
    });

    const { POST } = await import("@/app/api/admin/upload/route");

    const fakeFile = {
      name: "test.jpg",
      type: "image/jpeg",
      size: 100,
      arrayBuffer: async () => new ArrayBuffer(4),
    } as unknown as File;

    const request = makeRequestWithFormData({
      file: fakeFile,
      folder: "../../etc/passwd",
    });

    const res = await POST(request as any);
    // Deve ter sucesso (200) com folder sanitizado
    expect(res.status).toBe(200);
    // Verifica que o upload foi chamado com caminho sem path traversal
    expect(mockUpload).toHaveBeenCalledOnce();
    const [uploadedPath] = mockUpload.mock.calls[0];
    expect(uploadedPath).not.toContain("..");
  });
});
