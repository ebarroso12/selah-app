/**
 * Task 4.1 — auth.service + schemas zod
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock supabase browser client ────────────────────────────────────────────

const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

// ─── Mock fetch para signUp ───────────────────────────────────────────────────

global.fetch = vi.fn();

// ─── Tests: auth.service ─────────────────────────────────────────────────────

describe("Task 4.1 — auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── signIn ──
  it("signIn retorna ok: true quando sem erro", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const { signIn } = await import("@/features/auth/services/auth.service");
    const result = await signIn({ email: "user@test.com", password: "12345678" });

    expect(result.ok).toBe(true);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "user@test.com",
      password: "12345678",
    });
  });

  it("signIn retorna ok: false com mensagem quando há erro", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: "Invalid login" } });
    const { signIn } = await import("@/features/auth/services/auth.service");
    const result = await signIn({ email: "bad@test.com", password: "wrongpass" });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("incorretos");
  });

  // ── signOut ──
  it("signOut chama supabase.auth.signOut()", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const { signOut } = await import("@/features/auth/services/auth.service");
    const result = await signOut();

    expect(result.ok).toBe(true);
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  // ── signInWithGoogle ──
  it("signInWithGoogle chama signInWithOAuth com provider google", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const { signInWithGoogle } = await import("@/features/auth/services/auth.service");
    const result = await signInWithGoogle({ redirectTo: "https://app.test/auth/callback" });

    expect(result.ok).toBe(true);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "google" }),
    );
  });

  // ── signUp ──
  it("signUp chama /api/auth/register-direct e depois signInWithPassword", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, userId: "new-user-id" }),
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { signUp } = await import("@/features/auth/services/auth.service");
    const result = await signUp({
      email: "new@test.com",
      password: "Senha1234",
      full_name: "Novo Usuário",
    });

    expect(result.ok).toBe(true);
    expect(result.userId).toBe("new-user-id");
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/register-direct", expect.any(Object));
    expect(mockSignInWithPassword).toHaveBeenCalled();
  });

  it("signUp retorna ok: false quando API falha", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Este email já está cadastrado." }),
    });

    const { signUp } = await import("@/features/auth/services/auth.service");
    const result = await signUp({
      email: "dup@test.com",
      password: "Senha1234",
      full_name: "Dup User",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("cadastrado");
  });

  // ── requestPasswordReset ──
  it("requestPasswordReset chama resetPasswordForEmail", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const { requestPasswordReset } = await import("@/features/auth/services/auth.service");
    const result = await requestPasswordReset({ email: "user@test.com" });

    expect(result.ok).toBe(true);
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "user@test.com",
      expect.any(Object),
    );
  });

  // ── resetPassword ──
  it("resetPassword chama updateUser com nova senha", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    const { resetPassword } = await import("@/features/auth/services/auth.service");
    const result = await resetPassword({ password: "NovaSenha123", confirm_password: "NovaSenha123" });

    expect(result.ok).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "NovaSenha123" });
  });
});

// ─── Tests: schemas zod ───────────────────────────────────────────────────────

describe("Task 4.1 — schemas zod", () => {
  it("signInSchema aceita email e senha válidos", async () => {
    const { signInSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = signInSchema.safeParse({ email: "user@test.com", password: "abc" });
    expect(result.success).toBe(true);
  });

  it("signInSchema rejeita email inválido", async () => {
    const { signInSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = signInSchema.safeParse({ email: "not-an-email", password: "abc" });
    expect(result.success).toBe(false);
  });

  it("signUpSchema rejeita senhas diferentes", async () => {
    const { signUpSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = signUpSchema.safeParse({
      full_name: "João Silva",
      email: "user@test.com",
      password: "Senha1234",
      confirm_password: "Diferente1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("confirm_password");
  });

  it("signUpSchema aceita dados válidos", async () => {
    const { signUpSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = signUpSchema.safeParse({
      full_name: "João Silva",
      email: "user@test.com",
      password: "Senha1234",
      confirm_password: "Senha1234",
    });
    expect(result.success).toBe(true);
  });

  it("signUpSchema rejeita senha com menos de 8 caracteres", async () => {
    const { signUpSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = signUpSchema.safeParse({
      full_name: "João Silva",
      email: "user@test.com",
      password: "1234567",
      confirm_password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("forgotPasswordSchema aceita email válido", async () => {
    const { forgotPasswordSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = forgotPasswordSchema.safeParse({ email: "user@test.com" });
    expect(result.success).toBe(true);
  });

  it("resetPasswordSchema rejeita senhas diferentes", async () => {
    const { resetPasswordSchema } = await import("@/features/auth/schemas/auth.schema");
    const result = resetPasswordSchema.safeParse({
      password: "Senha1234",
      confirm_password: "Diferente",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Tests: profile.service ───────────────────────────────────────────────────

describe("Task 4.1 — profile.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProfile retorna null quando supabase retorna erro", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
    });

    const { getProfile } = await import("@/features/auth/services/profile.service");
    const result = await getProfile("nonexistent-id");
    expect(result).toBeNull();
  });

  it("getProfile retorna profile quando encontrado", async () => {
    const fakeProfile = { id: "user-123", full_name: "João", email: "joao@test.com" };
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
    });

    const { getProfile } = await import("@/features/auth/services/profile.service");
    const result = await getProfile("user-123");
    expect(result).toEqual(fakeProfile);
  });

  it("updateProfile chama supabase.from('profiles').update()", async () => {
    const fakeProfile = { id: "user-123", full_name: "João Atualizado" };
    const mockUpdate = vi.fn().mockReturnThis();
    mockFrom.mockReturnValue({
      update: mockUpdate,
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
    });

    const { updateProfile } = await import("@/features/auth/services/profile.service");
    const result = await updateProfile("user-123", { full_name: "João Atualizado" });

    expect(result.ok).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("profiles");
  });

  it("getMyProfile retorna null quando sem usuário autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { getMyProfile } = await import("@/features/auth/services/profile.service");
    const result = await getMyProfile();
    expect(result).toBeNull();
  });
});
