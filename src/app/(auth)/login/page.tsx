"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Componente interno que usa useSearchParams — deve estar dentro de <Suspense>
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Faz signOut quando redirecionado por conta banida/rejeitada
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const signout = searchParams.get("signout");

    if (signout === "1") {
      const supabase = createClient();
      supabase.auth.signOut().catch(console.error);
    }

    if (errorParam === "rejected") {
      setError("Acesso não autorizado. Entre em contato com o administrador.");
    } else if (errorParam === "banned") {
      setError("Sua conta foi suspensa. Entre em contato com o administrador.");
    } else if (errorParam === "auth") {
      setError("Erro de autenticação. Tente novamente.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Email ou senha incorretos. Verifique seus dados e tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    const supabase = createClient();
    // Usa a URL atual do navegador para garantir que o redirecionamento volte para o mesmo ambiente
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : 'https://selah-lac.vercel.app/auth/callback';

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <div className="card p-8 glow-gold">
      {/* Logo */}
      <div className="text-center mb-8">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p
          className="text-xs tracking-widest uppercase"
          style={{
            color: "rgba(201,162,39,0.6)",
            fontFamily: "var(--font-cinzel)",
          }}
        >
          Pause · Ore · Cresça
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label" htmlFor="password">
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs"
              style={{
                color: "rgba(201,162,39,0.7)",
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.05em",
              }}
            >
              Esqueceu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field w-full pr-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity"
              style={{ color: "rgba(201,162,39,0.6)" }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <p className="error-text text-center">{error}</p>}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <hr className="divider flex-1" />
        <span
          className="text-xs"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-cinzel)",
          }}
        >
          ou
        </span>
        <hr className="divider flex-1" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <GoogleIcon />
        Continuar com Google
      </button>

      <p
        className="mt-6 text-center text-sm"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Ainda não tem conta?{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors"
          style={{
            color: "rgba(201,162,39,0.85)",
            fontFamily: "var(--font-cinzel)",
            letterSpacing: "0.05em",
          }}
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 glow-gold">
          <div className="text-center mb-8">
            <p className="selah-wordmark mb-1">SELAH</p>
            <p
              className="text-xs tracking-widest uppercase"
              style={{
                color: "rgba(201,162,39,0.6)",
                fontFamily: "var(--font-cinzel)",
              }}
            >
              Pause · Ore · Cresça
            </p>
          </div>
          <div className="flex justify-center py-8">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(201,162,39,0.3)",
                borderTopColor: "#c9a227",
              }}
            />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
