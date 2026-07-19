/**
 * Email Service — wrapper sobre Resend com templates centralizados.
 *
 * Uso:
 *   import { emailService } from '@/shared/services/email/email.service';
 *   await emailService.send({ template: 'approval', to: user.email, data: { full_name, email } });
 *
 * Sem RESEND_API_KEY: no-op com log de warning (graceful degradation).
 */
import { Resend } from "resend";
import { renderNewUser, type NewUserData } from "./templates/newUser";
import { renderApproval, type ApprovalData } from "./templates/approval";
import { renderRejection, type RejectionData } from "./templates/rejection";

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@selah.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@selah.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://selah.app";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ─── Template union ──────────────────────────────────────────────────────────

type SendOpts =
  | { template: "newUser"; to: string; data: NewUserData }
  | { template: "approval"; to: string; data: ApprovalData }
  | { template: "rejection"; to: string; data: RejectionData };

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

async function send(opts: SendOpts): Promise<SendResult> {
  const resend = getResend();

  if (!resend) {
    console.warn("[email.service] RESEND_API_KEY ausente — email não enviado:", opts.template);
    return { ok: false, skipped: true };
  }

  let subject: string;
  let html: string;
  let to = opts.to;

  switch (opts.template) {
    case "newUser": {
      ({ subject, html } = renderNewUser(opts.data, APP_URL));
      to = ADMIN_EMAIL; // novo cadastro sempre vai pro admin
      break;
    }
    case "approval": {
      ({ subject, html } = renderApproval(opts.data, APP_URL));
      break;
    }
    case "rejection": {
      ({ subject, html } = renderRejection(opts.data, ADMIN_EMAIL));
      break;
    }
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email.service] Falha ao enviar email:", msg);
    return { ok: false, error: msg };
  }
}

export const emailService = { send };
