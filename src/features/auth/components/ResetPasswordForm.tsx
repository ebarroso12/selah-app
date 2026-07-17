"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/auth.schema";
import { resetPassword } from "../services/auth.service";
import { createClient } from "@/shared/services/supabase/supabase.client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const supabase = createClient();
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (tokenHash && type === "recovery") {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }).then(({ error }) => {
        if (error) setVerifyError("Link inválido ou expirado. Solicite um novo link de recuperação.");
        setVerifying(false);
      });
    } else {
      setTimeout(() => setVerifying(false), 500);
    }
  }, [searchParams]);

  async function onSubmit(data: ResetPasswordInput) {
    const result = await resetPassword(data);
    if (!result.ok) {
      setError("password", { message: "Erro ao redefinir senha. O link pode ter expirado. Solicite um novo." });
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/home"), 2000);
    }
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-8">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Nova Senha
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>Senha redefinida!</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Redirecionando para o app...
          </p>
        </div>
      ) : verifying ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Verificando link...</p>
        </div>
      ) : verifyError ? (
        <div className="text-center space-y-4">
          <p className="error-text">{verifyError}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label" htmlFor="password">Nova senha</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            {errors.password && <p className="error-text mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="confirm_password">Confirmar nova senha</label>
            <input
              id="confirm_password"
              type="password"
              className="input-field"
              placeholder="Repita a nova senha"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="error-text mt-1">{errors.confirm_password.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Redefinir Senha"}
          </button>
        </form>
      )}
    </div>
  );
}
