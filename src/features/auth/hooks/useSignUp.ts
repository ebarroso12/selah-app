"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../services/auth.service";
import type { SignUpInput } from "../schemas/auth.schema";

export interface UseSignUpReturn {
  submit: (input: SignUpInput) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useSignUp(): UseSignUpReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: SignUpInput) => {
      setError(null);
      setLoading(true);

      try {
        const result = await signUp({
          email: input.email,
          password: input.password,
          full_name: input.full_name,
        });

        if (!result.ok) {
          setError(result.error ?? "Erro ao criar conta.");
        } else if (result.error === "login_failed") {
          // Conta criada mas login automático falhou
          router.push("/login?cadastro=ok");
        } else {
          router.push("/home");
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
