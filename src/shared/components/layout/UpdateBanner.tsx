"use client";

import { useState } from "react";
import { useAppUpdate } from "@/shared/hooks/useAppUpdate";

/** Botão flutuante de atualização — visível para TODOS os usuários (inclusive
 * admin) em qualquer tela, desktop ou mobile, sempre que houver uma versão
 * nova publicada em produção. */
export function UpdateBanner() {
  const { latestVersion, updateAvailable, updating, applyUpdate } = useAppUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      className="fixed z-[200] left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0"
      style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
    >
      <div
        className="flex items-center gap-3 rounded-full pl-4 pr-2 py-2 shadow-2xl animate-[kairo-breathe_3.5s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 55%, var(--gold-dark) 100%)",
          border: "1px solid rgba(255,255,255,0.28)",
        }}
      >
        <span style={{ color: "var(--primary-foreground)" }} className="shrink-0">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </span>
        <button
          onClick={applyUpdate}
          disabled={updating}
          className="text-xs font-bold whitespace-nowrap"
          style={{ color: "var(--primary-foreground)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.04em", cursor: "pointer" }}
        >
          {updating ? "Atualizando..." : `Nova versão v${latestVersion} disponível — Atualizar`}
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dispensar"
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs"
          style={{ background: "rgba(0,0,0,0.18)", color: "var(--primary-foreground)", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
