"use client";

import { useState } from "react";
import { PERMISSIONS, PERMISSION_KEYS, type Permission } from "@/shared/services/auth/permissions";

interface Props {
  userId: string;
  initialPermissions: string[];
  isUserAdmin: boolean;
  disabled?: boolean;
}

export default function PermissionsPanel({ userId, initialPermissions, isUserAdmin, disabled }: Props) {
  const [selected, setSelected] = useState<Set<Permission>>(
    new Set(initialPermissions.filter((p): p is Permission => PERMISSION_KEYS.includes(p as Permission)))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function toggle(p: Permission) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/users/${userId}/permissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: Array.from(selected) }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("✓ Permissões salvas.");
      setTimeout(() => setMsg(""), 3000);
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg("Erro: " + (data.error ?? "falha ao salvar"));
    }
  }

  return (
    <div className="card p-6">
      <p className="text-xs tracking-widest uppercase mb-2"
        style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
        Permissões
      </p>
      <p className="text-xs mb-5" style={{ color: "var(--text-subtle)" }}>
        {isUserAdmin
          ? "Este usuário é administrador — possui todas as permissões automaticamente."
          : "Marque os poderes que este usuário pode exercer no painel admin."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
        {PERMISSION_KEYS.map((key) => {
          const checked = isUserAdmin || selected.has(key);
          return (
            <label key={key}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              style={{
                background: checked ? "rgba(184,115,51,0.08)" : "var(--bg-2)",
                border: `1px solid ${checked ? "rgba(184,115,51,0.3)" : "var(--bg-2)"}`,
                opacity: disabled || isUserAdmin ? 0.7 : 1,
              }}>
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled || isUserAdmin}
                onChange={() => toggle(key)}
                className="mt-1 accent-[#B87333]"
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: checked ? "#B87333" : "var(--text)" }}>
                  {PERMISSIONS[key]}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-subtle)", fontFamily: "monospace" }}>
                  {key}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {msg && (
        <p className="text-xs mb-3" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>
          {msg}
        </p>
      )}

      {!isUserAdmin && (
        <button
          onClick={save}
          disabled={saving || disabled}
          className="btn-primary text-xs px-5 py-2.5"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Salvando..." : "Salvar Permissões"}
        </button>
      )}
    </div>
  );
}
