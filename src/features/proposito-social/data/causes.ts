import { createClient } from "@/shared/services/supabase/supabase.server";

/**
 * Interface pública consumida pela página de propósito social. Mantida idêntica
 * ao formato original — o mapeamento das colunas da tabela `public.social_causes`
 * para esta interface acontece em `mapRow()` abaixo:
 *
 *   logo         ← logo_url
 *   logoBg       ← logo_bg
 *   url          ← website_url
 *   founderStory ← founder_story
 *   specialNote  ← special_note
 *   contacts     ← contacts (jsonb, mesmo shape)
 *
 * Server-only: importa o client SSR do Supabase (depende de next/headers).
 */
export interface Cause {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  logoBg: string;
  url: string;
  hook: string;
  founderStory: string[];
  mission: string[];
  services: string[];
  urgency: string[];
  specialNote?: string;
  contacts: {
    phones: string[];
    whatsapp: { label: string; url: string };
    email: string;
    address?: { line: string; mapsUrl: string };
    social: { label: string; url: string }[];
    actions: { label: string; url: string }[];
  };
}

/** Linha bruta da tabela `public.social_causes`. */
interface CauseRow {
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  logo_bg: string;
  website_url: string;
  hook: string;
  founder_story: string[] | null;
  mission: string[] | null;
  services: string[] | null;
  urgency: string[] | null;
  special_note: string | null;
  contacts: Cause["contacts"] | null;
  sort_order: number;
}

const EMPTY_CONTACTS: Cause["contacts"] = {
  phones: [],
  whatsapp: { label: "", url: "" },
  email: "",
  social: [],
  actions: [],
};

function mapRow(row: CauseRow): Cause {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    logo: row.logo_url,
    logoBg: row.logo_bg,
    url: row.website_url,
    hook: row.hook,
    founderStory: row.founder_story ?? [],
    mission: row.mission ?? [],
    services: row.services ?? [],
    urgency: row.urgency ?? [],
    specialNote: row.special_note ?? undefined,
    contacts: row.contacts ?? EMPTY_CONTACTS,
  };
}

/** Busca todas as causas sociais ordenadas por `sort_order`. */
export async function getCauses(): Promise<Cause[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_causes")
    .select("*")
    .order("sort_order", { ascending: true });
  return ((data as CauseRow[] | null) ?? []).map(mapRow);
}
