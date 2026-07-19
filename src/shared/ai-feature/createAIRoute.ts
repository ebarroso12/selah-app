import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrUnauthorized } from "@/shared/services/auth/server";
import { withRateLimit } from "@/shared/services/rate-limit/rate-limit.service";
import { BudgetExceededError } from "@/shared/lib/errors";
import type { AIRouteConfig } from "./types";

const DEFAULT_RATE_LIMIT = { max: 10, windowMs: 60_000 };

/**
 * Cria um POST handler para rotas de IA com auth + rate limit + validação Zod.
 * Substitui o boilerplate idêntico que existia em /api/estudo, /api/exegese, /api/teologia.
 *
 * Mapeia `BudgetExceededError` para HTTP 402 (Payment Required), retornando
 * `{ error, resetAt }`. O catch existe em dois pontos (callback interno e
 * catch externo) porque `withRateLimit` pode propagar exceções do callback
 * de maneiras distintas dependendo da implementação.
 */
export function createAIRoute<TInput, TResult>(
  config: AIRouteConfig<TInput, TResult>,
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => {
    const auth = await requireAuthOrUnauthorized();
    if (auth instanceof NextResponse) return auth;

    try {
      const body = await request.json();
      const parsed = config.schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const limit = config.rateLimit ?? DEFAULT_RATE_LIMIT;
      const response = await withRateLimit(
        `${config.feature}:${auth.user.id}`,
        limit,
        async () => {
          try {
            const result = await config.service(parsed.data, auth.user.id);
            return NextResponse.json(result);
          } catch (error) {
            if (error instanceof BudgetExceededError) {
              return NextResponse.json(
                { error: error.message, resetAt: error.resetAt.toISOString() },
                { status: 402 },
              );
            }
            throw error;
          }
        },
      );
      return response as NextResponse;
    } catch (error) {
      if (error instanceof BudgetExceededError) {
        return NextResponse.json(
          { error: error.message, resetAt: error.resetAt.toISOString() },
          { status: 402 },
        );
      }
      console.error(`[${config.feature}]`, error);
      return NextResponse.json(
        { error: config.errorMessage ?? "Erro ao processar requisição" },
        { status: 500 },
      );
    }
  };
}
