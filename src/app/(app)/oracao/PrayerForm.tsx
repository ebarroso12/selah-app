"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PrayerForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("Descreva seu pedido com pelo menos 10 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sessão expirada. Faça login novamente."); setLoading(false); return; }

    const { error: insertError } = await supabase.from("prayer_requests").insert({
      user_id: user.id,
      text: text.trim(),
      is_public: isPublic,
      via_whatsapp: false,
      status: "open",
    });

    if (insertError) {
      setError("Erro ao enviar. Tente novamente.");
    } else {
      setSent(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm mb-2" style={{ color: "#34d399", fontFamily: "var(--font-cinzel)" }}>
          Pedido Registrado
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          A comunidade do SELAH estará intercedendo por você.
        </p>
        <button className="btn-ghost w-full mt-4 text-sm" onClick={() => { setSent(false); setText(""); }}>
          Novo Pedido
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <div>
        <label className="label" htmlFor="prayer-text">Pedido de Oração</label>
        <textarea id="prayer-text" className="input-field resize-none" rows={5}
          placeholder="Compartilhe o que está em seu coração..."
          value={text} onChange={(e) => setText(e.target.value)} required />
      </div>

      <button type="button"
        onClick={() => setIsPublic((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all"
        style={{
          background: isPublic ? "rgba(201,162,39,0.06)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${isPublic ? "rgba(201,162,39,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}>
        <span style={{ color: isPublic ? "#c9a227" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-cinzel)", fontSize: "0.75rem", letterSpacing: "0.08em" }}>
          {isPublic ? "Pedido Público" : "Pedido Privado"}
        </span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {isPublic ? "Visível à comunidade" : "Apenas para você"}
        </span>
      </button>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar Pedido"}
      </button>

      <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-cinzel)" }}>
        Você também pode enviar via WhatsApp no número oficial do SELAH.
      </p>
    </form>
  );
}
