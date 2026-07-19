/**
 * Task 5.3 — Rota do assistente KAIRO
 * POST /api/ai/kairo
 *
 * - Requer autenticação via Supabase session.
 * - Rate limit: 20 mensagens por minuto por usuário (via tabela rate_limits).
 * - Delega geração ao kairo.service (OpenAI gpt-4o-mini + tracking).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { withRateLimit } from "@/shared/services/rate-limit/rate-limit.service";
import { sendMessage } from "@/features/kairo/services/kairo.service";
import type { KairoMessage } from "@/features/kairo/services/kairo.service";

export async function POST(req: NextRequest) {
  try {
    // Autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Payload
    const body = await req.json();
    const { messages } = body as { messages: KairoMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 });
    }

    // Rate limit: 20 msg/min por usuário
    const bucket = `kairo:${user.id}`;
    const result = await withRateLimit(
      bucket,
      { max: 20, windowMs: 60_000 },
      async () => {
        const { reply } = await sendMessage(messages, user.id);
        return NextResponse.json({ reply });
      },
    );

    return result as NextResponse;
  } catch (err) {
    console.error("[ai/kairo] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
