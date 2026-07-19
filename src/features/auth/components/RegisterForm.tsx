"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "../schemas/auth.schema";
import { useSignUp } from "../hooks/useSignUp";
import { signInWithGoogle } from "../services/auth.service";
import { SelahLogo } from "@/shared/components/brand/SelahLogo";

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

export function RegisterForm() {
  const { submit, loading, error } = useSignUp();
  const searchParams = useSearchParams();
  const isInvited = searchParams.get("invite") === "1";
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onGoogle() {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-6">
        <SelahLogo size={56} className="mx-auto mb-3" />
        <p className="selah-wordmark mb-1">SELAH</p>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Criar Conta
        </p>
      </div>

      {isInvited && (
        <div className="mb-5 p-3 rounded-lg text-center text-xs"
          style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)", color: "#c9a227" }}>
          ✨ Você foi convidado para o SELAH! Crie sua conta abaixo ou continue com o Google.
        </div>
      )}

      <button
        type="button"
        onClick={onGoogle}
        disabled={googleLoading}
        className="btn-outline w-full flex items-center justify-center gap-2 mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {googleLoading ? "Redirecionando..." : "Continuar com Google"}
      </button>

      <div className="my-4 flex items-center gap-3">
        <hr className="divider flex-1" />
        <span className="text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>ou</span>
        <hr className="divider flex-1" />
      </div>

      {error && <p className="error-text text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label className="label" htmlFor="full_name">Nome completo *</label>
          <input
            id="full_name"
            type="text"
            className="input-field"
            placeholder="Seu nome completo"
            {...register("full_name")}
          />
          {errors.full_name && <p className="error-text mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="seu@email.com"
            {...register("email")}
          />
          {errors.email && <p className="error-text mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">Senha *</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field pr-11"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && <p className="error-text mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirm_password">Confirmar senha *</label>
          <div className="relative">
            <input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              className="input-field pr-11"
              placeholder="Repita a senha"
              {...register("confirm_password")}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
              aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}>
              {showConfirm ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="error-text mt-1">{errors.confirm_password.message}</p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Já tem acesso?{" "}
        <Link
          href="/login"
          className="font-semibold"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
