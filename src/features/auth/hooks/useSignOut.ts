"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../services/auth.service";

export interface UseSignOutReturn {
  logout: () => Promise<void>;
  loading: boolean;
}

export function useSignOut(): UseSignOutReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { logout, loading };
}
