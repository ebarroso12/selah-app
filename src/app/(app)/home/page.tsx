import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Devotional, Event, PrayerRequest } from "@/types/database";

async function getTodayDevotional(): Promise<Devotional | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("devotionals")
    .select("*")
    .eq("date", today)
    .maybeSingle();
  return data as Devotional | null;
}

async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("date_start", new Date().toISOString())
    .order("date_start", { ascending: true })
    .limit(3);
  return (data ?? []) as Event[];
}

async function getRecentPrayerRequests(): Promise<PrayerRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*, profile:profiles(full_name, photo_url, church_name)")
    .eq("is_public", true)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as unknown as PrayerRequest[];
}

export default async function HomePage() {
  const [devotional, events, prayers] = await Promise.all([
    getTodayDevotional(),
    getUpcomingEvents(),
    getRecentPrayerRequests(),
  ]);

  const today = formatDate(new Date());

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          {today}
        </p>
        <h1 className="text-2xl">Bem-vindo ao SELAH</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devocional do dia */}
        <div className="lg:col-span-2">
          <div className="card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-widest uppercase"
                style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
                Devocional do Dia
              </p>
              {devotional?.generated_by_ai && (
                <span className="badge badge-gold">IA</span>
              )}
            </div>

            {devotional ? (
              <div className="space-y-4">
                <h2 className="text-lg leading-snug">{devotional.title}</h2>
                <blockquote className="scripture text-sm leading-relaxed p-4 rounded-lg"
                  style={{ background: "rgba(201,162,39,0.05)", borderLeft: "2px solid rgba(201,162,39,0.4)" }}>
                  {devotional.bible_passage}
                  <footer className="mt-2 text-xs not-italic"
                    style={{ color: "rgba(201,162,39,0.65)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
                    {devotional.bible_book} {devotional.bible_chapter}:{devotional.bible_verse_start}
                    {devotional.bible_verse_end ? `–${devotional.bible_verse_end}` : ""}
                  </footer>
                </blockquote>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {devotional.reflection_text}
                </p>
                {devotional.prayer_text && (
                  <div className="mt-4 p-4 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.12)" }}>
                    <p className="text-xs mb-2" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}>
                      Oracao
                    </p>
                    <p className="scripture text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {devotional.prayer_text}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                  O devocional de hoje ainda esta sendo preparado.
                </p>
                <p className="scripture text-sm text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                  &quot;A sua palavra e lampada que ilumina o meu caminho.&quot;
                </p>
                <p className="text-xs" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
                  Salmos 119:105
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Proximos Eventos */}
          <div className="card p-5">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
              Proximos Eventos
            </p>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex gap-3 items-start">
                    <div className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                      style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
                      <span className="text-xs font-bold leading-none" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                        {new Date(event.date_start).getDate()}
                      </span>
                      <span className="text-xs leading-none mt-0.5" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
                        {new Date(event.date_start).toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{event.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {event.location ?? "Casa de Oracao"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nenhum evento proximo.
              </p>
            )}
          </div>

          {/* Pedidos de Oracao */}
          <div className="card p-5">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
              Pedidos de Oracao
            </p>
            {prayers.length > 0 ? (
              <div className="space-y-3">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="space-y-1">
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {prayer.text}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {(prayer.profile as { full_name?: string; church_name?: string } | null)?.full_name} · {(prayer.profile as { full_name?: string; church_name?: string } | null)?.church_name}
                    </p>
                    {prayers.indexOf(prayer) < prayers.length - 1 && <hr className="divider mt-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nenhum pedido publico no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
