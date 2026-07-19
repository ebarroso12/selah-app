import type { Event, EventCategory } from "../types";

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  culto: "Culto",
  retiro: "Retiro",
  rpm: "RPM Legendários",
  top: "TOP",
  celula: "Célula",
  outro: "Evento",
};

export const CATEGORY_COLOR: Record<EventCategory, string> = {
  culto: "#c9a227",
  retiro: "#60a5fa",
  rpm: "#34d399",
  top: "#f472b6",
  celula: "#a78bfa",
  outro: "var(--text-subtle)",
};

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const d = new Date(event.date_start);
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const catColor = CATEGORY_COLOR[event.category] ?? CATEGORY_COLOR.outro;

  if (compact) {
    return (
      <div className="card p-4 flex items-start gap-4 flex-wrap">
        <div className="flex flex-col items-center w-12 shrink-0">
          <span className="text-xl font-bold leading-none" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            {day}
          </span>
          <span className="text-xs mt-0.5" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
            {month}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
              {event.title}
            </p>
            <span className="text-[0.6rem] px-2 py-0.5 rounded-full"
              style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}40`, fontFamily: "var(--font-cinzel)" }}>
              {CATEGORY_LABEL[event.category]}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            {weekday} às {time}{event.location ? ` · ${event.location}` : ""}
          </p>
        </div>
      </div>
    );
  }

  function buildGCalUrl() {
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

  return (
    <div className="card p-6 glow-gold">
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl shrink-0"
          style={{ background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)" }}>
          <span className="text-2xl font-bold leading-none" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            {day}
          </span>
          <span className="text-xs leading-none mt-1" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
            {month}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="text-lg leading-snug">{event.title}</h2>
            <span className="text-[0.6rem] px-2 py-0.5 rounded-full"
              style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}40`, fontFamily: "var(--font-cinzel)" }}>
              {CATEGORY_LABEL[event.category]}
            </span>
          </div>
          {event.description && (
            <p className="text-sm mb-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs mb-4" style={{ color: "var(--text-subtle)" }}>
            <span>{weekday} · {time}</span>
            {event.location && <span>{event.location}</span>}
          </div>
          <a href={buildGCalUrl()} target="_blank" rel="noopener noreferrer"
            className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-2">
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
}
