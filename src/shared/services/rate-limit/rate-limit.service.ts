/**
 * Rate Limit Service — persistido em `rate_limits` (DB), não em memória.
 *
 * Uso direto:
 *   const { allowed, remaining } = await checkAndIncrement('kairo:userId', 20, 60_000);
 *
 * Uso via helper:
 *   return withRateLimit('kairo:userId', { max: 20, windowMs: 60_000 }, async () => { ... });
 */
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { NextResponse } from "next/server";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Verifica e incrementa o contador para o bucket dado.
 * @param bucket  Chave única ex: "kairo:userId" ou "register:ip"
 * @param max     Máximo de chamadas na janela
 * @param windowMs Tamanho da janela em ms
 */
export async function checkAndIncrement(
  bucket: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(Math.ceil(now.getTime() / windowMs) * windowMs);
  const resetIso = resetAt.toISOString();

  try {
    const supabase = await createServiceClient();

    const { data: existing } = await supabase
      .from("rate_limits")
      .select("id, count")
      .eq("bucket", bucket)
      .eq("reset_at", resetIso)
      .maybeSingle();

    let count: number;

    if (existing) {
      count = (existing.count ?? 0) + 1;
      await supabase
        .from("rate_limits")
        .update({ count })
        .eq("id", existing.id);
    } else {
      count = 1;
      await supabase.from("rate_limits").insert({
        bucket,
        count: 1,
        reset_at: resetIso,
      });
    }

    const allowed = count <= max;
    const remaining = Math.max(0, max - count);
    return { allowed, remaining, resetAt };
  } catch (err) {
    console.error("[rate-limit] Erro:", err);
    // Fail open — permite a request se o DB falhar
    return { allowed: true, remaining: max, resetAt };
  }
}

/**
 * Wrapper para route handlers: retorna 429 automaticamente se limite excedido.
 */
export async function withRateLimit<T>(
  bucket: string,
  opts: { max: number; windowMs: number },
  fn: () => Promise<T>
): Promise<T | NextResponse> {
  const { allowed, remaining, resetAt } = await checkAndIncrement(
    bucket,
    opts.max,
    opts.windowMs
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Muitas requisições. Aguarde um momento antes de tentar novamente.",
        resetAt: resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(opts.max),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(Math.floor(resetAt.getTime() / 1000)),
          "Retry-After": String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
        },
      }
    );
  }

  return fn();
}
