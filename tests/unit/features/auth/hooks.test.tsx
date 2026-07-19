/**
 * Task 4.2 — Hooks de auth
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// ─── Mock next/navigation ────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: mockRefresh }),
}));

// ─── Mock supabase client ────────────────────────────────────────────────────

let authStateCallback: ((event: string, session: unknown) => void) | null = null;

const mockGetUser = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn().mockImplementation((cb: (event: string, session: unknown) => void) => {
  authStateCallback = cb;
  return { data: { subscription: { unsubscribe: vi.fn() } } };
});
const mockFrom = vi.fn();

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Task 4.2 — useSignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  it("loading começa false, vai true durante submit, volta false depois", async () => {
    let resolveSignIn!: () => void;
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => { resolveSignIn = () => resolve({ error: null }); }),
    );

    const { useSignIn } = await import("@/features/auth/hooks/useSignIn");
    const { result } = renderHook(() => useSignIn());

    expect(result.current.loading).toBe(false);

    act(() => { result.current.submit({ email: "u@t.com", password: "12345678" }); });
    await waitFor(() => expect(result.current.loading).toBe(true));

    act(() => resolveSignIn());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("sucesso navega para /home e chama refresh", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { useSignIn } = await import("@/features/auth/hooks/useSignIn");
    const { result } = renderHook(() => useSignIn());

    await act(() => result.current.submit({ email: "u@t.com", password: "Senha123" }));

    expect(mockPush).toHaveBeenCalledWith("/home");
    expect(mockRefresh).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it("erro popula result.current.error", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: "Invalid" } });

    const { useSignIn } = await import("@/features/auth/hooks/useSignIn");
    const { result } = renderHook(() => useSignIn());

    await act(() => result.current.submit({ email: "bad@t.com", password: "wrong" }));

    expect(result.current.error).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("Task 4.2 — useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
  });

  it("começa com loading: true e user: null", async () => {
    // getUser nunca resolve para congelar o estado inicial
    mockGetUser.mockImplementation(() => new Promise(() => {}));

    const { useAuth } = await import("@/features/auth/hooks/useAuth");
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("resolve para user null quando sem sessão", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const { useAuth } = await import("@/features/auth/hooks/useAuth");
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("reage a onAuthStateChange: carrega profile quando user aparece", async () => {
    const fakeUser = { id: "user-123" };
    const fakeProfile = { id: "user-123", full_name: "João", email: "j@t.com" };

    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
    });

    const { useAuth } = await import("@/features/auth/hooks/useAuth");
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Dispara evento de login via callback
    act(() => {
      if (authStateCallback) {
        authStateCallback("SIGNED_IN", { user: fakeUser });
      }
    });

    await waitFor(() => expect(result.current.profile).toEqual(fakeProfile));
    expect(result.current.user).toEqual(fakeUser);
  });
});

describe("Task 4.2 — useSignOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logout chama signOut e redireciona para /login", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const { useSignOut } = await import("@/features/auth/hooks/useSignOut");
    const { result } = renderHook(() => useSignOut());

    await act(() => result.current.logout());

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockRefresh).toHaveBeenCalled();
  });
});

describe("Task 4.2 — useRequireApproval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não redireciona quando status=pending (não exige mais aprovação manual)", async () => {
    const fakeUser = { id: "u1" };
    const fakeProfile = { id: "u1", status: "pending" };

    mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
    });

    const { useRequireApproval } = await import("@/features/auth/hooks/useRequireApproval");
    const { result } = renderHook(() => useRequireApproval());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redireciona para /login com erro quando status=banned", async () => {
    const fakeUser = { id: "u3" };
    const fakeProfile = { id: "u3", status: "banned" };

    mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
    });

    const { useRequireApproval } = await import("@/features/auth/hooks/useRequireApproval");
    renderHook(() => useRequireApproval());

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login?error=banned"));
  });

  it("não redireciona quando status=approved", async () => {
    const fakeUser = { id: "u2" };
    const fakeProfile = { id: "u2", status: "approved" };

    mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeProfile, error: null }),
    });

    const { useRequireApproval } = await import("@/features/auth/hooks/useRequireApproval");
    renderHook(() => useRequireApproval());

    await waitFor(() => expect(mockReplace).not.toHaveBeenCalled());
  });
});
