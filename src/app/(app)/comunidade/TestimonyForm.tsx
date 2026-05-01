"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TestimonyType = "irmao" | "legendario" | "esposa_legendario";

const TYPE_OPTIONS: { value: TestimonyType; label: string }[] = [
  { value: "irmao", label: "Irmão / Irmã da Igreja" },
  { value: "legendario", label: "Legendário" },
  { value: "esposa_legendario", label: "Esposa de Legendário" },
];

export default function TestimonyForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<TestimonyType>("irmao");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || content.trim().length < 50) {
      setMsg({ type: "err", text: "O testemunho deve ter pelo menos 50 caracteres." });
      return;
    }
    setLoading(true);
    setMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg({ type: "err", text: "Sessão expirada. Faça login novamente." }); setLoading(false); return; }

    const { error } = await supabase.from("testimonies").insert({
      user_id: user.id,
      title,
      content,
      type,
      approved: false,
    });

    if (error) {
      setMsg({ type: "err", text: "Erro ao enviar. Tente novamente." });
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base mb-1" style={{ color: "#34d399", fontFamily: "var(--font-cinzel)" }}>
          Testemunho Recebido
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Seu testemunho será revisado e publicado em breve. Obrigado por edificar a comunidade.
        </p>
        <p className="scripture text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          &quot;Eles o venceram pela palavra do seu testemunho.&quot; — Ap 12:11
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="label">Categoria</label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => setType(opt.value)}
              className="text-xs px-4 py-2 rounded-full transition-all"
              style={{
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.05em",
                background: type === opt.value ? "#c9a227" : "rgba(255,255,255,0.04)",
                color: type === opt.value ? "#080d1a" : "rgba(255,255,255,0.5)",
                border: `1px solid ${type === opt.value ? "#c9a227" : "rgba(255,255,255,0.1)"}`,
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="testimony-title">Título</label>
        <input id="testimony-title" type="text" className="input-field"
          placeholder="Um título que resume seu testemunho"
          value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
      </div>

      <div>
        <label className="label" htmlFor="testimony-content">Testemunho</label>
        <textarea id="testimony-content" className="input-field resize-none" rows={6}
          placeholder="Compartilhe o que Deus fez em sua vida..."
          value={content} onChange={(e) => setContent(e.target.value)} required minLength={50} />
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {content.length} caracteres (mínimo 50)
        </p>
      </div>

      {msg && (
        <p className="text-sm" style={{ color: msg.type === "ok" ? "#34d399" : "#f87171" }}>
          {msg.text}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Enviando..." : "Enviar para Revisão"}
      </button>
    </form>
  );
}
