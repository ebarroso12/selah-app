/**
 * Calcula a janela de orçamento corrente em America/Sao_Paulo (UTC-3).
 * Retorna timestamps UTC equivalentes aos limites BRT.
 *
 * - monthly: dia 1 00:00 BRT → último dia do mês 23:59:59.999 BRT
 * - weekly:  segunda 00:00 BRT → domingo 23:59:59.999 BRT
 */
export type BudgetPeriod = "monthly" | "weekly";

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3

function toBRT(date: Date): Date {
  return new Date(date.getTime() - BRT_OFFSET_MS);
}

function fromBRT(brtDate: Date): Date {
  return new Date(brtDate.getTime() + BRT_OFFSET_MS);
}

export function computePeriod(
  period: BudgetPeriod,
  now: Date = new Date(),
): { start: Date; end: Date } {
  const brt = toBRT(now);

  if (period === "monthly") {
    const startBrt = new Date(Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), 1, 0, 0, 0, 0));
    const endBrt = new Date(Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return {
      start: fromBRT(startBrt),
      end: new Date(fromBRT(endBrt).getTime() - 1),
    };
  }

  const dayOfWeek = brt.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startBrt = new Date(Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate() - daysFromMonday, 0, 0, 0, 0));
  const endBrt = new Date(startBrt.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    start: fromBRT(startBrt),
    end: new Date(fromBRT(endBrt).getTime() - 1),
  };
}
