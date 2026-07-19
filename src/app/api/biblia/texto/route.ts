/**
 * Task 6.2 — Refatorado para usar bible.service (Supabase) em vez de fs.readFileSync
 */
import { NextRequest, NextResponse } from "next/server";
import { getChapter } from "@/features/biblia/services/bible.service";
import type { BibleVersion } from "@/features/biblia/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get("book") ?? "João";
  const chapter = Number(searchParams.get("chapter") ?? "1");
  const version = (searchParams.get("version") ?? "ARC") as BibleVersion;

  if (!book || isNaN(chapter) || chapter < 1) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    const data = await getChapter(version, book, chapter);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[biblia/texto]", error);
    return NextResponse.json(
      { error: "Erro ao carregar capítulo" },
      { status: 500 },
    );
  }
}
