"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/services/supabase/supabase.client";
import { Card } from "@/shared/components/ui/card";
import { useCreateTestimony } from "../hooks/useCreateTestimony";
import type { TestimonyType } from "../types";

const TYPE_OPTIONS: { value: TestimonyType; label: string }[] = [
  { value: "irmao", label: "Irmão / Irmã da Igreja" },
  { value: "legendario", label: "Legendário" },
  { value: "esposa_legendario", label: "Esposa de Legendário" },
];

export function TestimonyForm() {
  const router = useRouter();
  const { create, loading, error: submitError } = useCreateTestimony();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<TestimonyType>("irmao");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Informe um título para o testemunho.");
      return;
    }
    if (content.trim().length < 50) {
      setValidationError("O testemunho deve ter pelo menos 50 caracteres.");
      return;
    }

    setValidationError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setValidationError("Sessão expirada. Faça login novamente.");
      return;
    }

    const result = await create({ user_id: user.id, title: title.trim(), content: content.trim(), type });
    if (result) {
      setSent(true);
      router.refresh();
    }
  }

  if (sent) {
    return (
      <Card className="p-8 text-center">
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base mb-1" style={{ color: "#34d399", fontFamily: "var(--font-cinzel)" }}>
          Testemunho Recebido
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Seu testemunho será revisado e publicado em breve. Obrigado por edificar a comunidade.
        </p>
        <p className="scripture text-sm mt-4" style={{ color: "var(--text-subtle)" }}>
          &quot;Eles o venceram pela palavra do seu testemunho.&quot; — Ap 12:11
        </p>
      </Card>
    );
  }

  const displayError = validationError ?? submitError;

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="label">Categoria</label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className="text-xs px-4 py-2 rounded-full transition-all"
              style={{
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.05em",
                background: type === opt.value ? "#c9a227" : "var(--bg-2)",
                color: type === opt.value ? "#080d1a" : "var(--text-muted)",
                border: `1px solid ${type === opt.value ? "#c9a227" : "var(--bg-2)"}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="testimony-title">Título</label>
        <input
          id="testimony-title"
          type="text"
          className="input-field"
          placeholder="Um título que resume seu testemunho"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div>
        <label className="label" htmlFor="testimony-content">Testemunho</label>
        <textarea
          id="testimony-content"
          className="input-field resize-none"
          rows={6}
          placeholder="Compartilhe o que Deus fez em sua vida..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
          {content.length} caracteres (mínimo 50)
        </p>
      </div>

      {displayError && <p className="error-text">{displayError}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Enviando..." : "Enviar para Revisão"}
      </button>
    </form>
  );
}
