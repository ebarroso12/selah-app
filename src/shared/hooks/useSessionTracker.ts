"use client";
import { useEffect, useRef } from "react";

/**
 * Hook que rastreia o tempo de sessão do usuário e envia para a API de métricas.
 * Deve ser usado no layout principal do app (após autenticação).
 *
 * @param section - Nome da seção atual (ex: "devocional", "kairo", "biblia")
 */
export function useSessionTracker(section?: string) {
  const startTimeRef = useRef<number>(Date.now());
  const lastSentRef = useRef<number>(Date.now());
  const sectionRef = useRef<string | undefined>(section);

  // Atualizar a seção quando mudar
  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  // Enviar métricas para a API
  const sendMetrics = async (seconds: number, sec?: string) => {
    if (seconds < 5) return; // Ignorar sessões muito curtas
    try {
      await fetch("/api/metrics/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionSeconds: seconds, section: sec }),
      });
    } catch {
      // Silencioso — não bloqueia o usuário
    }
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    lastSentRef.current = Date.now();

    // Enviar a cada 2 minutos (heartbeat)
    const interval = setInterval(() => {
      const now = Date.now();
      const seconds = Math.round((now - lastSentRef.current) / 1000);
      lastSentRef.current = now;
      sendMetrics(seconds, sectionRef.current);
    }, 2 * 60 * 1000);

    // Enviar quando a página for fechada/trocada
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const now = Date.now();
        const seconds = Math.round((now - lastSentRef.current) / 1000);
        lastSentRef.current = now;
        if (seconds >= 5) {
          // Usar sendBeacon para garantir envio mesmo ao fechar aba
          navigator.sendBeacon(
            "/api/metrics/session",
            JSON.stringify({ sessionSeconds: seconds, section: sectionRef.current })
          );
        }
      } else if (document.visibilityState === "visible") {
        lastSentRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Enviar ao desmontar
      const seconds = Math.round((Date.now() - lastSentRef.current) / 1000);
      sendMetrics(seconds, sectionRef.current);
    };
  }, []);
}
