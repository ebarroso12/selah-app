#!/usr/bin/env node
/**
 * SELAH — Setup de Produção
 * Execute: node scripts/setup-prod.mjs
 *
 * Este script configura todas as variáveis de ambiente no Vercel
 * e faz o deploy de produção automaticamente.
 */

import { execSync } from "child_process";
import { createInterface } from "readline";
import { writeFileSync } from "fs";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const GOLD = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function title(text) {
  console.log(`\n${GOLD}${BOLD}${text}${RESET}`);
  console.log(`${DIM}${"─".repeat(50)}${RESET}`);
}

function ok(text) { console.log(`${GREEN}✓${RESET} ${text}`); }
function info(text) { console.log(`${DIM}  ${text}${RESET}`); }

function setVercelEnv(key, value) {
  if (!value || value.trim() === "") { info(`${key} ignorado (vazio)`); return; }
  try {
    execSync(`vercel env rm ${key} production --yes 2>/dev/null || true`, { stdio: "pipe" });
    execSync(`vercel env add ${key} production`, {
      input: value.trim() + "\n",
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    ok(`${key} configurado`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  Erro ao configurar ${key}:`, msg.split("\n")[0]);
  }
}

console.log(`\n${GOLD}${BOLD}
 ███████╗███████╗██╗      █████╗ ██╗  ██╗
 ██╔════╝██╔════╝██║     ██╔══██╗██║  ██║
 ███████╗█████╗  ██║     ███████║███████║
 ╚════██║██╔══╝  ██║     ██╔══██║██╔══██║
 ███████║███████╗███████╗██║  ██║██║  ██║
 ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
${RESET}${DIM} Setup de Produção — Dr. Edson Barroso${RESET}\n`);

console.log(`${DIM}Este script configura as variáveis no Vercel e faz o deploy de produção.`);
console.log(`Pressione Enter para pular qualquer campo (pode configurar depois).${RESET}\n`);

// ─── Supabase ────────────────────────────────────────────────────────────────
title("1. SUPABASE");
info("Obtenha em: supabase.com → seu projeto → Settings → API");
const supabaseUrl = await ask("  Project URL: ");
const supabaseAnon = await ask("  Anon (public) key: ");
const supabaseService = await ask("  Service Role key: ");

// ─── Anthropic ───────────────────────────────────────────────────────────────
title("2. ANTHROPIC — Claude AI (Devocionais)");
info("Obtenha em: console.anthropic.com → API Keys");
const anthropicKey = await ask("  API Key (sk-ant-...): ");

// ─── Resend ──────────────────────────────────────────────────────────────────
title("3. RESEND — Emails");
info("Obtenha em: resend.com → API Keys | Domínio verificado em: Domains");
const resendKey = await ask("  API Key (re_...): ");
const resendFrom = await ask("  Email remetente (ex: noreply@selah.app): ");

// ─── Google Calendar ─────────────────────────────────────────────────────────
title("4. GOOGLE CALENDAR");
info("Obtenha em: console.cloud.google.com → Credenciais OAuth 2.0");
info("Refresh token: developers.google.com/oauthplayground");
const googleClientId = await ask("  Client ID: ");
const googleClientSecret = await ask("  Client Secret: ");
const googleRefreshToken = await ask("  Refresh Token: ");
const googleCalendarId = await ask("  Calendar ID (email ou 'primary'): ");

// ─── WhatsApp ────────────────────────────────────────────────────────────────
title("5. WHATSAPP BUSINESS API");
info("Obtenha em: developers.facebook.com → seu app → WhatsApp");
const waToken = await ask("  Token de Acesso: ");
const waPhoneId = await ask("  Phone Number ID: ");

rl.close();

// ─── Configurando no Vercel ──────────────────────────────────────────────────
title("CONFIGURANDO VARIÁVEIS NO VERCEL");

setVercelEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
setVercelEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnon);
setVercelEnv("SUPABASE_SERVICE_ROLE_KEY", supabaseService);
setVercelEnv("ANTHROPIC_API_KEY", anthropicKey);
setVercelEnv("RESEND_API_KEY", resendKey);
setVercelEnv("RESEND_FROM_EMAIL", resendFrom);
setVercelEnv("GOOGLE_CLIENT_ID", googleClientId);
setVercelEnv("GOOGLE_CLIENT_SECRET", googleClientSecret);
setVercelEnv("GOOGLE_REFRESH_TOKEN", googleRefreshToken);
setVercelEnv("GOOGLE_CALENDAR_ID", googleCalendarId);
setVercelEnv("WHATSAPP_TOKEN", waToken);
setVercelEnv("WHATSAPP_PHONE_NUMBER_ID", waPhoneId);

// Também salva localmente
const envLines = [
  `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnon}`,
  `SUPABASE_SERVICE_ROLE_KEY=${supabaseService}`,
  `ANTHROPIC_API_KEY=${anthropicKey}`,
  `RESEND_API_KEY=${resendKey}`,
  `RESEND_FROM_EMAIL=${resendFrom}`,
  `GOOGLE_CLIENT_ID=${googleClientId}`,
  `GOOGLE_CLIENT_SECRET=${googleClientSecret}`,
  `GOOGLE_REFRESH_TOKEN=${googleRefreshToken}`,
  `GOOGLE_CALENDAR_ID=${googleCalendarId}`,
  `WHATSAPP_TOKEN=${waToken}`,
  `WHATSAPP_PHONE_NUMBER_ID=${waPhoneId}`,
].filter((l) => !l.endsWith("="));

writeFileSync(".env.local.new", envLines.join("\n") + "\n");
ok(".env.local.new criado (renomeie para .env.local)");

// ─── Deploy de produção ───────────────────────────────────────────────────────
title("DEPLOY DE PRODUÇÃO");
console.log("Iniciando deploy...\n");

try {
  execSync("vercel --prod --yes", { stdio: "inherit" });
  console.log(`\n${GREEN}${BOLD}Deploy concluído com sucesso!${RESET}`);
  console.log(`\n${GOLD}${BOLD}SELAH está no ar: https://selah-lac.vercel.app${RESET}`);
} catch {
  console.error("\nErro no deploy. Verifique os logs acima.");
}

console.log(`
${DIM}Próximos passos:
  1. Configure Google OAuth no Supabase (Authentication > Providers > Google)
  2. Execute a migration SQL no Supabase SQL Editor
  3. Configure webhook WhatsApp: https://selah-lac.vercel.app/api/whatsapp
  4. Adicione o domínio personalizado no Vercel (Settings > Domains)${RESET}
`);
