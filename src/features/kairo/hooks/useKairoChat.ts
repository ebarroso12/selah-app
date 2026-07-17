"use client";

/**
 * Task 5.3 — Hook useKairoChat
 * Gerencia o histórico de mensagens do chat Kairo em estado local.
 */
import { useState, useCallback } from "react";
import type { KairoMessage } from "../services/kairo.service";

const WELCOME_MESSAGE: KairoMessage = {
  role: "assistant",
  content:
    "Olá, que bom ter você aqui. Eu sou KAIRO — o assistente que enfrenta tudo, criado para te acolher, orar com você e caminhar com você à luz da Palavra de Deus. Me conte: o que você está sentindo hoje ou em qual área da sua vida você precisa de direção de Deus?",
};

export interface UseKairoChatReturn {
  messages: KairoMessage[];
  loading: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  reset: () => void;
}

export function useKairoChat(): UseKairoChatReturn {
  const [messages, setMessages] = useState<KairoMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: KairoMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/kairo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.error ?? "Muitas mensagens. Aguarde um momento.");
        return;
      }

      if (!res.ok || !data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Desculpe, não consegui responder agora. Por favor, tente novamente em instantes.",
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Houve um problema de conexão. Verifique sua internet e tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const reset = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  }, []);

  return { messages, loading, error, send, reset };
}
