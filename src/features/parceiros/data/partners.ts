import { createClient } from "@/shared/services/supabase/supabase.server";

/**
 * Interface pública consumida pelas páginas de parceiros. É mantida idêntica ao
 * formato original (100% data-driven) — o mapeamento das colunas da tabela
 * `public.partners` para esta interface acontece em `mapRow()` abaixo:
 *
 *   logo         ← logo_url
 *   url          ← website_url
 *   googleReviewUrl ← google_review_url
 *   video        ← { url: video_url, thumbnail: video_thumbnail_url, caption: video_caption }
 *   contacts     ← contacts (jsonb, mesmo shape)
 *
 * Server-only: importa o client SSR do Supabase (depende de next/headers).
 */
export interface Partner {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  url: string;
  summary: string[];
  areas: string[];
  googleReviewUrl?: string;
  video?: { url: string; thumbnail: string; caption?: string };
  contacts: {
    phones: string[];
    whatsapp: { label: string; url: string };
    email?: string;
    addresses: { label: string; line: string; mapsUrl: string }[];
    hours: string;
    social: { label: string; url: string }[];
  };
}

/** Linha bruta da tabela `public.partners`. */
interface PartnerRow {
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  website_url: string;
  summary: string[] | null;
  areas: string[] | null;
  google_review_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  video_caption: string | null;
  contacts: Partner["contacts"] | null;
  sort_order: number;
}

const EMPTY_CONTACTS: Partner["contacts"] = {
  phones: [],
  whatsapp: { label: "", url: "" },
  addresses: [],
  hours: "",
  social: [],
};

function mapRow(row: PartnerRow): Partner {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    logo: row.logo_url,
    url: row.website_url,
    summary: row.summary ?? [],
    areas: row.areas ?? [],
    googleReviewUrl: row.google_review_url ?? undefined,
    video: row.video_url
      ? {
          url: row.video_url,
          thumbnail: row.video_thumbnail_url ?? "",
          caption: row.video_caption ?? undefined,
        }
      : undefined,
    contacts: row.contacts ?? EMPTY_CONTACTS,
  };
}

/** Busca todos os parceiros ordenados por `sort_order`. */
export async function getPartners(): Promise<Partner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order", { ascending: true });
  return ((data as PartnerRow[] | null) ?? []).map(mapRow);
}

/** Busca um parceiro pelo slug, ou `null` se não existir. */
export async function getPartnerBySlug(slug: string): Promise<Partner | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapRow(data as PartnerRow) : null;
}
