import { createClient } from "@/lib/supabase/server";
import { listUpcomingEvents } from "@/lib/calendar/client";
import type { Event, EventCategory } from "@/types/database";

export const metadata = { title: "Eventos" };

const CATEGORY_LABEL: Record<EventCategory | string, string> = {
  culto: "Culto",
  retiro: "Retiro",
  rpm: "RPM Legendários",
  top: "TOP",
  celula: "Célula",
  outro: "Evento",
};

const CATEGORY_STYLE: Record<string, string> = {
  culto: "badge-gold",
  retiro: "badge-success",
  rpm: "badge-gold",
  top: "badge-gold",
  celula: "badge-pending",
  outro: "badge-gold",
};

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", ""),
    weekday: d.toLocaleDateString("pt-BR", { weekday: "long" }),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    full: d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }),
  };
}

function buildGoogleCalendarUrl(event: Event) {
  const start = new Date(event.date_start);
  const end = event.date_end ? new Date(event.date_end) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return (
    "https://www.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${fmt(start)}/${fmt(end)}` +
    `&details=${encodeURIComponent(event.description ?? "")}` +
    `&location=${encodeURIComponent(event.location ?? "Casa de Oração Franca")}` +
    "&sf=true&output=xml"
  );
}

export default async function EventosPage() {
  const supabase = await createClient();

  const { data: dbEvents } = await supabase
    .from("events")
    .select("*")
    .gte("date_start", new Date().toISOString())
    .order("date_start", { ascending: true })
    .limit(20);

  const events = (dbEvents ?? []) as Event[];

  // Busca eventos do Google Calendar como complemento
  const googleEvents = await listUpcomingEvents(5);

  const now = new Date();
  const nextEvent = events[0] ?? null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Programação
        </p>
        <h1 className="text-2xl">Eventos</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Agenda da Casa de Oração e Ministério Legendários
        </p>
      </div>

      {/* Próximo evento em destaque */}
      {nextEvent && (() => {
        const d = formatEventDate(nextEvent.date_start);
        return (
          <div className="card p-6 glow-gold">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
              Próximo Evento
            </p>
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl shrink-0"
                style={{ background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)" }}>
                <span className="text-2xl font-bold leading-none" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                  {d.day}
                </span>
                <span className="text-xs leading-none mt-1" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)" }}>
                  {d.month}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-lg leading-snug">{nextEvent.title}</h2>
                  <span className={`badge ${CATEGORY_STYLE[nextEvent.category] ?? "badge-gold"}`}>
                    {CATEGORY_LABEL[nextEvent.category]}
                  </span>
                </div>
                {nextEvent.description && (
                  <p className="text-sm mb-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {nextEvent.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span>{d.weekday} · {d.time}</span>
                  {nextEvent.location && <span>{nextEvent.location}</span>}
                </div>
                <a
                  href={buildGoogleCalendarUrl(nextEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-2"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Adicionar ao Google Agenda
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lista de eventos */}
      <div>
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          {events.length > 0 ? `${events.length} Próximos Eventos` : "Programação"}
        </p>

        {events.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="scripture text-base mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              "Para tudo há uma estação certa; há um tempo certo para cada propósito."
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
              Eclesiastes 3:1
            </p>
            <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              Nenhum evento programado no momento. Verifique em breve.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map((event, i) => {
              const d = formatEventDate(event.date_start);
              const isPast = new Date(event.date_start) < now;
              return (
                <div key={event.id}
                  className="card p-4 flex items-start gap-4 flex-wrap"
                  style={{ opacity: isPast ? 0.5 : 1 }}>
                  <div className="flex flex-col items-center w-12 shrink-0">
                    <span className="text-xl font-bold leading-none" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                      {d.day}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
                      {d.month}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>
                        {event.title}
                      </p>
                      <span className={`badge ${CATEGORY_STYLE[event.category] ?? "badge-gold"}`}
                        style={{ fontSize: "0.6rem" }}>
                        {CATEGORY_LABEL[event.category]}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {d.weekday} às {d.time}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                  <a
                    href={buildGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Adicionar ao Google Agenda"
                    className="shrink-0 p-2 rounded-lg transition-all"
                    style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cultos regulares */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Cultos Regulares — Casa de Oração Franca
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { day: "Quarta-feira", time: "20h00", type: "Culto de Oração" },
            { day: "Domingo", time: "10h00", type: "Culto da Manhã" },
            { day: "Domingo", time: "18h00", type: "Culto da Noite" },
          ].map((c) => (
            <div key={c.time} className="p-4 rounded-lg text-center"
              style={{ background: "rgba(201,162,39,0.05)", border: "1px solid rgba(201,162,39,0.12)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-cinzel)" }}>
                {c.day}
              </p>
              <p className="text-2xl font-bold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                {c.time}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {c.type}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          Av. Alagoas, 1163 — Jardim Paulista, Franca/SP
        </p>
      </div>

      {/* RPM Legendários */}
      <div className="card p-6"
        style={{ borderColor: "rgba(201,162,39,0.25)" }}>
        <p className="text-xs tracking-widest uppercase mb-3"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Ministério Legendários Brasil
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold mb-1" style={{ color: "#fff", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
              RPM — Reunião Mensal
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Toda primeira segunda-feira do mês
            </p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold mb-1" style={{ color: "#fff", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
              TOP — Track Outdoor
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Imersões de 4 dias — datas divulgadas pelo app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
