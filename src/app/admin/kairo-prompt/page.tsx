"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";

const gold = "#B87333";

interface PromptData {
  prompt: string;
  updated_at: string | null;
  is_custom: boolean;
}

export default function KairoPromptPage() {
  const [data, setData] = useState<PromptData | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Painel de teste
  const [testMsg, setTestMsg] = useState("");
  const [testing, setTesting] = useState(false);
  const [testReply, setTestReply] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/kairo-prompt");
    const d = await res.json();
    setData(d);
    setEditValue(d.prompt);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (editValue.trim().length < 50) {
      flash("Prompt muito curto (mínimo 50 caracteres).", false);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/kairo-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: editValue }),
    });
    const d = await res.json();
    setSaving(false);
    if (d.ok) {
      flash("✓ Prompt salvo com sucesso!", true);
      load();
    } else {
      flash(d.error ?? "Erro ao salvar.", false);
    }
  }

  async function reset() {
    if (!confirm("Restaurar o prompt padrão? O prompt personalizado será apagado.")) return;
    setResetting(true);
    await fetch("/api/admin/kairo-prompt", { method: "DELETE" });
    setResetting(false);
    flash("✓ Prompt restaurado ao padrão.", true);
    load();
  }

  async function test() {
    if (!testMsg.trim()) return;
    setTesting(true);
    setTestReply(null);
    setTestError(null);
    const res = await fetch("/api/admin/kairo-prompt/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: editValue, message: testMsg }),
    });
    const d = await res.json();
    setTesting(false);
    if (d.reply) setTestReply(d.reply);
    else setTestError(d.error ?? "Erro no teste.");
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: gold }}>
            Prompt do Kairo
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            Edite e teste o comportamento do assistente Kairo em tempo real.
          </p>
        </div>
        {data?.is_custom && (
          <span className="text-xs px-3 py-1 rounded-full"
            style={{ background: "rgba(184,115,51,0.12)", color: gold, border: "1px solid rgba(184,115,51,0.3)" }}>
            Prompt personalizado ativo
          </span>
        )}
      </div>

      {/* Status */}
      {msg && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{
            background: msg.ok ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
            color: msg.ok ? "#34d399" : "#f87171",
            border: `1px solid ${msg.ok ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
          {msg.text}
        </div>
      )}

      {/* Editor */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p style={{ color: gold, fontFamily: "var(--font-cinzel)", fontSize: "0.8rem", letterSpacing: "0.08em" }}>
            SYSTEM PROMPT
          </p>
          {data?.updated_at && (
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
              Salvo em {new Date(data.updated_at).toLocaleString("pt-BR")}
            </p>
          )}
        </div>

        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={22}
          className="w-full rounded-lg p-4 text-sm font-mono resize-y outline-none"
          style={{
            background: "var(--bg-2)",
            border: "1px solid rgba(184,115,51,0.2)",
            color: "var(--text)",
            lineHeight: 1.7,
          }}
          placeholder="Digite o system prompt do Kairo aqui..."
        />

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={save} disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: "rgba(184,115,51,0.18)",
              border: "1px solid rgba(184,115,51,0.45)",
              color: gold,
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}>
            {saving ? "Salvando..." : "💾 Salvar Prompt"}
          </button>

          <button onClick={reset} disabled={resetting || !data?.is_custom}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: data?.is_custom ? "#f87171" : "var(--text-subtle)",
              cursor: data?.is_custom ? "pointer" : "not-allowed",
            }}>
            {resetting ? "Restaurando..." : "↩ Restaurar Padrão"}
          </button>

          <p className="text-xs ml-auto" style={{ color: "var(--text-subtle)" }}>
            {editValue.length} caracteres
          </p>
        </div>
      </div>

      {/* Painel de Teste */}
      <div className="card p-5 space-y-4" style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
        <p style={{ color: "#a78bfa", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem", letterSpacing: "0.08em" }}>
          🧪 TESTAR PROMPT
        </p>
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          Envia uma mensagem de teste usando o prompt atualmente no editor (não precisa salvar antes).
        </p>

        <textarea
          value={testMsg}
          onChange={(e) => setTestMsg(e.target.value)}
          rows={3}
          className="w-full rounded-lg p-3 text-sm resize-none outline-none"
          placeholder="Digite uma mensagem para testar..."
          style={{
            background: "rgba(139,92,246,0.05)",
            border: "1px solid rgba(139,92,246,0.25)",
            color: "var(--text)",
          }}
        />

        <button onClick={test} disabled={testing || !testMsg.trim()}
          className="px-5 py-2 rounded-lg text-sm font-semibold"
          style={{
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.4)",
            color: "#a78bfa",
            opacity: testing || !testMsg.trim() ? 0.5 : 1,
            cursor: testing || !testMsg.trim() ? "not-allowed" : "pointer",
          }}>
          {testing ? "Testando..." : "▶ Enviar Teste"}
        </button>

        {testError && (
          <div className="p-3 rounded-lg text-sm"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {testError}
          </div>
        )}

        {testReply && (
          <div className="p-4 rounded-lg space-y-2"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs" style={{ color: "#a78bfa", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              KAIRO RESPONDEU:
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--text)" }}>
              {testReply}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
