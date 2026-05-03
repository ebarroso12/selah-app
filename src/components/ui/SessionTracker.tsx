"use client";
import { useSessionTracker } from "@/hooks/useSessionTracker";

/**
 * Componente wrapper que ativa o rastreamento de sessão.
 * Deve ser incluído no layout do app (área autenticada).
 */
export default function SessionTracker() {
  useSessionTracker();
  return null;
}
