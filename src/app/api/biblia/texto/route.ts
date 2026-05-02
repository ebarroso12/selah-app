import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Mapeamento de nomes de livros (display) para chaves de arquivo
const BOOK_FILE_MAP: Record<string, string> = {
  "Gênesis": "gênesis", "Êxodo": "êxodo", "Levítico": "levítico",
  "Números": "números", "Deuteronômio": "deuteronômio", "Josué": "josué",
  "Juízes": "juízes", "Rute": "rute", "1 Samuel": "1_samuel",
  "2 Samuel": "2_samuel", "1 Reis": "1_reis", "2 Reis": "2_reis",
  "1 Crônicas": "1_crônicas", "2 Crônicas": "2_crônicas",
  "Esdras": "esdras", "Neemias": "neemias", "Ester": "ester",
  "Jó": "jó", "Salmos": "salmos", "Provérbios": "provérbios",
  "Eclesiastes": "eclesiastes", "Cânticos": "cânticos",
  "Isaías": "isaías", "Jeremias": "jeremias", "Lamentações": "lamentações",
  "Ezequiel": "ezequiel", "Daniel": "daniel", "Oséias": "oséias",
  "Joel": "joel", "Amós": "amós", "Obadias": "obadias",
  "Jonas": "jonas", "Miquéias": "miquéias", "Naum": "naum",
  "Habacuque": "habacuque", "Sofonias": "sofonias", "Ageu": "ageu",
  "Zacarias": "zacarias", "Malaquias": "malaquias",
  "Mateus": "mateus", "Marcos": "marcos", "Lucas": "lucas",
  "João": "joão", "Atos": "atos", "Romanos": "romanos",
  "1 Coríntios": "1_coríntios", "2 Coríntios": "2_coríntios",
  "Gálatas": "gálatas", "Efésios": "efésios", "Filipenses": "filipenses",
  "Colossenses": "colossenses", "1 Tessalonicenses": "1_tessalonicenses",
  "2 Tessalonicenses": "2_tessalonicenses", "1 Timóteo": "1_timóteo",
  "2 Timóteo": "2_timóteo", "Tito": "tito", "Filemom": "filemom",
  "Hebreus": "hebreus", "Tiago": "tiago", "1 Pedro": "1_pedro",
  "2 Pedro": "2_pedro", "1 João": "1_joão", "2 João": "2_joão",
  "3 João": "3_joão", "Judas": "judas", "Apocalipse": "apocalipse",
};

function getBibleDir() {
  return path.join(process.cwd(), "public", "bible");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get("book") ?? "Gênesis";
  const chapter = searchParams.get("chapter") ?? "1";

  if (!book || book === "index") {
    // Retornar índice de livros
    try {
      const indexPath = path.join(getBibleDir(), "index.json");
      const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      return NextResponse.json(index);
    } catch {
      return NextResponse.json({ error: "Índice não encontrado" }, { status: 404 });
    }
  }

  const fileKey = BOOK_FILE_MAP[book];
  if (!fileKey) {
    return NextResponse.json({ error: `Livro "${book}" não encontrado` }, { status: 404 });
  }

  const bookPath = path.join(getBibleDir(), "books", `${fileKey}.json`);
  if (!fs.existsSync(bookPath)) {
    return NextResponse.json({ error: `Arquivo do livro "${book}" não encontrado` }, { status: 404 });
  }

  const bookData = JSON.parse(fs.readFileSync(bookPath, "utf-8"));
  const chapterData = bookData[chapter];

  if (!chapterData) {
    return NextResponse.json({ error: `Capítulo ${chapter} não encontrado em ${book}` }, { status: 404 });
  }

  const verses = Object.entries(chapterData)
    .map(([v, t]) => ({ number: Number(v), text: t as string }))
    .sort((a, b) => a.number - b.number);

  return NextResponse.json({
    book,
    chapter: Number(chapter),
    version: "ARC",
    total_chapters: Object.keys(bookData).length,
    verses,
    totalVerses: verses.length,
  });
}
