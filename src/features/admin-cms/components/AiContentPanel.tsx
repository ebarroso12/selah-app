"use client";

import { useCallback, useEffect, useState } from "react";
import type { CmsAiKind } from "@/features/admin-cms/prompts/cms-ai-prompts";

const VIOLET = "#a78bfa";

interface AiContentPanelProps {
  kind: CmsAiKind;
  /** Nome da marca/pessoa/evento — dá contexto para a IA. */
  name: string;
  /** Site oficial (opcional). */
  url?: string;
  /** Rótulo do botão de aceitar o resultado. */
  acceptLabel?: string;
  /** Recebe os parágrafos gerados quando o admin clica em "Usar este texto". */
  onAccept: (paragraphs: string[]) => void;
}

/**
 * Painel reutilizável de geração de texto com IA para o CMS admin.
 * Usado nos formulários de parceiros, causas sociais e evento em destaque.
 *
 * Fluxo: notas brutas + prompt editável (carregado de app_settings) →
 * /api/admin/cms-ai-generate → preview → aceitar/descartar.
 */
export function AiContentPanel({ kind, name, url, acceptLabel = "Usar este texto", onAccept }: AiContentPanelProps) {
  const [open, setOpen] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadPrompt = useCallback(async () => {
    setLoadingPrompt(true);
    try {
      const res = await fetch(`/api/admin/cms-ai-prompt?kind=${kind}`);
      const d = await res.json();
      if (res.ok) {
        setPrompt(d.prompt ?? "");
        setIsCustom(!!d.is_custom);
      }
    } finally {
      setLoadingPrompt(false);
    }
  }, [kind]);

  useEffect(() => {
    if (open && !prompt) loadPrompt();
  }, [open, prompt, loadPrompt]);

  async function savePrompt() {
    if (prompt.trim().length < 30) {
      flash("Prompt muito curto (mínimo 30 caracteres).", false);
      return;
    }
    setSavingPrompt(true);
    try {
      const res = await fetch("/api/admin/cms-ai-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, prompt }),
      });
      const d = await res.json();
      if (d.ok) {
        setIsCustom(true);
        flash("✓ Prompt padrão salvo!", true);
      } else {
        flash(d.error ?? "Erro ao salvar prompt.", false);
      }
    } finally {
      setSavingPrompt(false);
    }
  }

  async function resetPrompt() {
    if (!confirm("Restaurar o prompt padrão? O prompt personalizado será apagado.")) return;
    await fetch(`/api/admin/cms-ai-prompt?kind=${kind}`, { method: "DELETE" });
    setPrompt("");
    setIsCustom(false);
    await loadPrompt();
    flash("✓ Prompt restaurado ao padrão.", true);
  }

  async function generate() {
    if (rawNotes.trim().length < 10) {
      flash("Cole informações brutas (fatos reais) para a IA usar como base.", false);
      return;
    }
    setGenerating(true);
    setPreview(null);
    try {
      const res = await fetch("/api/admin/cms-ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name, url, rawNotes, promptOverride: prompt || undefined }),
      });
      const d = await res.json();
      if (res.ok && Array.isArray(d.paragraphs)) {
        setPreview(d.paragraphs);
      } else {
        flash(d.error ?? "Erro ao gerar texto.", false);
      }
    } catch (err) {
      flash(err instanceof Error ? err.message : "Erro ao gerar texto.", false);
    } finally {
      setGenerating(false);
    }
  }

  function accept() {
    if (preview) {
      onAccept(preview);
      setPreview(null);
      flash("✓ Texto aplicado ao formulário.", true);
    }
  }

  const box = {
    background: "rgba(139,92,246,0.05)",
    border: "1px solid rgba(139,92,246,0.25)",
    color: "var(--text)",
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: VIOLET }}
      >
        ✨ {open ? "Fechar assistente de IA" : "Melhorar com IA"}
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl space-y-3" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.2)" }}>
          {msg && (
            <div
              className="px-3 py-2 rounded-lg text-xs"
              style={{
                background: msg.ok ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                color: msg.ok ? "#34d399" : "#f87171",
              }}
            >
              {msg.text}
            </div>
          )}

          <div>
            <label className="block mb-1 text-[10px] uppercase tracking-widest" style={{ color: VIOLET }}>
              Informações brutas (fatos reais — a IA nunca inventa)
            </label>
            <textarea
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              rows={5}
              placeholder="Cole aqui informações reais sobre a marca/pessoa/evento: história, credenciais, missão, diferenciais, dados confirmados..."
              className="w-full rounded-lg p-3 text-sm resize-y outline-none"
              style={box}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowPrompt((s) => !s)}
              className="text-[11px] hover:underline"
              style={{ color: "var(--text-subtle)" }}
            >
              {showPrompt ? "▾ Ocultar prompt" : "▸ Ver/editar prompt da IA"} {isCustom ? "(personalizado)" : "(padrão)"}
            </button>

            {showPrompt && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={10}
                  disabled={loadingPrompt}
                  placeholder={loadingPrompt ? "Carregando prompt..." : "Prompt da IA..."}
                  className="w-full rounded-lg p-3 text-xs font-mono resize-y outline-none"
                  style={box}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={savePrompt}
                    disabled={savingPrompt}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: VIOLET }}
                  >
                    {savingPrompt ? "Salvando..." : "💾 Salvar prompt padrão"}
                  </button>
                  <button
                    type="button"
                    onClick={resetPrompt}
                    disabled={!isCustom}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: isCustom ? "#f87171" : "var(--text-subtle)" }}
                  >
                    ↩ Restaurar padrão
                  </button>
                  <span className="text-[10px] ml-auto" style={{ color: "var(--text-subtle)" }}>
                    Placeholders: {"{{name}}"} {"{{url}}"} {"{{rawNotes}}"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="text-sm px-4 py-2 rounded-lg font-semibold"
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.4)",
              color: VIOLET,
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? "Gerando..." : "▶ Gerar texto"}
          </button>

          {preview && (
            <div className="p-3 rounded-lg space-y-2" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: VIOLET }}>
                Preview gerado
              </p>
              {preview.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  {p}
                </p>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={accept}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" }}
                >
                  ✓ {acceptLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
