"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Redireciona para /bem-vindo na primeira vez que o usuário acessa o app.
 * Após a visita inicial a flag fica salva em localStorage e o usuário vai
 * direto para o dashboard nas próximas vezes.
 */
export function FirstVisitRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Só verifica quando está chegando pela raiz (/home)
    if (pathname !== "/home") return;

    const visited = localStorage.getItem("selah_welcomed");
    if (!visited) {
      router.replace("/bem-vindo");
    }
  }, [pathname, router]);

  return null;
}
