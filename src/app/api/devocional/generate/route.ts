import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { buildDevotionalPrompt } from "@/lib/ai/devotional-prompt";

const BIBLE_PLAN: { book: string; chapter: number; verseStart: number; verseEnd?: number }[] = [
  { book: "Salmos", chapter: 1, verseStart: 1, verseEnd: 6 },
  { book: "Provérbios", chapter: 3, verseStart: 5, verseEnd: 6 },
  { book: "Filipenses", chapter: 4, verseStart: 6, verseEnd: 7 },
  { book: "Romanos", chapter: 8, verseStart: 28, verseEnd: 28 },
  { book: "Isaías", chapter: 40, verseStart: 31, verseEnd: 31 },
  { book: "Jeremias", chapter: 29, verseStart: 11, verseEnd: 11 },
  { book: "Salmos", chapter: 23, verseStart: 1, verseEnd: 6 },
];

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const supabase = await createServiceClient();

    const { data: existing } = await supabase
      .from("devotionals")
      .select("id")
      .eq("date", today)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Devotional already exists for today" });
    }

    const dayIndex = new Date().getDay();
    const passage = BIBLE_PLAN[dayIndex % BIBLE_PLAN.length];

    const biblePassage = `[Passagem de ${passage.book} ${passage.chapter}:${passage.verseStart}${passage.verseEnd ? `–${passage.verseEnd}` : ""}]`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
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
    if (content.type !== "text") throw new Error("Unexpected response type");

    const parsed = JSON.parse(content.text);

    const { error } = await supabase.from("devotionals").insert({
      date: today,
      bible_book: passage.book,
      bible_chapter: passage.chapter,
      bible_verse_start: passage.verseStart,
      bible_verse_end: passage.verseEnd ?? null,
      bible_passage: biblePassage,
      title: parsed.title,
      reflection_text: parsed.reflection,
      prayer_text: parsed.prayer,
      generated_by_ai: true,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, date: today });
  } catch (error) {
    console.error("Error generating devotional:", error);
    return NextResponse.json({ error: "Failed to generate devotional" }, { status: 500 });
  }
}
