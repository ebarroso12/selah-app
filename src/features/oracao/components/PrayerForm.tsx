"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/services/supabase/supabase.client";
import { Card } from "@/shared/components/ui/card";
import { useCreatePrayer } from "../hooks/useCreatePrayer";

export function PrayerForm() {
  const router = useRouter();
  const { create, loading } = useCreatePrayer();
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [sent, setSent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) {
      setValidationError("Descreva seu pedido com pelo menos 10 caracteres.");
      return;
    }

    setValidationError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setValidationError("Sessão expirada. Faça login novamente.");
      return;
    }

    const result = await create({
      user_id: user.id,
      text: text.trim(),
      is_public: isPublic,
    });

    if (result) {
      setSent(true);
      router.refresh();
    }
  }

  if (sent) {
    return (
      <Card className="p-6 text-center">
        <div
          className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm mb-2" style={{ color: "#34d399", fontFamily: "var(--font-cinzel)" }}>
          Pedido Registrado
        </p>
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          A comunidade do SELAH estará intercedendo por você.
        </p>
        <button
          className="btn-ghost w-full mt-4 text-sm"
          onClick={() => { setSent(false); setText(""); }}
        >
          Novo Pedido
        </button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <div>
        <label className="label" htmlFor="prayer-text">Pedido de Oração</label>
        <textarea
          id="prayer-text"
          className="input-field resize-none"
          rows={5}
          placeholder="Compartilhe o que está em seu coração..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <button
        type="button"
        onClick={() => setIsPublic((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all"
        style={{
          background: isPublic ? "rgba(201,162,39,0.06)" : "var(--bg-2)",
          border: `1px solid ${isPublic ? "rgba(201,162,39,0.3)" : "var(--bg-2)"}`,
        }}
      >
        <span
          style={{
            color: isPublic ? "#c9a227" : "var(--text-subtle)",
            fontFamily: "var(--font-cinzel)",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
          }}
        >
          {isPublic ? "Pedido Público" : "Pedido Privado"}
        </span>
        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
          {isPublic ? "Visível à comunidade" : "Apenas para você"}
        </span>
      </button>

      {validationError && <p className="error-text">{validationError}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar Pedido"}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
        Você também pode enviar via WhatsApp no número oficial do SELAH.
      </p>
    </form>
  );
}
