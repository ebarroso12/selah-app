"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../services/auth.service";
import type { SignInInput } from "../schemas/auth.schema";

export interface UseSignInReturn {
  submit: (input: SignInInput) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useSignIn(): UseSignInReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: SignInInput) => {
      setError(null);
      setLoading(true);

      try {
        const result = await signIn(input);
        if (!result.ok) {
          setError(result.error ?? "Erro ao entrar.");
        } else {
          router.push(result.redirectTo ?? "/home");
          router.refresh();
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return { submit, loading, error };
}
