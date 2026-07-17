/**
 * Task 6.2 / 6.4 — Referências cruzadas refatoradas para bible.service + generateAI
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { getCrossReferences } from "@/features/biblia/services/bible.server";
import type { BibleVersion } from "@/features/biblia/types";

export async function POST(request: NextRequest) {
  try {
    const { verse, book, chapter, verseNumber, version } = await request.json();
    if (!verse) {
      return NextResponse.json({ error: "Versículo obrigatório" }, { status: 400 });
    }

    // userId para tracking (opcional)
    let userId: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {
      // sem autenticação — tracking não dispara
    }

    const result = await getCrossReferences({
      book,
      chapter,
      verseNumber,
      text: verse,
      version: (version ?? "ARC") as BibleVersion,
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[biblia/referencias]", error);
    return NextResponse.json({ error: "Erro ao buscar referências" }, { status: 500 });
  }
}
