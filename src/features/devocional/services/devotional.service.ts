/**
 * devotional.service.ts — operações client-safe de devocional.
 * Para geração via IA (server-only), ver devotional.server.ts.
 */
import { getTodayBR } from "@/shared/lib/utils";
import { createClient } from "@/shared/services/supabase/supabase.client";
import type { Devotional, DevotionalGenerated, GenerateInteractiveInput } from "../types";

// ─── Leitura ──────────────────────────────────────────────────────────────────

/** Retorna o devocional de hoje ou null. */
export async function getToday(): Promise<Devotional | null> {
  const today = getTodayBR();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("devotionals")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (error) {
    console.error("[devotional.service] getToday:", error.message);
    return null;
  }
  return data;
}

/** Retorna os devocionais mais recentes (padrão: 20). */
export async function getRecent(limit = 20): Promise<Devotional[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("devotionals")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[devotional.service] getRecent:", error.message);
    return [];
  }
  return data ?? [];
}

// ─── Geração interativa ───────────────────────────────────────────────────────

/** Chama /api/devocional/interativo e retorna o devocional gerado. */
export async function generateInteractive(
  input: GenerateInteractiveInput,
): Promise<DevotionalGenerated> {
  const res = await fetch("/api/devocional/interativo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Erro ao gerar devocional");
  }

  return data as DevotionalGenerated;
}
