"use client";

/**
 * Detecta quando há uma nova versão do app publicada.
 *
 * Compara a versão embutida no bundle (APP_VERSION, congelada no build)
 * com a versão retornada por /api/version (sempre a do último deploy).
 * Verifica ao montar, quando o app volta ao primeiro plano e a cada 5 min.
 */
import { useCallback, useEffect, useState } from "react";
import { APP_VERSION } from "@/config/version";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function useAppUpdate() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      if (!res.ok) return;
      const { version } = (await res.json()) as { version?: string };
      if (version) setLatestVersion(version);
    } catch {
      // offline ou erro transitório — tenta de novo no próximo ciclo
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  const updateAvailable =
    latestVersion !== null && latestVersion !== APP_VERSION;

  /** Limpa caches locais e recarrega o app já na versão nova. */
  const applyUpdate = useCallback(async () => {
    setUpdating(true);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
    } catch {
      // mesmo se a limpeza falhar, o reload busca o bundle novo
    }
    window.location.reload();
  }, []);

  return { currentVersion: APP_VERSION, latestVersion, updateAvailable, updating, applyUpdate };
}
