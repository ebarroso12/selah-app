import { describe, it, expect, vi, beforeEach } from "vitest";

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
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  })),
}));

describe("Security — /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET sem sessão retorna 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { GET } = await import("@/app/api/admin/users/route");
    const res = await GET(new Request("http://localhost/api/admin/users"));
    expect(res.status).toBe(401);
  });

  it("GET com user não-admin retorna 403", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "user", permissions: [] },
    });
    const { GET } = await import("@/app/api/admin/users/route");
    const res = await GET(new Request("http://localhost/api/admin/users"));
    expect(res.status).toBe(403);
  });

  it("PATCH sem sessão retorna 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(
      new Request("http://localhost/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId: "x", action: "ban" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("PATCH com user não-admin retorna 403", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "user", permissions: [] },
    });
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(
      new Request("http://localhost/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId: "x", action: "ban" }),
      }),
    );
    expect(res.status).toBe(403);
  });
});
