"use client";

import { useState } from "react";
import { IntegrationError } from "@/shared/lib/errors";

export interface NewHomenagemFormData {
  autorNome: string;
  autorInstagram: string;
  autorLendarioNumero: string;
  homenageadoNome: string;
  homenageadoParentesco: string;
  homenageadoInstagram: string;
  homenageadoLegendario: boolean;
  texto: string;
  fotos: File[];
  fotoCapa: number;
}

export function useNewHomenagem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(data: NewHomenagemFormData): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("autorNome", data.autorNome);
      formData.append("autorInstagram", data.autorInstagram);
      formData.append("autorLendarioNumero", data.autorLendarioNumero);
      formData.append("homenageadoNome", data.homenageadoNome);
      formData.append("homenageadoParentesco", data.homenageadoParentesco);
      formData.append("homenageadoInstagram", data.homenageadoInstagram);
      formData.append("homenageadoLegendario", String(data.homenageadoLegendario));
      formData.append("texto", data.texto);
      formData.append("fotoCapa", String(data.fotoCapa));
      data.fotos.forEach((f, i) => formData.append(`foto${i}`, f));

      const res = await fetch("/api/homenagens", { method: "POST", body: formData });
      if (!res.ok) throw new IntegrationError("Erro ao salvar homenagem.");
      return true;
    } catch {
      setError("Erro ao publicar homenagem. Tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error };
}
