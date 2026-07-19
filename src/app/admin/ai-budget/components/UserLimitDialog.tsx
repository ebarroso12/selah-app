"use client";

import { useState } from "react";
import type { UserBudgetRow } from "@/features/admin/services/ai-budget-admin.service";

interface Props {
  user: UserBudgetRow;
  defaultBudgetBrl: number;
  onClose: () => void;
}

export function UserLimitDialog({ user, defaultBudgetBrl, onClose }: Props) {
  const [limit, setLimit] = useState<string>(
    user.limitBrl === defaultBudgetBrl ? "" : String(user.limitBrl)
  );
  const [bonus, setBonus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveLimit() {
    setSaving(true);
    setError(null);
    try {
      const limitBrl = limit.trim() === "" ? null : Number(limit);
      const res = await fetch(`/api/admin/ai-budget/users/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limitBrl }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro");

      if (bonus.trim() !== "" && Number(bonus) > 0) {
        const r2 = await fetch(`/api/admin/ai-budget/users/${user.userId}/bonus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountBrl: Number(bonus) }),
        });
        if (!r2.ok) throw new Error((await r2.json()).error ?? "Erro no bonus");
      }

      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setSaving(false);
    }
  }

  async function resetBudget() {
    if (!confirm(`Zerar o saldo de ${user.fullName}? Essa ação não pode ser desfeita.`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ai-budget/users/${user.userId}/reset`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao resetar");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setSaving(false);
    }
  }

  const effectiveLimit =
    (limit.trim() === "" ? defaultBudgetBrl : Number(limit)) +
    user.bonusBrl +
    (Number(bonus) || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2
          className="text-lg mb-1"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)" }}
        >
          {user.fullName}
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-subtle)" }}>{user.email}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--gold-label)" }}>
              Limite mensal (R$) — vazio = default global
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Default: R$ ${defaultBudgetBrl.toFixed(2)}`}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--gold-label)" }}>
              Adicionar crédito bonus (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="input-field mt-1"
            />
            {user.bonusBrl > 0 && (
              <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
                Bonus atual: R$ {user.bonusBrl.toFixed(2)}
              </p>
            )}
          </div>

          <div
            className="p-3 rounded-md"
            style={{
              background: "rgba(184,115,51,0.06)",
              border: "1px solid rgba(184,115,51,0.2)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Limite efetivo:{" "}
              <strong style={{ color: "var(--gold)" }}>R$ {effectiveLimit.toFixed(2)}</strong>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Usado: R$ {user.costBrl.toFixed(2)} ({user.pctUsed.toFixed(0)}%)
            </p>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={resetBudget}
              disabled={saving}
              className="text-xs"
              style={{ color: "#ef4444" }}
            >
              Resetar saldo
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary py-2 px-4">
                Cancelar
              </button>
              <button onClick={saveLimit} disabled={saving} className="btn-primary py-2 px-4">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
