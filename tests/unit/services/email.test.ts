/**
 * Task 3.3 — Email Service
 */
import { describe, it, expect, vi, afterEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ id: "email-id-123" });

// Mock de classe usando function constructor
vi.mock("resend", () => ({
  Resend: function (this: { emails: { send: typeof mockSend } }) {
    this.emails = { send: mockSend };
  },
}));

describe("Task 3.3 — Email Service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("sem RESEND_API_KEY retorna { ok: false, skipped: true }", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { emailService } = await import("@/shared/services/email/email.service");

    const result = await emailService.send({
      template: "approval",
      to: "user@test.com",
      data: { full_name: "João Silva", email: "user@test.com" },
    });

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("template approval envia com subject correto e ok: true", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const { emailService } = await import("@/shared/services/email/email.service");

    const result = await emailService.send({
      template: "approval",
      to: "user@test.com",
      data: { full_name: "Maria Santos", email: "user@test.com" },
    });

    expect(result.ok).toBe(true);
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0] as Record<string, string>;
    expect(call.subject).toContain("aprovado");
    expect(call.html).toContain("Maria");
  });

  it("template newUser envia para admin (não para o usuário)", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("ADMIN_EMAIL", "admin@selah.app");
    const { emailService } = await import("@/shared/services/email/email.service");

    await emailService.send({
      template: "newUser",
      to: "qualquer@coisa.com",
      data: {
        full_name: "Pedro Costa",
        email: "pedro@test.com",
        church_name: "Igreja Teste",
        city: "Franca",
        state: "SP",
        gender: "male",
        is_legendario: false,
        is_legendario_spouse: false,
      },
    });

    const call = mockSend.mock.calls[0][0] as Record<string, string>;
    expect(call.to).toBe("admin@selah.app");
    expect(call.subject).toContain("Pedro Costa");
  });

  it("template rejection inclui primeiro nome do destinatário", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const { emailService } = await import("@/shared/services/email/email.service");

    await emailService.send({
      template: "rejection",
      to: "user@test.com",
      data: { full_name: "Ana Lima", email: "user@test.com" },
    });

    const call = mockSend.mock.calls[0][0] as Record<string, string>;
    expect(call.html).toContain("Ana");
    expect(call.subject).toContain("cadastro");
  });
});
