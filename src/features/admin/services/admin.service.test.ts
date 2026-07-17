import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks (vi.mock é hoisted — variáveis precisam ser declaradas antes) ─
const { mockFrom, mockSelect, mockUpdate, mockDelete, mockInsert,
        mockCreateUser, mockDeleteUser, mockListUsers } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockInsert = vi.fn();
  const mockFrom = vi.fn(() => ({ select: mockSelect, update: mockUpdate, delete: mockDelete, insert: mockInsert }));
  const mockCreateUser = vi.fn();
  const mockDeleteUser = vi.fn();
  const mockListUsers = vi.fn();
  return { mockFrom, mockSelect, mockUpdate, mockDelete, mockInsert, mockCreateUser, mockDeleteUser, mockListUsers };
});

vi.mock("@/shared/services/supabase/supabase.server", () => ({
  createServiceClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { admin: { createUser: mockCreateUser, deleteUser: mockDeleteUser, listUsers: mockListUsers } },
  }),
}));

import { adminService } from "./admin.service";
import { IntegrationError } from "@/shared/lib/errors";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSelectChain(result: unknown) {
  const chain = {
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (fn: (v: unknown) => unknown) => Promise.resolve(result).then(fn),
  };
  mockSelect.mockReturnValue(chain);
  return chain;
}

function buildUpdateChain(result: unknown) {
  const chain = { eq: vi.fn().mockResolvedValue(result) };
  mockUpdate.mockReturnValue(chain);
  return chain;
}

function buildDeleteChain(result: unknown) {
  const chain = { eq: vi.fn().mockResolvedValue(result) };
  mockDelete.mockReturnValue(chain);
  return chain;
}

beforeEach(() => vi.clearAllMocks());

// ─── listUsers ────────────────────────────────────────────────────────────────
describe("adminService.listUsers", () => {
  it("retorna todos os usuários sem filtro", async () => {
    const users = [{ id: "u1", full_name: "Edson", status: "approved" }];
    buildSelectChain({ data: users, error: null });

    const result = await adminService.listUsers();

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(result).toEqual(users);
  });

  it("filtra por status quando passado", async () => {
    const chain = buildSelectChain({ data: [], error: null });

    await adminService.listUsers("pending");

    expect(chain.eq).toHaveBeenCalledWith("status", "pending");
  });

  it("lança IntegrationError quando supabase falha", async () => {
    buildSelectChain({ data: null, error: { message: "db error" } });

    await expect(adminService.listUsers()).rejects.toThrow(IntegrationError);
  });
});

// ─── updateStatus ─────────────────────────────────────────────────────────────
describe("adminService.updateStatus", () => {
  it("atualiza status para approved", async () => {
    buildUpdateChain({ error: null });

    await expect(adminService.updateStatus("u1", "approved")).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("profiles");
  });

  it("atualiza status para banned", async () => {
    buildUpdateChain({ error: null });

    await expect(adminService.updateStatus("u1", "banned")).resolves.toBeUndefined();
  });

  it("lança IntegrationError quando update falha", async () => {
    buildUpdateChain({ error: { message: "update error" } });

    await expect(adminService.updateStatus("u1", "approved")).rejects.toThrow(IntegrationError);
  });
});

// ─── deleteUser ───────────────────────────────────────────────────────────────
describe("adminService.deleteUser", () => {
  it("deleta perfil e usuário do auth", async () => {
    buildDeleteChain({ error: null });
    mockDeleteUser.mockResolvedValue({ error: null });

    await expect(adminService.deleteUser("u1")).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockDeleteUser).toHaveBeenCalledWith("u1");
  });

  it("lança IntegrationError quando delete do perfil falha", async () => {
    buildDeleteChain({ error: { message: "delete error" } });

    await expect(adminService.deleteUser("u1")).rejects.toThrow(IntegrationError);
  });
});

// ─── inviteUser ───────────────────────────────────────────────────────────────
describe("adminService.inviteUser", () => {
  it("cria novo usuário e perfil quando email não existe", async () => {
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockCreateUser.mockResolvedValue({ data: { user: { id: "new-u1" } }, error: null });
    mockInsert.mockResolvedValue({ error: null });

    const result = await adminService.inviteUser("test@test.com", "Test User");

    expect(result.alreadyExisted).toBe(false);
    expect(result.userId).toBe("new-u1");
  });

  it("aprova perfil existente quando email já existe", async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [{ id: "existing-u1", email: "test@test.com" }] },
      error: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) } as any);

    const result = await adminService.inviteUser("test@test.com", "Test User");

    expect(result.alreadyExisted).toBe(true);
    expect(result.userId).toBe("existing-u1");
  });

  it("lança IntegrationError quando criação de auth user falha", async () => {
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockCreateUser.mockResolvedValue({ data: { user: null }, error: { message: "auth error" } });

    await expect(adminService.inviteUser("test@test.com", "Test")).rejects.toThrow(IntegrationError);
  });
});
