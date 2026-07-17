/**
 * auth.service.ts — operações de autenticação (client-side safe)
 * Todas as funções usam o browser client do Supabase.
 */
import { createClient } from "@/shared/services/supabase/supabase.client";
import type { AuthResult, SignInResult, SignUpResult } from "../types";
import type { SignInInput, ForgotPasswordInput, ResetPasswordInput } from "../schemas/auth.schema";

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function signIn(input: SignInInput): Promise<SignInResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error: "Email ou senha incorretos. Verifique seus dados e tente novamente." };
  }

  return { ok: true, redirectTo: "/home" };
}

// ─── Sign In with Google ──────────────────────────────────────────────────────

export async function signInWithGoogle(opts?: { redirectTo?: string }): Promise<AuthResult> {
  const supabase = createClient();

  const redirectTo =
    opts?.redirectTo ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export interface SignUpServiceInput {
  email: string;
  password: string;
  full_name: string;
}

/**
 * Registra via `/api/auth/register-direct` (usa Admin API para criar
 * a conta já confirmada) e faz login automático em seguida.
 */
export async function signUp(input: SignUpServiceInput): Promise<SignUpResult> {
  // 1. Criar via API route
  const res = await fetch("/api/auth/register-direct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      full_name: input.full_name,
    }),
  });

  const data: { success?: boolean; userId?: string; error?: string } = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error ?? "Erro ao criar conta" };
  }

  // 2. Login automático
  const supabase = createClient();
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (loginError) {
    // Conta criada mas login falhou — redirecionar para login
    return { ok: true, userId: data.userId, error: "login_failed" };
  }

  return { ok: true, userId: data.userId };
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<AuthResult> {
  const supabase = createClient();

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/reset-password`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
