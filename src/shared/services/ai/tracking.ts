import type { AiFeature, AiProvider } from "@/types/database";

export interface TrackAiUsageData {
  userId: string;
  feature: AiFeature;
  provider: AiProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs?: number;
}

export type TrackableSection =
  | "kairo"
  | "biblia"
  | "estudo"
  | "teologia"
  | "exegese"
  | "oracao"
  | "devocional";

const SECTION_COLUMN: Record<TrackableSection, string> = {
  kairo: "kairo_interactions",
  biblia: "biblia_interactions",
  estudo: "estudo_interactions",
  teologia: "teologia_interactions",
  exegese: "exegese_interactions",
  oracao: "oracao_interactions",
  devocional: "devocional_interactions",
};

/**
 * Persiste consumo de IA em `ai_usage`. Fire-and-forget. Server-only.
 */
export async function trackAiUsage(data: TrackAiUsageData): Promise<void> {
  if (typeof window !== "undefined") return;
  try {
    const { createServiceClient } = await import(
      "@/shared/services/supabase/supabase.server"
    );
    const supabase = await createServiceClient();
    await supabase.from("ai_usage").insert({
      user_id: data.userId,
      feature: data.feature,
      provider: data.provider,
      model: data.model,
      prompt_tokens: data.promptTokens,
      completion_tokens: data.completionTokens,
      total_tokens: data.totalTokens,
      duration_ms: data.durationMs ?? null,
    });
  } catch (err) {
    console.error("[ai/tracking] Erro ao registrar ai_usage:", err);
  }
}

/**
 * Incrementa contador de interações em `user_metrics`. Fire-and-forget. Server-only.
 */
export async function trackSectionInteraction(
  userId: string,
  section: TrackableSection
): Promise<void> {
  if (typeof window !== "undefined") return;
  try {
    const { createServiceClient } = await import(
      "@/shared/services/supabase/supabase.server"
    );
    const supabase = await createServiceClient();
    const { getTodayBR } = await import("@/shared/lib/utils");
    const today = getTodayBR();
    const column = SECTION_COLUMN[section];
    if (!column) return;

    const { data: existing } = await supabase
      .from("user_metrics")
      .select(`id, ${column}`)
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      const row = existing as unknown as Record<string, unknown>;
      await supabase
        .from("user_metrics")
        .update({ [column]: ((row[column] as number) ?? 0) + 1 })
        .eq("id", row["id"] as string);
    } else {
      await supabase.from("user_metrics").insert({
        user_id: userId,
        date: today,
        [column]: 1,
      });
    }
  } catch (err) {
    console.error("[ai/tracking] Erro ao registrar interação:", err);
  }
}
