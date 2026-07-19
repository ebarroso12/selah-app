"use client";

import { useState } from "react";
import type { BudgetSettings } from "@/shared/services/ai-budget";
import { BudgetSettingsForm } from "./BudgetSettingsForm";

interface Props { settings: BudgetSettings; }

export function BudgetSettingsCard({ settings }: Props) {
  const [editing, setEditing] = useState(false);
  const modelsCount = Object.keys(settings.pricing).length;

  return (
    <>
      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Configuração global
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Período: <strong>{settings.resetPeriod === "monthly" ? "Mensal" : "Semanal"}</strong>
            {" · "}
            Default: <strong>R$ {settings.defaultBudgetBrl.toFixed(2)}</strong>
            {" · "}
            Taxa USD→BRL: <strong>{settings.usdToBrl.toFixed(2)}</strong>
            {" · "}
            Modelos: <strong>{modelsCount}</strong>
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="btn-secondary py-2 px-4 text-sm"
        >
          Editar
        </button>
      </div>

      {editing && (
        <BudgetSettingsForm
          initial={settings}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
