"use client";

import type { OverviewStats } from "@/features/admin/services/ai-budget-admin.service";

interface Props { overview: OverviewStats; }

function formatBrl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function BudgetOverviewCards({ overview }: Props) {
  const cards = [
    { label: "Tokens", value: formatTokens(overview.totalTokens), sub: "no período" },
    { label: "Gasto", value: formatBrl(overview.totalCostBrl), sub: "no período" },
    { label: "Usuários", value: `${overview.activeUsers}/${overview.totalUsers}`, sub: "ativos" },
    {
      label: "Top usuário",
      value: overview.topUser?.fullName ?? "—",
      sub: overview.topUser ? formatBrl(overview.topUser.costBrl) : "sem dados",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            {c.label}
          </p>
          <p
            className="text-2xl"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
          >
            {c.value}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
