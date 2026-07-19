import { createClient } from "@/shared/services/supabase/supabase.server";

/**
 * Evento em destaque ("Próximo Evento") da página /legendarios.
 * Antes hardcoded no JSX — agora vem da tabela `public.legendarios_featured_event`.
 * Server-only: importa o client SSR do Supabase (depende de next/headers).
 */
export interface FeaturedEventStep {
  title: string;
  description: string;
}

export interface FeaturedEvent {
  title: string;
  dateRange: string;
  targetDate: string | null;
  description: string;
  steps: FeaturedEventStep[];
  motto: string;
  paymentUrl: string | null;
  instagramUrl: string | null;
  whatsappGroupUrl: string | null;
  officialSiteUrl: string | null;
}

interface FeaturedEventRow {
  title: string;
  date_range: string;
  target_date: string | null;
  description: string;
  steps: FeaturedEventStep[] | null;
  motto: string;
  payment_url: string | null;
  instagram_url: string | null;
  whatsapp_group_url: string | null;
  official_site_url: string | null;
}

/** Fallback usado quando ainda não há nenhuma linha ativa cadastrada. */
export const DEFAULT_FEATURED_EVENT: FeaturedEvent = {
  title: "TOP 1782 · Track 3 Colinas",
  dateRange: "27 a 30 de agosto de 2026 · 72 horas de imersão",
  targetDate: "2026-08-27T08:00:00-03:00",
  description:
    "Uma imersão de 72 horas que combina natureza, desafios físicos, confronto espiritual e transformação real — com um propósito claro: devolver o herói a cada família.",
  steps: [
    { title: "Confrontação", description: "Tira da passividade e da zona de conforto." },
    { title: "Desafio", description: "Chama a sua melhor versão." },
    { title: "Propósito", description: "No topo, encontra Jesus." },
  ],
  motto: "AHU — Amor · Honra · Unidade",
  paymentUrl:
    "https://ticketandgo.com.br/legendarios-top-1782-track-3-colinas?id=6ba864f0-6579-48ca-83d6-ba4b16dfcaab",
  instagramUrl: "https://www.instagram.com/legendarios3colinas",
  whatsappGroupUrl: "https://chat.whatsapp.com/LkfTncbrJAfAPutDtjay8L?mode=ems_copy_t",
  officialSiteUrl: "https://www.legendarios3colinas.com.br/",
};

function mapRow(row: FeaturedEventRow): FeaturedEvent {
  return {
    title: row.title,
    dateRange: row.date_range,
    targetDate: row.target_date,
    description: row.description,
    steps: row.steps ?? [],
    motto: row.motto,
    paymentUrl: row.payment_url,
    instagramUrl: row.instagram_url,
    whatsappGroupUrl: row.whatsapp_group_url,
    officialSiteUrl: row.official_site_url,
  };
}

/**
 * Retorna o evento em destaque ativo mais recente, ou o fallback padrão se
 * nenhuma linha existir (evita a página quebrar antes da migration/seed).
 */
export async function getFeaturedEvent(): Promise<FeaturedEvent> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("legendarios_featured_event")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? mapRow(data as FeaturedEventRow) : DEFAULT_FEATURED_EVENT;
  } catch {
    return DEFAULT_FEATURED_EVENT;
  }
}
