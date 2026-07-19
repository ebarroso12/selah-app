"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth.schema";
import { requestPasswordReset } from "../services/auth.service";
import { SelahLogo } from "@/shared/components/brand/SelahLogo";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    const result = await requestPasswordReset(data);
    if (!result.ok) {
      setError("email", { message: "Erro ao enviar email. Verifique o endereço e tente novamente." });
    } else {
      setSubmittedEmail(data.email);
      setSent(true);
    }
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-8">
        <SelahLogo size={56} className="mx-auto mb-3" />
        <p className="selah-wordmark mb-1">SELAH</p>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Recuperar Senha
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "1rem" }}>
            Email enviado!
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Verifique sua caixa de entrada em{" "}
            <strong style={{ color: "var(--text)" }}>{submittedEmail}</strong>{" "}
            e siga as instruções para redefinir sua senha.
          </p>
          <Link href="/login" className="btn-outline w-full block text-center mt-4">
            Voltar ao Login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Informe seu email cadastrado e enviaremos um link para redefinir sua senha.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && <p className="error-text mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>
          </form>
          <Link
            href="/login"
            className="block mt-4 text-center text-sm"
            style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
          >
            Voltar ao Login
          </Link>
        </>
      )}
    </div>
  );
}
