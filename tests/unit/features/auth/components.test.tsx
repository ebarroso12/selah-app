/**
 * Task 4.3 — Componentes de auth
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ─── Mock next/navigation ─────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = { get: vi.fn().mockReturnValue(null) };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => mockSearchParams,
}));

// ─── Mock supabase ────────────────────────────────────────────────────────────

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});
const mockFrom = vi.fn();

vi.mock("@/shared/services/supabase/supabase.client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}));

// Mock fetch for signUp
global.fetch = vi.fn();

// ─── Tests: LoginForm ─────────────────────────────────────────────────────────

describe("Task 4.3 — LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos de email e senha", async () => {
    const { LoginForm } = await import("@/features/auth/components/LoginForm");
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("não chama signIn quando email é inválido (senha vazia)", async () => {
    // Com password vazia e email inválido, zod rejeita e signIn não é chamado
    const { LoginForm } = await import("@/features/auth/components/LoginForm");
    render(<LoginForm />);

    // Não preenche nenhum campo — form vazio falha validação
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    // Dá tempo para processamento assíncrono
    await new Promise((r) => setTimeout(r, 100));

    // signIn não deve ter sido chamado porque a validação falhou
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("chama signInWithPassword com dados corretos ao submeter", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { LoginForm } = await import("@/features/auth/components/LoginForm");
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: "Senha1234" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "Senha1234",
      });
    });
  });

  it("exibe mensagem de erro quando login falha", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: "Invalid" } });

    const { LoginForm } = await import("@/features/auth/components/LoginForm");
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorretos/i)).toBeInTheDocument();
    });
  });
});

// ─── Tests: RegisterForm ──────────────────────────────────────────────────────

describe("Task 4.3 — RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos obrigatórios", async () => {
    const { RegisterForm } = await import("@/features/auth/components/RegisterForm");
    render(<RegisterForm />);

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
  });

  it("exibe erro quando senhas não coincidem", async () => {
    const { RegisterForm } = await import("@/features/auth/components/RegisterForm");
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@test.com" } });
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: "Senha1234" } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: "Diferente" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/não coincidem/i)).toBeInTheDocument();
    });
  });

  it("chama fetch para register-direct com dados válidos", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, userId: "new-id" }),
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { RegisterForm } = await import("@/features/auth/components/RegisterForm");
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@test.com" } });
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: "Senha1234" } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: "Senha1234" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/register-direct",
        expect.any(Object),
      );
    });
  });
});
