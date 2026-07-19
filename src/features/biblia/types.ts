/**
 * Task 6.1 — Tipos da feature Bíblia
 */

/** Versões disponíveis no banco. Apenas ARC está populada atualmente. */
export type BibleVersion = "ARC" | "NVI" | "ARA" | "KJV";
export const DEFAULT_VERSION: BibleVersion = "ARC";

export interface BibleVerse {
  id: number;
  version: BibleVersion;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleVerseWithHeadline extends BibleVerse {
  headline?: string; // snippet de busca gerado pelo postgres
}

export interface BibleChapterResult {
  book: string;
  chapter: number;
  version: BibleVersion;
  verses: BibleVerse[];
  totalVerses: number;
  totalChapters: number;
}

export interface BibleSearchOpts {
  version?: BibleVersion;
  limit?: number;
}

export interface BibleSearchResult {
  results: BibleVerseWithHeadline[];
  total: number;
}

export interface CrossReference {
  reference: string;
  text: string;
  connection: string;
  verseId?: number;
}

export interface CrossReferencesResult {
  references: CrossReference[];
}

export interface FavoriteToggleResult {
  favorited: boolean;
}
