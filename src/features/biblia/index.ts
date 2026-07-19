// Componentes
export { BibleReader } from "./components/BibleReader";
export { BibleSearch } from "./components/BibleSearch";
export { VerseCard } from "./components/VerseCard";
export { VersionSelector } from "./components/VersionSelector";
export { CrossReferences } from "./components/CrossReferences";

// Hooks
export { useBibleChapter } from "./hooks/useBibleChapter";
export { useBibleSearch } from "./hooks/useBibleSearch";
export { useCrossReferences } from "./hooks/useCrossReferences";

// Services (client-safe)
export {
  getChapter,
  searchVerses,
  toggleFavorite,
  isFavorited,
} from "./services/bible.service";
// getCrossReferences é server-only — importar diretamente de "./services/bible.server"

// Data
export { BIBLE_BOOKS, BIBLE_VERSIONS } from "./data/books";

// Types
export type {
  BibleVersion,
  BibleVerse,
  BibleChapterResult,
  BibleSearchResult,
  CrossReference,
  CrossReferencesResult,
  FavoriteToggleResult,
} from "./types";
export { DEFAULT_VERSION } from "./types";
