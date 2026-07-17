"use client";

import { useMemo, useState } from "react";
import type { UserBudgetRow } from "@/features/admin/services/ai-budget-admin.service";
import { UserLimitDialog } from "./UserLimitDialog";

interface Props {
  rows: UserBudgetRow[];
  defaultBudgetBrl: number;
}

type Filter = "all" | "ok" | "warn" | "blocked";
type SortKey = "fullName" | "costBrl" | "pctUsed";

function fmtBrl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const STATUS_COLOR: Record<UserBudgetRow["status"], string> = {
  ok: "#34d399",
  warn: "#c9a227",
  blocked: "#ef4444",
};

export function UserBudgetTable({ rows, defaultBudgetBrl }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("costBrl");
  const [sortDesc, setSortDesc] = useState(true);
  const [editing, setEditing] = useState<UserBudgetRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (q && !r.fullName.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q))
        return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDesc ? -cmp : cmp;
    });
    return out;
  }, [rows, search, filter, sortKey, sortDesc]);

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDesc(!sortDesc);
    else {
      setSortKey(k);
      setSortDesc(true);
    }
  }

  function sortIcon(k: SortKey) {
    if (k !== sortKey) return null;
    return sortDesc ? " ↓" : " ↑";
  }

  return (
    <>
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Usuários
          </p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Buscar nome ou email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-sm"
              style={{ width: 200 }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="input-field text-sm"
            >
              <option value="all">Todos</option>
              <option value="ok">Dentro do limite</option>
              <option value="warn">Próximos (≥80%)</option>
              <option value="blocked">Estourados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Orçamento por usuário">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  className="text-left py-2 px-2 cursor-pointer select-none"
                  aria-sort={sortKey === "fullName" ? (sortDesc ? "descending" : "ascending") : "none"}
                  onClick={() => toggleSort("fullName")}
                >
                  Nome{sortIcon("fullName")}
                </th>
                <th className="text-right py-2 px-2">Limite</th>
                <th
                  className="text-right py-2 px-2 cursor-pointer select-none"
                  aria-sort={sortKey === "costBrl" ? (sortDesc ? "descending" : "ascending") : "none"}
                  onClick={() => toggleSort("costBrl")}
                >
                  Usado{sortIcon("costBrl")}
                </th>
                <th className="text-right py-2 px-2">Tokens</th>
                <th
                  className="text-right py-2 px-2 cursor-pointer select-none"
                  aria-sort={sortKey === "pctUsed" ? (sortDesc ? "descending" : "ascending") : "none"}
                  onClick={() => toggleSort("pctUsed")}
                >
                  %{sortIcon("pctUsed")}
                </th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="text-right py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.userId} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2 px-2">
                      <p style={{ color: "var(--text)" }}>{r.fullName}</p>
                      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        {r.email}
                      </p>
                    </td>
                    <td className="text-right py-2 px-2">{fmtBrl(r.limitBrl + r.bonusBrl)}</td>
                    <td className="text-right py-2 px-2">{fmtBrl(r.costBrl)}</td>
                    <td className="text-right py-2 px-2">{fmtTokens(r.tokensUsed)}</td>
                    <td className="text-right py-2 px-2">{r.pctUsed.toFixed(0)}%</td>
                    <td className="text-center py-2 px-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: `${STATUS_COLOR[r.status]}20`,
                          color: STATUS_COLOR[r.status],
                          border: `1px solid ${STATUS_COLOR[r.status]}40`,
                        }}
                      >
                        {r.status === "ok"
                          ? "✓ ok"
                          : r.status === "warn"
                          ? "⚠ alerta"
                          : "⛔ bloqueado"}
                      </span>
                    </td>
                    <td className="text-right py-2 px-2">
                      <button
                        onClick={() => setEditing(r)}
                        className="text-xs underline"
                        style={{ color: "var(--gold)" }}
                      >
                        editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <UserLimitDialog
          user={editing}
          defaultBudgetBrl={defaultBudgetBrl}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
