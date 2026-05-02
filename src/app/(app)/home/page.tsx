import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
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
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-lora)", fontStyle: "italic" }}>
          Pause. Ore. Cresça. — Casa de Oração · Franca/SP
        </p>
      </div>

      {/* Cards de destaque: Kairo + Legendários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Kairo / Dr. Edson */}
        <Link href="/dr-edson" style={{ textDecoration: "none" }}>
          <div
            className="card-wine p-5 h-full transition-all cursor-pointer"
            style={{ minHeight: 120 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--wine) 0%, var(--gold) 100%)",
                  boxShadow: "0 0 14px rgba(123,31,58,0.4)",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>✦</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                  Assistente Kairo
                </p>
                <p className="text-xs" style={{ color: "rgba(245,242,235,0.5)" }}>
                  Dr. Edson Barroso · Anti-medo
                </p>
              </div>
              <span className="ml-auto badge badge-wine">IA</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,235,0.7)" }}>
              "O medo pode bater à porta, mas a fé decide quem entra." Converse com Kairo agora.
            </p>
          </div>
        </Link>

        {/* Card Legendários */}
        <Link href="/legendarios" style={{ textDecoration: "none" }}>
          <div
            className="card p-5 h-full transition-all cursor-pointer"
            style={{ minHeight: 120, border: "1px solid rgba(217,119,6,0.35)", background: "linear-gradient(135deg, rgba(120,53,15,0.2) 0%, rgba(20,12,4,0.7) 100%)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                  boxShadow: "0 0 14px rgba(217,119,6,0.55)",
                  border: "2px solid rgba(245,158,11,0.6)",
                }}
              >
                <img src="/legendarios_logo.png" alt="Legendários" style={{ width: "78%", height: "78%", objectFit: "contain" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                  Legendários
                </p>
                <p className="text-xs" style={{ color: "rgba(245,242,235,0.5)" }}>
                  Movimento · +150 mil homens
                </p>
              </div>
              <span className="ml-auto badge" style={{ background: "rgba(217,119,6,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.45)", fontFamily: "var(--font-cinzel)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>NOVO</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,235,0.7)" }}>
              "Homens inquebrantáveis com histórias dignas a serem contadas." Conheça o movimento.
            </p>
          </div>
        </Link>
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
                      Oração
                    </p>
                    <p className="scripture text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {devotional.prayer_text}
                    </p>
                  </div>
                )}
                <Link href="/devocional" className="btn-outline" style={{ fontSize: "0.75rem", padding: "0.5rem 1.25rem" }}>
                  Ler completo
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                  O devocional de hoje ainda está sendo preparado.
                </p>
                <p className="scripture text-sm text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                  &quot;A sua palavra é lâmpada que ilumina o meu caminho.&quot;
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
          {/* Próximos Eventos */}
          <div className="card p-5">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
              Próximos Eventos
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
                        {event.location ?? "Casa de Oração"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nenhum evento próximo.
              </p>
            )}
            <Link href="/eventos" className="btn-ghost w-full mt-3 justify-center" style={{ fontSize: "0.75rem" }}>
              Ver todos
            </Link>
          </div>

          {/* Pedidos de Oração */}
          <div className="card p-5">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
              Pedidos de Oração
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
                Nenhum pedido público no momento.
              </p>
            )}
            <Link href="/oracao" className="btn-ghost w-full mt-3 justify-center" style={{ fontSize: "0.75rem" }}>
              Ir ao mural
            </Link>
          </div>
        </div>
      </div>

      {/* Rodapé: Casa de Oração */}
      <div
        className="p-5 rounded-xl text-center"
        style={{
          background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(6,10,20,0.8) 100%)",
          border: "1px solid rgba(201,168,76,0.12)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}>
          CASA DE ORAÇÃO · FRANCA/SP
        </p>
        <p className="scripture text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          "A minha casa será chamada casa de oração para todos os povos." — Isaías 56:7
        </p>
        <a
          href="https://casadeoracao.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs mt-2 inline-block"
          style={{ color: "rgba(201,168,76,0.5)" }}
        >
          casadeoracao.com.br
        </a>
      </div>
    </div>
  );
}
