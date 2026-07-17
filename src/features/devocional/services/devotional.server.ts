import "server-only";
import { getTodayBR } from "@/shared/lib/utils";
import { generateAI } from "@/shared/services/ai/ai.service";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { BIBLE_PLAN } from "../data/plan";
import { buildDevotionalPrompt } from "../prompts/devotional.system";

export interface DailyGenerateReport {
  status: "created" | "already_exists";
  date: string;
  id?: string;
}

/**
 * Gera o devocional do dia via OpenAI e persiste em `devotionals`.
 * Idempotente: se já existe para hoje, retorna `already_exists`.
 */
export async function generateAndPersistDaily(): Promise<DailyGenerateReport> {
  const today = getTodayBR();
  const supabase = await createServiceClient();

  const { data: existing } = await supabase
    .from("devotionals")
    .select("id")
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    return { status: "already_exists", date: today, id: existing.id };
  }

  const dayIndex = new Date(today + "T12:00:00").getDay();
  const passage = BIBLE_PLAN[dayIndex % BIBLE_PLAN.length];

  const biblePassage = `[Passagem de ${passage.book} ${passage.chapter}:${passage.verseStart}${
    passage.verseEnd ? `–${passage.verseEnd}` : ""
  }]`;

  const prompt = buildDevotionalPrompt({
    bibleBook: passage.book,
    bibleChapter: passage.chapter,
    bibleVerseStart: passage.verseStart,
    bibleVerseEnd: passage.verseEnd,
    biblePassage,
    date: today,
  });

  const { content } = await generateAI({
    provider: "openai",
    model: "gpt-4o-mini",
    feature: "devocional_cron",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 1024,
  });

  const parsed: { title: string; reflection: string; prayer?: string } =
    JSON.parse(content || "{}");

  const { data: inserted, error } = await supabase
    .from("devotionals")
    .insert({
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
    })
    .select("id")
    .single();

  if (error) throw error;

  return { status: "created", date: today, id: inserted.id };
}
