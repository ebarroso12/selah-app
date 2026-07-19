import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockDeleteUser = vi.fn();

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
      delete: vi.fn().mockReturnThis(),
    })),
    auth: { admin: { deleteUser: vi.fn() } },
  })),
}));

vi.mock("@/features/admin/services/admin.service", () => ({
  adminService: {
    deleteUser: mockDeleteUser,
  },
}));

describe("Security — POST /api/admin/delete-user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST sem sessão retorna 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { POST } = await import("@/app/api/admin/delete-user/route");
    const res = await POST(
      new Request("http://localhost/api/admin/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId: "u1" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("POST com user não-admin retorna 403", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "user", permissions: [] },
    });
    const { POST } = await import("@/app/api/admin/delete-user/route");
    const res = await POST(
      new Request("http://localhost/api/admin/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId: "u2" }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("POST com admin sem userId retorna 400", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "admin", permissions: [] },
    });
    const { POST } = await import("@/app/api/admin/delete-user/route");
    const res = await POST(
      new Request("http://localhost/api/admin/delete-user", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("POST com admin válido retorna 200", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileSingle.mockResolvedValue({
      data: { id: "u1", role: "admin", permissions: [] },
    });
    mockDeleteUser.mockResolvedValue(undefined);
    const { POST } = await import("@/app/api/admin/delete-user/route");
    const res = await POST(
      new Request("http://localhost/api/admin/delete-user", {
        method: "POST",
        body: JSON.stringify({ userId: "u2" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledWith("u2");
  });
});
