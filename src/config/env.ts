/**
 * Fonte única de variáveis de ambiente — validadas com Zod na inicialização.
 *
 * CRÍTICAS (faltando → boot falha com mensagem clara):
 *   Supabase URL/anon, service role, OPENAI_API_KEY
 *
 * OPCIONAIS (faltando → undefined, feature desativada graciosamente):
 *   Resend, Google Calendar, CRON_SECRET, ADMIN_EMAIL
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const clientSchema = z.object({
  /** Supabase REST/realtime endpoint (público) */
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida"),
  /** Supabase anon key (público) */
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória"),
  /** URL base do app */
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  /** VAPID public key para Web Push (opcional) */
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  /** Cron secret exposto ao client (opcional, apenas se necessário) */
  NEXT_PUBLIC_CRON_SECRET: z.string().optional(),
});

const serverSchema = z.object({
  // ── Supabase ────────────────────────────────────────────────────────────
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY é obrigatória"),

  // ── AI providers ────────────────────────────────────────────────────────
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY é obrigatória"),
  /** Base URL customizada para OpenAI-compatible endpoints (opcional) */
  OPENAI_API_BASE: z.string().url().optional(),

  // ── Email — Resend (opcional) ────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // ── Web Push (opcional) ──────────────────────────────────────────────────
  VAPID_PRIVATE_KEY: z.string().optional(),

  // ── Google Calendar (opcional) ───────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),

  // ── Cron & Admin ────────────────────────────────────────────────────────
  CRON_SECRET: z.string().optional(),
  /** Email do admin inicial — preferir role no DB; usado apenas para seed */
  ADMIN_EMAIL: z.string().email().optional(),
});

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function parseClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_CRON_SECRET: process.env.NEXT_PUBLIC_CRON_SECRET,
  });

  if (!result.success) {
    throw new Error(
      `\n❌ Variáveis de ambiente CLIENT inválidas:\n${formatZodError(result.error)}\n`
    );
  }
  return result.data;
}

function parseServerEnv() {
  // Só executa no servidor — evita expor vars secretas ao bundle do cliente
  if (typeof window !== "undefined") {
    // No browser: retorna objeto vazio tipado (não acessa vars de servidor)
    return {} as z.infer<typeof serverSchema>;
  }

  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `\n❌ Variáveis de ambiente SERVER inválidas:\n${formatZodError(result.error)}\n`
    );
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Exported env object
// ---------------------------------------------------------------------------

const clientEnv = parseClientEnv();
const serverEnv = parseServerEnv();

/**
 * Objeto tipado com todas as variáveis de ambiente validadas.
 *
 * ```ts
 * import { env } from '@/config/env';
 * const url = env.NEXT_PUBLIC_SUPABASE_URL; // string
 * const key = env.OPENAI_API_KEY;            // string (server-only)
 * ```
 */
export const env = {
  ...clientEnv,
  ...serverEnv,
} as typeof clientEnv & typeof serverEnv;

// Re-exports convenientes
export type ClientEnv = typeof clientEnv;
export type ServerEnv = typeof serverEnv;
