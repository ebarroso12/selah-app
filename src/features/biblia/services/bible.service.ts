/**
 * Task 6.1 — bible.service
 * Todas as operações de leitura/busca/favoritos da Bíblia via Supabase.
 * Usa FTS com tsvector (text_search) + unaccent + pg_trgm.
 */
import { createUniversalClient as createClient } from "@/shared/services/supabase/supabase.universal";
import type {
  BibleVersion,
  BibleVerse,
  BibleVerseWithHeadline,
  BibleChapterResult,
  BibleSearchOpts,
  BibleSearchResult,
  FavoriteToggleResult,
} from "../types";

// ─── Leitura ──────────────────────────────────────────────────────────────────

/**
 * Retorna todos os versículos de um capítulo + total de capítulos do livro.
 */
export async function getChapter(
  version: BibleVersion,
  book: string,
  chapter: number,
): Promise<BibleChapterResult> {
  const supabase = createClient();

  // Versículos do capítulo
  const { data: verses, error } = await supabase
    .from("bible_verses")
    .select("id, version, book, chapter, verse, text")
    .eq("version", version)
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });

  if (error) throw new Error(`[bible.service] getChapter: ${error.message}`);

  // Total de capítulos do livro (máximo capítulo existente)
  const { data: chapterData } = await supabase
    .from("bible_verses")
    .select("chapter")
    .eq("version", version)
    .eq("book", book)
    .order("chapter", { ascending: false })
    .limit(1);

  const totalChapters = chapterData?.[0]?.chapter ?? 1;

  return {
    book,
    chapter,
    version,
    verses: (verses ?? []) as BibleVerse[],
    totalVerses: verses?.length ?? 0,
    totalChapters,
  };
}

// ─── Busca FTS ────────────────────────────────────────────────────────────────

/**
 * Busca versículos usando websearch_to_tsquery (FTS português + unaccent).
 * Retorna até 25 resultados ordenados por ranking.
 */
export async function searchVerses(
  query: string,
  opts: BibleSearchOpts = {},
): Promise<BibleSearchResult> {
  const { version = "ARC", limit = 25 } = opts;
  const supabase = createClient();

  // RPC para FTS com headline (snippet)
  const { data, error } = await supabase.rpc("search_bible_verses", {
    p_query: query,
    p_version: version,
    p_limit: limit,
  });

  if (error) {
    // Fallback: busca simples por ilike se RPC não existir
    console.warn("[bible.service] searchVerses RPC falhou, usando ilike:", error.message);
    const { data: fallback } = await supabase
      .from("bible_verses")
      .select("id, version, book, chapter, verse, text")
      .eq("version", version)
      .ilike("text", `%${query}%`)
      .limit(limit);

    const results = (fallback ?? []) as BibleVerseWithHeadline[];
    return { results, total: results.length };
  }

  const results = (data ?? []) as BibleVerseWithHeadline[];
  return { results, total: results.length };
}

// ─── Favoritos ────────────────────────────────────────────────────────────────

/**
 * Adiciona ou remove um versículo dos favoritos do usuário.
 */
export async function toggleFavorite(
  userId: string,
  verseId: number,
): Promise<FavoriteToggleResult> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return { favorited: false };
  }

  await supabase.from("favorites").insert({ user_id: userId, verse_id: verseId });
  return { favorited: true };
}

/**
 * Retorna se um versículo está favoritado pelo usuário.
 */
export async function isFavorited(userId: string, verseId: number): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("verse_id", verseId)
    .maybeSingle();
  return !!data;
}
