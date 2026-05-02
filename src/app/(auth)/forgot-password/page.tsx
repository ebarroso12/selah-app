"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : 'https://selah-lac.vercel.app/reset-password';

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError("Erro ao enviar email. Verifique o endereço e tente novamente.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-8">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Recuperar Senha
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "1rem" }}>
            Email enviado!
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Verifique sua caixa de entrada em <strong style={{ color: "rgba(255,255,255,0.8)" }}>{email}</strong> e siga as
            instruções para redefinir sua senha.
          </p>
          <Link href="/login" className="btn-outline w-full block text-center mt-4">
            Voltar ao Login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Informe seu email cadastrado e enviaremos um link para redefinir sua senha.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input-field" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <p className="error-text text-center">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Link de Recuperacao"}
            </button>
          </form>
          <Link href="/login" className="block mt-4 text-center text-sm"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
            Voltar ao Login
          </Link>
        </>
      )}
    </div>
  );
}
