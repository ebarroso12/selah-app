import "server-only";
import { createUniversalClient as createClient } from "@/shared/services/supabase/supabase.universal";
import { generateAI } from "@/shared/services/ai/ai.service";
import type {
  BibleVersion,
  CrossReference,
  CrossReferencesResult,
} from "../types";

/**
 * Solicita à IA refs cruzadas para um versículo e cruza com o banco para enriquecer.
 * Server-only — usa generateAI (que importa tracking → supabase.server).
 */
export async function getCrossReferences(params: {
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  version?: BibleVersion;
  userId?: string;
}): Promise<CrossReferencesResult> {
  const supabase = createClient();
  const version = params.version ?? "ARC";

  const { content } = await generateAI({
    provider: "openai",
    model: "gpt-4o-mini",
    feature: "biblia_referencias",
    messages: [
      {
        role: "system",
        content: `Você é um especialista em Bíblia Sagrada. Dado um versículo, retorne referências cruzadas relevantes.
Retorne um JSON no formato:
{
  "references": [
    {
      "reference": "Romanos 8:28",
      "text": "Texto do versículo...",
      "connection": "Explique a conexão temática ou doutrinária"
    }
  ]
}
Retorne entre 3 e 5 referências. Use a versão ${version} em português.`,
      },
      {
        role: "user",
        content: `Versículo: ${params.book} ${params.chapter}:${params.verseNumber} — "${params.text}"`,
      },
    ],
    maxTokens: 1200,
    temperature: 0.3,
    userId: params.userId,
  });

  const parsed: { references: CrossReference[] } = JSON.parse(content || "{}");

  const enriched = await Promise.all(
    (parsed.references ?? []).map(async (ref) => {
      try {
        const match = ref.reference.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (!match) return ref;
        const [, refBook, refChapter, refVerse] = match;
        const { data } = await supabase
          .from("bible_verses")
          .select("id")
          .eq("version", version)
          .ilike("book", refBook.trim())
          .eq("chapter", Number(refChapter))
          .eq("verse", Number(refVerse))
          .maybeSingle();
        return { ...ref, verseId: data?.id };
      } catch {
        return ref;
      }
    }),
  );

  return { references: enriched };
}
