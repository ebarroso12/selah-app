"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // O Supabase envia o link com token_hash e type=recovery na URL
    // O cliente JS do Supabase detecta automaticamente o hash da URL e estabelece a sessão
    const supabase = createClient();

    // Verificar se há token_hash nos search params (link de email)
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (tokenHash && type === "recovery") {
      // Verificar o token e estabelecer sessão
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error }) => {
          if (error) {
            setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
          }
          setVerifying(false);
        });
    } else {
      // Pode vir via hash fragment (#access_token=...) — o Supabase JS trata automaticamente
      // Aguardar um momento para o Supabase processar o hash
      setTimeout(() => setVerifying(false), 500);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return; }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Erro ao redefinir senha. O link pode ter expirado. Solicite um novo.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/home"), 2000);
  }

  const eyeOpen = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const eyeOff = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-8">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Nova Senha
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>Senha redefinida!</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Redirecionando para o app...
          </p>
        </div>
      ) : verifying ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Verificando link...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="password">Nova senha</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} className="input-field w-full pr-12"
                placeholder="Mínimo 8 caracteres"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "rgba(201,162,39,0.6)" }}>
                {showPassword ? eyeOff : eyeOpen}
              </button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirmar nova senha</label>
            <div className="relative">
              <input id="confirm" type={showConfirm ? "text" : "password"} className="input-field w-full pr-12"
                placeholder="Repita a nova senha"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "rgba(201,162,39,0.6)" }}>
                {showConfirm ? eyeOff : eyeOpen}
              </button>
            </div>
          </div>
          {error && <p className="error-text text-center">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir Senha"}
          </button>
        </form>
      )}
    </div>
  );
}
