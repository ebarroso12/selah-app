"use client";
import { useSessionTracker } from "@/shared/hooks/useSessionTracker";

/**
 * Componente wrapper que ativa o rastreamento de sessão.
 * Deve ser incluído no layout do app (área autenticada).
 */
export default function SessionTracker() {
  useSessionTracker();
  return null;
}
