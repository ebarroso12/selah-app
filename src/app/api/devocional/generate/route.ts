import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { buildDevotionalPrompt } from "@/lib/ai/devotional-prompt";

const BIBLE_PLAN: {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}[] = [
  { book: "Salmos", chapter: 1, verseStart: 1, verseEnd: 6 },
  { book: "Provérbios", chapter: 3, verseStart: 5, verseEnd: 6 },
  { book: "Filipenses", chapter: 4, verseStart: 6, verseEnd: 7 },
  { book: "Romanos", chapter: 8, verseStart: 28, verseEnd: 28 },
  { book: "Isaías", chapter: 40, verseStart: 31, verseEnd: 31 },
  { book: "Jeremias", chapter: 29, verseStart: 11, verseEnd: 11 },
  { book: "Salmos", chapter: 23, verseStart: 1, verseEnd: 6 },
];

/**
 * Verifica se a requisição está autorizada via CRON_SECRET.
 * O Vercel envia o header `authorization: Bearer <CRON_SECRET>` automaticamente.
 */
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Se CRON_SECRET não está configurado, bloqueia por segurança
    console.error("[devocional/generate] CRON_SECRET não configurado");
    return false;
  }
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

async function generateDevotional(): Promise<NextResponse> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const supabase = await createServiceClient();

    // Verifica se já existe devocional para hoje
    const { data: existing } = await supabase
      .from("devotionals")
      .select("id")
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        message: "Devocional já existe para hoje",
        date: today,
      });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      console.error("[devocional/generate] ANTHROPIC_API_KEY não configurada");
      return NextResponse.json(
        { error: "Serviço de IA não configurado" },
        { status: 503 }
      );
    }

    const dayIndex = new Date().getDay();
    const passage = BIBLE_PLAN[dayIndex % BIBLE_PLAN.length];

    const biblePassage = `[Passagem de ${passage.book} ${passage.chapter}:${passage.verseStart}${
      passage.verseEnd ? `–${passage.verseEnd}` : ""
    }]`;

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: buildDevotionalPrompt({
            bibleBook: passage.book,
            bibleChapter: passage.chapter,
            bibleVerseStart: passage.verseStart,
            bibleVerseEnd: passage.verseEnd,
            biblePassage,
            date: today,
          }),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Tipo de resposta inesperado da IA");
    }

    let parsed: { title: string; reflection: string; prayer?: string };
    try {
      parsed = JSON.parse(content.text);
    } catch {
      throw new Error("Resposta da IA não é JSON válido");
    }

    const { error } = await supabase.from("devotionals").insert({
      date: today,
      bible_book: passage.book,
      bible_chapter: passage.chapter,
      bible_verse_start: passage.verseStart,
      bible_verse_end: passage.verseEnd ?? null,
      bible_passage: biblePassage,
      title: parsed.title,
      reflection_text: parsed.reflection,
      prayer_text: parsed.prayer ?? null,
      generated_by_ai: true,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, date: today });
  } catch (error) {
    console.error("[devocional/generate] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar devocional" },
      { status: 500 }
    );
  }
}

// GET — usado pelo cron job do Vercel (vercel.json)
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return generateDevotional();
}

// POST — chamada manual ou via script
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return generateDevotional();
}
