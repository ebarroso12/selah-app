/**
 * Task 5.2 — Cron diário do devocional
 *
 * GET/POST /api/ai/devocional/generate
 * Requer header: Authorization: Bearer <CRON_SECRET>
 *
 * Idempotente: se o devocional do dia já existe, retorna 200 com { status: 'already_exists' }.
 */
import { NextRequest, NextResponse } from "next/server";
import { generateAndPersistDaily } from "@/features/devocional/services/devotional.server";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[ai/devocional/generate] CRON_SECRET não configurado");
    return false;
  }
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

async function handle(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const report = await generateAndPersistDaily();
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("[ai/devocional/generate] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar devocional" },
      { status: 500 },
    );
  }
}

// GET — invocado pelo cron job do Vercel (vercel.json)
export async function GET(request: NextRequest) {
  return handle(request);
}

// POST — chamada manual ou via script
export async function POST(request: NextRequest) {
  return handle(request);
}
