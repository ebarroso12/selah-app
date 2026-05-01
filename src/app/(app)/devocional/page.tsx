import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Devotional } from "@/types/database";

async function getDevotionals(): Promise<Devotional[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("devotionals")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);
  return (data ?? []) as Devotional[];
}

export default async function DevocionalPage() {
  const devotionals = await getDevotionals();
  const today = new Date().toISOString().split("T")[0];
  const todayDevotional = devotionals.find((d) => d.date === today);
  const archive = devotionals.filter((d) => d.date !== today);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Devocional
        </p>
        <h1 className="text-2xl">Pause e Reflita</h1>
      </div>

      {todayDevotional ? (
        <div className="card p-8 glow-gold">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xs tracking-widest uppercase mb-1"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                {formatDate(todayDevotional.date)}
              </p>
              <h2 className="text-xl leading-snug">{todayDevotional.title}</h2>
            </div>
            {todayDevotional.generated_by_ai && (
              <span className="badge badge-gold shrink-0">Gerado por IA</span>
            )}
          </div>

          <blockquote
            className="scripture text-base leading-relaxed p-5 rounded-xl mb-6"
            style={{
              background: "rgba(201,162,39,0.05)",
              borderLeft: "3px solid rgba(201,162,39,0.5)",
            }}
          >
            {todayDevotional.bible_passage}
            <footer className="mt-3 text-sm not-italic"
              style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
              {todayDevotional.bible_book} {todayDevotional.bible_chapter}:{todayDevotional.bible_verse_start}
              {todayDevotional.bible_verse_end ? `–${todayDevotional.bible_verse_end}` : ""}
            </footer>
          </blockquote>

          <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            {todayDevotional.reflection_text.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {todayDevotional.prayer_text && (
            <div className="mt-8 p-5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.15)" }}>
              <p className="text-xs mb-3"
                style={{ color: "rgba(201,162,39,0.65)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Oração
              </p>
              <p className="scripture text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                {todayDevotional.prayer_text}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <p className="scripture text-lg mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            "A sua palavra é lâmpada que ilumina o meu caminho."
          </p>
          <p className="text-xs" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
            Salmos 119:105
          </p>
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            O devocional de hoje será publicado em breve.
          </p>
        </div>
      )}

      {archive.length > 0 && (
        <div>
          <p className="text-xs tracking-widest uppercase mb-5"
            style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
            Arquivo
          </p>
          <div className="grid gap-4">
            {archive.map((d) => (
              <div key={d.id} className="card p-5 transition-all hover:border-opacity-50 cursor-pointer"
                style={{ borderColor: "rgba(201,162,39,0.18)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs mb-1"
                      style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                      {formatDate(d.date)}
                    </p>
                    <p className="font-semibold truncate" style={{ color: "#fff", fontFamily: "var(--font-cinzel)" }}>
                      {d.title}
                    </p>
                    <p className="text-sm mt-1 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {d.bible_book} {d.bible_chapter}:{d.bible_verse_start}
                    </p>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                    stroke="rgba(201,162,39,0.4)" strokeWidth={1.5} className="shrink-0 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
