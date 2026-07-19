"use client";

import { useState } from "react";
import type { BudgetSettings } from "@/shared/services/ai-budget";

interface Props {
  initial: BudgetSettings;
  onClose: () => void;
}

export function BudgetSettingsForm({ initial, onClose }: Props) {
  const [defaultBudgetBrl, setDefaultBudgetBrl] = useState(initial.defaultBudgetBrl);
  const [resetPeriod, setResetPeriod] = useState(initial.resetPeriod);
  const [usdToBrl, setUsdToBrl] = useState(initial.usdToBrl);
  const [pricingJson, setPricingJson] = useState(JSON.stringify(initial.pricing, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      let pricing;
      try { pricing = JSON.parse(pricingJson); }
      catch { throw new Error("Tabela de preços não é JSON válido"); }

      const res = await fetch("/api/admin/ai-budget/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultBudgetBrl, resetPeriod, usdToBrl, pricing }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");

      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-lg mb-4"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)" }}
        >
          Configuração de orçamento
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--gold-label)" }}>
              Período de reset
            </label>
            <div className="flex gap-3 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={resetPeriod === "monthly"}
                  onChange={() => setResetPeriod("monthly")}
                />
                <span className="text-sm">Mensal</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={resetPeriod === "weekly"}
                  onChange={() => setResetPeriod("weekly")}
                />
                <span className="text-sm">Semanal</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--gold-label)" }}>
              Limite default (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={defaultBudgetBrl}
              onChange={(e) => setDefaultBudgetBrl(Number(e.target.value))}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--gold-label)" }}>
              Taxa USD → BRL
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={usdToBrl}
              onChange={(e) => setUsdToBrl(Number(e.target.value))}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "var(--gold-label)" }}>
              Preços (USD por 1M tokens) — JSON
            </label>
            <textarea
              value={pricingJson}
              onChange={(e) => setPricingJson(e.target.value)}
              rows={8}
              className="input-field mt-1 font-mono text-xs"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="flex gap-2 justify-end pt-4">
            <button onClick={onClose} className="btn-secondary py-2 px-4">Cancelar</button>
            <button onClick={save} disabled={saving} className="btn-primary py-2 px-4">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
