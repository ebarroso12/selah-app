import { createClient } from "@/shared/services/supabase/supabase.client";
import { IntegrationError } from "@/shared/lib/errors";
import type { Homenagem } from "../types";

export const homenagensService = {
  async listApproved(limit = 20): Promise<Homenagem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("homenagens")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as Homenagem[];
  },

  async rewrite(texto: string): Promise<string> {
    const res = await fetch("/api/homenagens/reescrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });

    if (!res.ok) throw new IntegrationError("Erro ao reescrever texto com IA.");

    const data = await res.json();
    if (!data.texto) throw new IntegrationError("Resposta da IA inválida.");
    return data.texto as string;
  },
};
