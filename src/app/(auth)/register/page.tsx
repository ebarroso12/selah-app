"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.full_name.trim()) return "Informe seu nome completo.";
    if (!form.email.trim()) return "Informe seu email.";
    if (form.password.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (form.password !== form.confirm_password) return "As senhas não coincidem.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);

    try {
      // 1. Criar conta via API direta (pula confirmação de email)
      const res = await fetch("/api/auth/register-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      // 2. Fazer login automático após criar conta
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (loginError) {
        console.error("[register] Erro no login automático:", loginError.message);
        router.push("/login?cadastro=ok");
        return;
      }

      // 3. Sucesso -> Home
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
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
      <div className="text-center mb-6">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Criar Conta
        </p>
      </div>

      {error && <p className="error-text text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="full_name">Nome completo *</label>
          <input id="full_name" type="text" className="input-field" placeholder="Seu nome completo"
            value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input id="email" type="email" className="input-field" placeholder="seu@email.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Senha *</label>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} className="input-field w-full pr-12"
              placeholder="Mínimo 8 caracteres"
              value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: "rgba(201,162,39,0.6)" }} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showPassword ? eyeOff : eyeOpen}
            </button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="confirm_password">Confirmar senha *</label>
          <div className="relative">
            <input id="confirm_password" type={showConfirmPassword ? "text" : "password"} className="input-field w-full pr-12"
              placeholder="Repita a senha"
              value={form.confirm_password} onChange={(e) => set("confirm_password", e.target.value)} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: "rgba(201,162,39,0.6)" }} aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showConfirmPassword ? eyeOff : eyeOpen}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Já tem acesso?{" "}
        <Link href="/login" className="font-semibold"
          style={{ color: "rgba(201,162,39,0.85)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
