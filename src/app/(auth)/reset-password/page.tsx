"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas nao coincidem."); return; }
    if (password.length < 8) { setError("A senha deve ter no minimo 8 caracteres."); return; }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Erro ao redefinir senha. O link pode ter expirado. Solicite um novo.");
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-8">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Nova Senha
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="password">Nova senha</label>
          <input id="password" type="password" className="input-field" placeholder="Minimo 8 caracteres"
            value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirmar nova senha</label>
          <input id="confirm" type="password" className="input-field" placeholder="Repita a nova senha"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        {error && <p className="error-text text-center">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Salvando..." : "Redefinir Senha"}
        </button>
      </form>
    </div>
  );
}
