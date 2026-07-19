/**
 * Task 6.2 — Busca bíblica refatorada para usar bible.service FTS (Supabase)
 */
import { NextRequest, NextResponse } from "next/server";
import { searchVerses } from "@/features/biblia/services/bible.service";
import type { BibleVersion } from "@/features/biblia/types";

export async function POST(request: NextRequest) {
  try {
    const { query, version } = await request.json();
    if (!query) {
      return NextResponse.json({ error: "Consulta obrigatória" }, { status: 400 });
    }

    const result = await searchVerses(query, {
      version: (version ?? "ARC") as BibleVersion,
      limit: 25,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[biblia/busca]", error);
    return NextResponse.json({ error: "Erro ao buscar versículos" }, { status: 500 });
  }
}
