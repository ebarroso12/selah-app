"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "../schemas/auth.schema";
import { useSignIn } from "../hooks/useSignIn";
import { signInWithGoogle } from "../services/auth.service";

export function LoginForm() {
  const { submit, loading, error } = useSignIn();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onGoogleLogin() {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-8">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Pause · Ore · Cresça
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className="error-text mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label" htmlFor="password">Senha</label>
            <Link
              href="/forgot-password"
              className="text-xs"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
            >
              Esqueceu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field pr-11"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && <p className="error-text mt-1">{errors.password.message}</p>}
        </div>

        {error && <p className="error-text text-center">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <hr className="divider flex-1" />
        <span className="text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>ou</span>
        <hr className="divider flex-1" />
      </div>

      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={googleLoading}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecionando..." : "Continuar com Google"}
      </button>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Ainda não tem conta?{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
