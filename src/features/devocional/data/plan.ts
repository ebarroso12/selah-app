export interface BiblePassage {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

/**
 * Plano de leitura bíblica para o cron diário do devocional.
 * O índice é calculado por: dayOfWeek % BIBLE_PLAN.length
 */
export const BIBLE_PLAN: BiblePassage[] = [
  { book: "Salmos", chapter: 1, verseStart: 1, verseEnd: 6 },
  { book: "Provérbios", chapter: 3, verseStart: 5, verseEnd: 6 },
  { book: "Filipenses", chapter: 4, verseStart: 6, verseEnd: 7 },
  { book: "Romanos", chapter: 8, verseStart: 28, verseEnd: 28 },
  { book: "Isaías", chapter: 40, verseStart: 31, verseEnd: 31 },
  { book: "Jeremias", chapter: 29, verseStart: 11, verseEnd: 11 },
  { book: "Salmos", chapter: 23, verseStart: 1, verseEnd: 6 },
];
