/**
 * Seed: importa NVI, ARA, ARC (completo) e KJV para bible_verses.
 * Fontes:
 *   - NVI, ARA, ARC: github.com/thiagobodruk/biblia
 *   - KJV: api.getbible.net/v2
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-all-bibles.mjs
 *   node --env-file=.env.local scripts/seed-all-bibles.mjs NVI
 *   node --env-file=.env.local scripts/seed-all-bibles.mjs ARC ARA NVI KJV
 */

// Bypass SSL expirado do getbible.net (só usado para KJV)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { createClient } from "@supabase/supabase-js";

// ── Config ─────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE   = 500;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Mapeamento abbrev → nome PT-BR (mesma ordem do books.ts) ──────────────────
const ABBREV_TO_NAME = {
  gn:"Gênesis", ex:"Êxodo", lv:"Levítico", nm:"Números", dt:"Deuteronômio",
  js:"Josué", jz:"Juízes", rt:"Rute", "1sm":"1 Samuel", "2sm":"2 Samuel",
  "1rs":"1 Reis", "2rs":"2 Reis", "1cr":"1 Crônicas", "2cr":"2 Crônicas",
  ed:"Esdras", ne:"Neemias", et:"Ester", "jó":"Jó", sl:"Salmos", pv:"Provérbios",
  ec:"Eclesiastes", ct:"Cantares", is:"Isaías", jr:"Jeremias", lm:"Lamentações",
  ez:"Ezequiel", dn:"Daniel", os:"Oséias", jl:"Joel", am:"Amós",
  ob:"Obadias", jn:"Jonas", mq:"Miquéias", na:"Naum", hc:"Habacuque",
  sf:"Sofonias", ag:"Ageu", zc:"Zacarias", ml:"Malaquias",
  mt:"Mateus", mc:"Marcos", lc:"Lucas", jo:"João", atos:"Atos",
  rm:"Romanos", "1co":"1 Coríntios", "2co":"2 Coríntios", gl:"Gálatas",
  ef:"Efésios", fp:"Filipenses", cl:"Colossenses",
  "1ts":"1 Tessalonicenses", "2ts":"2 Tessalonicenses",
  "1tm":"1 Timóteo", "2tm":"2 Timóteo", tt:"Tito", fm:"Filemom",
  hb:"Hebreus", tg:"Tiago", "1pe":"1 Pedro", "2pe":"2 Pedro",
  "1jo":"1 João", "2jo":"2 João", "3jo":"3 João", jd:"Judas", ap:"Apocalipse",
};

// Nomes PT-BR na ordem canônica (para KJV via getbible)
const BOOKS_PT = [
  "Gênesis","Êxodo","Levítico","Números","Deuteronômio",
  "Josué","Juízes","Rute","1 Samuel","2 Samuel",
  "1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras",
  "Neemias","Ester","Jó","Salmos","Provérbios",
  "Eclesiastes","Cantares","Isaías","Jeremias","Lamentações",
  "Ezequiel","Daniel","Oséias","Joel","Amós",
  "Obadias","Jonas","Miquéias","Naum","Habacuque",
  "Sofonias","Ageu","Zacarias","Malaquias",
  "Mateus","Marcos","Lucas","João","Atos",
  "Romanos","1 Coríntios","2 Coríntios","Gálatas","Efésios",
  "Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses",
  "1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus",
  "Tiago","1 Pedro","2 Pedro","1 João","2 João",
  "3 João","Judas","Apocalipse",
];

const CHAPTERS_COUNT = [
  50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,
  13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,
  1,4,7,3,3,3,2,14,4,
  28,16,24,21,28,16,16,13,6,6,
  4,4,5,3,6,4,3,1,13,
  5,5,3,5,1,1,1,22,
];

// ── Helpers ────────────────────────────────────────────────────────────────────
async function insertBatch(rows) {
  const { error } = await supabase
    .from("bible_verses")
    .upsert(rows, { onConflict: "version,book,chapter,verse", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

async function flushRows(rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await insertBatch(rows.slice(i, i + BATCH_SIZE));
  }
}

// ── Seed via thiagobodruk/biblia (NVI, ARA, ARC) ──────────────────────────────
async function seedFromGitHub(versionCode, filename) {
  const url = `https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/${filename}`;
  console.log(`\n📖 Baixando ${versionCode} de ${filename}...`);

  const res = await fetch(url, { headers: { "User-Agent": "node" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar ${filename}`);

  const books = await res.json(); // array de { abbrev, chapters }
  console.log(`   ${books.length} livros encontrados. Inserindo...`);

  let total = 0;
  for (const book of books) {
    const bookName = ABBREV_TO_NAME[book.abbrev];
    if (!bookName) {
      console.warn(`   ⚠  Abreviação desconhecida: ${book.abbrev} — pulando`);
      continue;
    }

    const rows = [];
    book.chapters.forEach((verses, chIdx) => {
      verses.forEach((text, vIdx) => {
        if (text?.trim()) {
          rows.push({
            version: versionCode,
            book: bookName,
            chapter: chIdx + 1,
            verse: vIdx + 1,
            text: text.trim(),
          });
        }
      });
    });

    await flushRows(rows);
    total += rows.length;
    process.stdout.write(`   ✓ ${bookName.padEnd(28)} ${rows.length} versículos\n`);
  }

  console.log(`   ✅ ${versionCode}: ${total} versículos inseridos.`);
  return total;
}

// ── Seed KJV via api.getbible.net ─────────────────────────────────────────────
async function seedKJV() {
  console.log(`\n📖 Baixando KJV de api.getbible.net (capítulo a capítulo)...`);
  let total = 0;

  for (let bIdx = 0; bIdx < BOOKS_PT.length; bIdx++) {
    const bookName = BOOKS_PT[bIdx];
    const bookNr   = bIdx + 1;
    const numCh    = CHAPTERS_COUNT[bIdx];
    const rows     = [];

    for (let ch = 1; ch <= numCh; ch++) {
      try {
        const r = await fetch(
          `https://api.getbible.net/v2/kjv/${bookNr}/${ch}.json`,
          { signal: AbortSignal.timeout(12000) }
        );
        if (!r.ok) continue;
        const data = await r.json();
        for (const [vNr, v] of Object.entries(data.verses ?? {})) {
          const text = (v.text ?? v.verse ?? "").trim();
          if (text) rows.push({ version: "KJV", book: bookName, chapter: ch, verse: parseInt(vNr), text });
        }
      } catch { /* timeout / rede — ignora capítulo */ }
      // Pequena pausa para não sobrecarregar a API
      await new Promise(r => setTimeout(r, 80));
    }

    await flushRows(rows);
    total += rows.length;
    process.stdout.write(`   ✓ ${bookName.padEnd(28)} ${rows.length} versículos\n`);
  }

  console.log(`   ✅ KJV: ${total} versículos inseridos.`);
  return total;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args    = process.argv.slice(2).map(v => v.toUpperCase());
  const targets = args.length > 0 ? args : ["ARC", "ARA", "NVI", "KJV"];

  const SOURCE_MAP = {
    ARC: () => seedFromGitHub("ARC", "acf.json"),
    ARA: () => seedFromGitHub("ARA", "aa.json"),
    NVI: () => seedFromGitHub("NVI", "nvi.json"),
    KJV: () => seedKJV(),
  };

  console.log(`🔑 Versões: ${targets.join(", ")}`);
  let grand = 0;
  for (const v of targets) {
    if (!SOURCE_MAP[v]) { console.warn(`⚠  Versão desconhecida: ${v}`); continue; }
    grand += await SOURCE_MAP[v]();
  }
  console.log(`\n🎉 Tudo pronto! Total inserido: ${grand} versículos.`);
}

main().catch(err => {
  console.error("❌ Erro fatal:", err.message);
  process.exit(1);
});
