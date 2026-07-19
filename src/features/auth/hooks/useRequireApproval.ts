"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

/**
 * Redireciona para `/pending-approval` se o perfil do usuário não estiver aprovado.
 * Redireciona para `/login` se não houver sessão ativa.
 */
export function useRequireApproval() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (profile && (profile.status === "rejected" || profile.status === "banned")) {
      router.replace(`/login?error=${profile.status}`);
    }
  }, [user, profile, loading, router]);

  return { user, profile, loading };
}
