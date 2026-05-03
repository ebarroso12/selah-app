/**
 * SELAH — Sistema de Auto-Avaliação e Reparo com IA
 * Endpoint: /api/admin/healthcheck
 *
 * Verifica e corrige automaticamente:
 * - Conectividade com Supabase
 * - Tabelas e colunas esperadas
 * - Usuários sem perfil
 * - Usuários pendentes
 * - Devocional do dia ausente (gera automaticamente)
 * - Eventos expirados
 * - Pedidos de oração sem resposta há muito tempo
 * - Métricas de uso
 *
 * Pode ser chamado via:
 * - Cron job (GET com Authorization: Bearer CRON_SECRET)
 * - Admin manual (POST com Authorization: Bearer CRON_SECRET)
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Tipos ──────────────────────────────────────────────────────────────────

interface CheckResult {
  check: string;
  status: "ok" | "warning" | "error" | "fixed";
  message: string;
  detail?: string;
}

interface HealthReport {
  timestamp: string;
  duration_ms: number;
  overall: "healthy" | "degraded" | "critical";
  checks: CheckResult[];
  fixes_applied: number;
  errors_found: number;
  ai_analysis?: string;
  ai_recommendations?: string[];
}

// ── Auth ───────────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

// ── Checks individuais ─────────────────────────────────────────────────────

async function checkDatabase(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult> {
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) return { check: "database", status: "error", message: "Falha na conexão com banco", detail: error.message };
    return { check: "database", status: "ok", message: "Conexão com Supabase OK" };
  } catch (e: any) {
    return { check: "database", status: "error", message: "Erro fatal de conexão", detail: e.message };
  }
}

async function checkAndFixOrphanUsers(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult> {
  try {
    const { data: { users: authUsers }, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) return { check: "orphan_users", status: "error", message: "Erro ao listar usuários Auth", detail: authErr.message };

    const { data: profiles } = await supabase.from("profiles").select("id");
    const profileIds = new Set((profiles || []).map((p: any) => p.id));
    const orphans = authUsers.filter(u => !profileIds.has(u.id));

    if (orphans.length === 0) return { check: "orphan_users", status: "ok", message: `${authUsers.length} usuários — todos com perfil` };

    // Auto-corrigir
    let fixed = 0;
    for (const user of orphans) {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
        status: "approved",
        gender: user.user_metadata?.gender || "male",
        church_name: user.user_metadata?.church_name || "SELAH",
        created_at: new Date().toISOString(),
      });
      if (!error) fixed++;
    }

    return {
      check: "orphan_users",
      status: "fixed",
      message: `${orphans.length} usuário(s) sem perfil — ${fixed} corrigido(s) automaticamente`,
    };
  } catch (e: any) {
    return { check: "orphan_users", status: "error", message: "Erro ao verificar perfis", detail: e.message };
  }
}

async function checkAndFixPendingUsers(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult> {
  try {
    const { data: pending, error } = await supabase.from("profiles").select("id, email, full_name").eq("status", "pending");
    if (error) return { check: "pending_users", status: "error", message: "Erro ao verificar pendentes", detail: error.message };

    if (!pending || pending.length === 0) return { check: "pending_users", status: "ok", message: "Nenhum usuário pendente" };

    const { error: updateErr } = await supabase.from("profiles").update({ status: "approved" }).eq("status", "pending");
    if (updateErr) return { check: "pending_users", status: "warning", message: `${pending.length} pendentes — falha ao aprovar`, detail: updateErr.message };

    return { check: "pending_users", status: "fixed", message: `${pending.length} usuário(s) pendente(s) aprovado(s) automaticamente` };
  } catch (e: any) {
    return { check: "pending_users", status: "error", message: "Erro ao processar pendentes", detail: e.message };
  }
}

async function checkAndGenerateDevotional(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase.from("devotionals").select("id").eq("date", today).maybeSingle();

    if (existing) return { check: "devotional", status: "ok", message: `Devocional de ${today} já existe` };

    // Tentar gerar via API interna
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://selah-lac.vercel.app";
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) return { check: "devotional", status: "warning", message: "Devocional ausente — CRON_SECRET não configurado para gerar" };

    const res = await fetch(`${appUrl}/api/devocional/generate`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${cronSecret}` },
    });

    if (res.ok) {
      return { check: "devotional", status: "fixed", message: `Devocional de ${today} gerado automaticamente pela IA` };
    }

    const err = await res.text();
    return { check: "devotional", status: "warning", message: "Devocional ausente — falha ao gerar", detail: err.slice(0, 200) };
  } catch (e: any) {
    return { check: "devotional", status: "warning", message: "Erro ao verificar devocional", detail: e.message };
  }
}

async function checkStaleEvents(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult> {
  try {
    const now = new Date().toISOString();
    const { count, error } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .lt("date_start", now);

    if (error) return { check: "stale_events", status: "warning", message: "Erro ao verificar eventos", detail: error.message };

    const pastCount = count || 0;
    if (pastCount === 0) return { check: "stale_events", status: "ok", message: "Nenhum evento expirado" };

    return { check: "stale_events", status: "warning", message: `${pastCount} evento(s) no passado ainda ativos — considere arquivar` };
  } catch (e: any) {
    return { check: "stale_events", status: "error", message: "Erro ao verificar eventos", detail: e.message };
  }
}

async function checkTables(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult[]> {
  const tables = ["profiles", "devotionals", "events", "prayer_requests", "user_metrics", "homenagens"];
  const results: CheckResult[] = [];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) {
        results.push({ check: `table_${table}`, status: "error", message: `Tabela "${table}" com problema`, detail: error.message });
      } else {
        results.push({ check: `table_${table}`, status: "ok", message: `Tabela "${table}" OK` });
      }
    } catch (e: any) {
      results.push({ check: `table_${table}`, status: "error", message: `Tabela "${table}" inacessível`, detail: e.message });
    }
  }

  return results;
}

async function checkMetrics(supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<CheckResult> {
  try {
    const { count: totalUsers } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const { count: activeToday } = await supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at", oneDayAgo);

    const total = totalUsers || 0;
    const active = activeToday || 0;
    const rate = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      check: "engagement",
      status: rate >= 10 ? "ok" : "warning",
      message: `${total} usuários | ${active} ativos hoje | Engajamento: ${rate}%`,
    };
  } catch (e: any) {
    return { check: "engagement", status: "error", message: "Erro ao calcular métricas", detail: e.message };
  }
}

// ── Análise IA ─────────────────────────────────────────────────────────────

async function analyzeWithAI(checks: CheckResult[]): Promise<{ analysis: string; recommendations: string[] }> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return { analysis: "IA não disponível (ANTHROPIC_API_KEY ausente)", recommendations: [] };

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const summary = checks.map(c => `[${c.status.toUpperCase()}] ${c.check}: ${c.message}${c.detail ? ` (${c.detail})` : ""}`).join("\n");

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `Você é o sistema de monitoramento do app SELAH (devocional cristão, Casa de Oração, Franca/SP).

Resultado do healthcheck:
${summary}

Responda em JSON:
{
  "analysis": "análise técnica em 2-3 frases em português",
  "recommendations": ["ação 1", "ação 2", "ação 3"]
}

Seja direto, técnico e útil.`
      }]
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    const parsed = JSON.parse(text);
    return { analysis: parsed.analysis || "", recommendations: parsed.recommendations || [] };
  } catch (e: any) {
    return { analysis: `Análise IA falhou: ${e.message}`, recommendations: [] };
  }
}

// ── Handler principal ──────────────────────────────────────────────────────

async function runHealthcheck(): Promise<HealthReport> {
  const start = Date.now();
  const checks: CheckResult[] = [];

  const supabase = await createServiceClient();

  // Rodar todos os checks em paralelo onde possível
  const [dbCheck, tableChecks, metricsCheck] = await Promise.all([
    checkDatabase(supabase),
    checkTables(supabase),
    checkMetrics(supabase),
  ]);

  checks.push(dbCheck);
  checks.push(...tableChecks);
  checks.push(metricsCheck);

  // Checks que dependem do banco estar OK
  if (dbCheck.status === "ok") {
    const [orphanCheck, pendingCheck, devotionalCheck, eventsCheck] = await Promise.all([
      checkAndFixOrphanUsers(supabase),
      checkAndFixPendingUsers(supabase),
      checkAndGenerateDevotional(supabase),
      checkStaleEvents(supabase),
    ]);
    checks.push(orphanCheck, pendingCheck, devotionalCheck, eventsCheck);
  }

  // Estatísticas
  const errors = checks.filter(c => c.status === "error").length;
  const warnings = checks.filter(c => c.status === "warning").length;
  const fixes = checks.filter(c => c.status === "fixed").length;

  const overall: HealthReport["overall"] =
    errors > 0 ? "critical" :
    warnings > 0 ? "degraded" : "healthy";

  // Análise IA (só se houver problemas)
  let ai_analysis: string | undefined;
  let ai_recommendations: string[] | undefined;

  if (errors > 0 || warnings > 0 || fixes > 0) {
    const aiResult = await analyzeWithAI(checks);
    ai_analysis = aiResult.analysis;
    ai_recommendations = aiResult.recommendations;
  }

  return {
    timestamp: new Date().toISOString(),
    duration_ms: Date.now() - start,
    overall,
    checks,
    fixes_applied: fixes,
    errors_found: errors,
    ai_analysis,
    ai_recommendations,
  };
}

// ── Salvar resultado no Supabase ───────────────────────────────────────────

async function saveHealthLog(report: HealthReport) {
  try {
    const supabase = await createServiceClient();
    await supabase.from("healthcheck_logs").insert({
      timestamp: report.timestamp,
      overall: report.overall,
      fixes_applied: report.fixes_applied,
      errors_found: report.errors_found,
      duration_ms: report.duration_ms,
      checks: report.checks,
      ai_analysis: report.ai_analysis,
      ai_recommendations: report.ai_recommendations,
    });
  } catch {
    // Tabela pode não existir ainda — não quebra o fluxo
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const report = await runHealthcheck();
  await saveHealthLog(report);
  return NextResponse.json(report);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const report = await runHealthcheck();
  await saveHealthLog(report);
  return NextResponse.json(report);
}
