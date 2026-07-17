/**
 * Seed: importa todos os versículos da Bíblia ARC para bible_verses.
 * Idempotente: usa ON CONFLICT DO NOTHING.
 *
 * Uso:
 *   npm run seed:bible
 *
 * Requer no .env.local (ou env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE   = 500;
const BIBLE_DIR    = join(process.cwd(), "public", "bible");
const BOOKS_DIR    = join(BIBLE_DIR, "books");
const VERSION      = "ARC";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookIndex {
  id: number;
  name: string;
  key: string;
}

type BibleJson = Record<string, Record<string, string>>; // { "1": { "1": "texto" } }

interface VerseRow {
  version: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadIndex(): BookIndex[] {
  const raw = readFileSync(join(BIBLE_DIR, "index.json"), "utf-8");
  return JSON.parse(raw);
}

function bookFileKey(bookName: string): string {
  // "Gênesis" → "gênesis.json"
  return bookName.toLowerCase() + ".json";
}

function loadBook(bookName: string): BibleJson | null {
  const filename = bookFileKey(bookName);
  const filePath = join(BOOKS_DIR, filename);
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    console.warn(`  ⚠ Arquivo não encontrado: ${filename} — pulando`);
    return null;
  }
}

function buildRows(bookName: string, data: BibleJson): VerseRow[] {
  const rows: VerseRow[] = [];
  for (const [chapterStr, verses] of Object.entries(data)) {
    const chapter = parseInt(chapterStr, 10);
    if (isNaN(chapter)) continue;
    for (const [verseStr, text] of Object.entries(verses)) {
      const verse = parseInt(verseStr, 10);
      if (isNaN(verse) || !text?.trim()) continue;
      rows.push({ version: VERSION, book: bookName, chapter, verse, text: text.trim() });
    }
  }
  return rows;
}

async function insertBatch(rows: VerseRow[]): Promise<number> {
  const { data, error } = await supabase
    .from("bible_verses")
    .upsert(rows, { onConflict: "version,book,chapter,verse", ignoreDuplicates: true })
    .select("id");

  if (error) throw new Error(`Insert error: ${error.message}`);
  return data?.length ?? 0;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📖 Iniciando seed da Bíblia ARC...\n");

  const books = loadIndex();
  let totalInserted = 0;
  let totalRows = 0;

  for (const book of books) {
    process.stdout.write(`  ${book.name.padEnd(25)}`);

    const data = loadBook(book.name);
    if (!data) continue;

    const rows = buildRows(book.name, data);
    totalRows += rows.length;

    // Inserir em batches
    let bookInserted = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const inserted = await insertBatch(batch);
      bookInserted += inserted;
    }

    totalInserted += bookInserted;
    console.log(`${rows.length} versículos | ${bookInserted} inseridos`);
  }

  console.log(`\n✅ Concluído!`);
  console.log(`   Total de versículos no JSON : ${totalRows}`);
  console.log(`   Inseridos agora             : ${totalInserted}`);
  console.log(`   (0 inseridos = seed já rodou antes — OK)`);
}

main().catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
