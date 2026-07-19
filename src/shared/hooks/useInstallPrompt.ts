"use client";

/**
 * Detecta se o app pode ser instalado (Add to Home Screen) e expõe
 * o prompt nativo de instalação do Chrome/Android. No iOS Safari não
 * existe API de prompt — o hook sinaliza `isIOS` para a UI mostrar
 * a instrução manual (Compartilhar → Adicionar à Tela de Início).
 */
import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua) && !/windows phone/i.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const alreadyInstalled = isStandalone || installed;

  return {
    /** true quando o Chrome/Android liberou o prompt nativo de instalação */
    canInstall: !!deferredPrompt && !alreadyInstalled,
    /** true no Safari iOS, onde só existe o fluxo manual de "Adicionar à Tela de Início" */
    isIOS: isIOS && !alreadyInstalled,
    /** true quando o app já está rodando instalado (standalone) */
    alreadyInstalled,
    promptInstall,
  };
}
