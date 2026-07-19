import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do Resend ───────────────────────────────────────────────────────────
const { mockEmailsSend } = vi.hoisted(() => {
  const mockEmailsSend = vi.fn();
  return { mockEmailsSend };
});

vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn().mockImplementation(function (this: any) {
    this.emails = { send: mockEmailsSend };
  }),
}));

// Garantir que RESEND_API_KEY existe para os testes principais
vi.stubEnv("RESEND_API_KEY", "test-key");
vi.stubEnv("RESEND_FROM_EMAIL", "noreply@selah.app");
vi.stubEnv("ADMIN_EMAIL", "admin@selah.app");
vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://selah.app");

import { emailService } from "./email.service";

beforeEach(() => vi.clearAllMocks());

// ─── newUser ──────────────────────────────────────────────────────────────────
describe("emailService.send — newUser", () => {
  it("envia email para o admin quando novo usuário se cadastra", async () => {
    mockEmailsSend.mockResolvedValue({ id: "email-1" });

    const result = await emailService.send({
      template: "newUser",
      to: "qualquer@email.com",
      data: {
        full_name: "João Silva",
        email: "joao@email.com",
        church_name: "Casa de Oração Franca",
        city: "Franca",
        state: "SP",
        gender: "male",
        is_legendario: false,
        is_legendario_spouse: false,
      },
    });

    expect(result.ok).toBe(true);
    expect(mockEmailsSend).toHaveBeenCalledOnce();
    const call = mockEmailsSend.mock.calls[0][0];
    expect(call.to).toBe("admin@selah.app");
    expect(call.subject).toContain("João Silva");
  });

  it("inclui dados do usuário no email enviado ao admin", async () => {
    mockEmailsSend.mockResolvedValue({ id: "email-2" });

    await emailService.send({
      template: "newUser",
      to: "qualquer@email.com",
      data: {
        full_name: "Maria Santos",
        email: "maria@email.com",
        church_name: "Igreja Central",
        city: "São Paulo",
        state: "SP",
        gender: "female",
        is_legendario: true,
        is_legendario_spouse: false,
      },
    });

    const call = mockEmailsSend.mock.calls[0][0];
    expect(call.html).toContain("Maria Santos");
    expect(call.html).toContain("Igreja Central");
  });
});

// ─── approval ─────────────────────────────────────────────────────────────────
describe("emailService.send — approval", () => {
  it("envia email de aprovação para o usuário", async () => {
    mockEmailsSend.mockResolvedValue({ id: "email-3" });

    const result = await emailService.send({
      template: "approval",
      to: "joao@email.com",
      data: { full_name: "João Silva", email: "joao@email.com" },
    });

    expect(result.ok).toBe(true);
    expect(mockEmailsSend).toHaveBeenCalledOnce();
    const call = mockEmailsSend.mock.calls[0][0];
    expect(call.to).toBe("joao@email.com");
    expect(call.subject).toContain("aprovado");
    expect(call.html).toContain("João");
  });
});

// ─── rejection ────────────────────────────────────────────────────────────────
describe("emailService.send — rejection", () => {
  it("envia email de rejeição para o usuário", async () => {
    mockEmailsSend.mockResolvedValue({ id: "email-4" });

    const result = await emailService.send({
      template: "rejection",
      to: "joao@email.com",
      data: { full_name: "João Silva", email: "joao@email.com" },
    });

    expect(result.ok).toBe(true);
    expect(mockEmailsSend).toHaveBeenCalledOnce();
    const call = mockEmailsSend.mock.calls[0][0];
    expect(call.to).toBe("joao@email.com");
  });
});

// ─── falhas ───────────────────────────────────────────────────────────────────
describe("emailService.send — falhas", () => {
  it("retorna ok=false quando Resend lança erro", async () => {
    mockEmailsSend.mockRejectedValue(new Error("Resend API error"));

    const result = await emailService.send({
      template: "approval",
      to: "joao@email.com",
      data: { full_name: "João Silva", email: "joao@email.com" },
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Resend API error");
  });
});
