import { createServiceClient } from "@/lib/supabase/server";

export interface TokenUsageData {
  userId: string;
  apiName: "kairo" | "devocional" | "biblia" | "estudo" | "teologia" | "exegese";
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Registra o consumo de tokens de IA no banco de dados.
 * Fire-and-forget — não bloqueia a resposta ao usuário.
 */
export async function trackTokenUsage(data: TokenUsageData): Promise<void> {
  try {
    const supabase = await createServiceClient();
    await supabase.from("token_usage").insert({
      user_id: data.userId,
      api_name: data.apiName,
      model: data.model,
      prompt_tokens: data.promptTokens,
      completion_tokens: data.completionTokens,
      total_tokens: data.totalTokens,
    });
  } catch (err) {
    // Não bloqueia a resposta principal
    console.error("[token-tracker] Erro ao registrar tokens:", err);
  }
}

export interface SectionInteractionData {
  userId: string;
  section: "kairo" | "biblia" | "estudo" | "teologia" | "exegese" | "oracao" | "devocional";
}

/**
 * Incrementa o contador de interações de uma seção para o usuário no dia atual.
 * Usa upsert para criar ou atualizar o registro do dia.
 */
export async function trackSectionInteraction(data: SectionInteractionData): Promise<void> {
  try {
    const supabase = await createServiceClient();
    const today = new Date().toISOString().split("T")[0];

    const columnMap: Record<string, string> = {
      kairo: "kairo_interactions",
      biblia: "biblia_interactions",
      estudo: "estudo_interactions",
      teologia: "teologia_interactions",
      exegese: "exegese_interactions",
      oracao: "oracao_interactions",
      devocional: "devocional_interactions",
    };

    const column = columnMap[data.section];
    if (!column) return;

    // Tentar incrementar via RPC ou upsert
    const { data: existing } = await supabase
      .from("user_metrics")
      .select("id, " + column)
      .eq("user_id", data.userId)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      const row = existing as unknown as Record<string, unknown>;
      const currentVal = (row[column] as number) ?? 0;
      await supabase
        .from("user_metrics")
        .update({ [column]: currentVal + 1 })
        .eq("id", row["id"] as string);
    } else {
      await supabase.from("user_metrics").insert({
        user_id: data.userId,
        date: today,
        [column]: 1,
      });
    }
  } catch (err) {
    console.error("[token-tracker] Erro ao registrar interação:", err);
  }
}
