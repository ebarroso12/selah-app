import { EventCard } from "./EventCard";
import type { Event } from "../types";

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="scripture text-base mb-2" style={{ color: "var(--text-subtle)" }}>
          &quot;Para tudo há uma estação certa; há um tempo certo para cada propósito.&quot;
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Eclesiastes 3:1
        </p>
        <p className="text-sm mt-4" style={{ color: "var(--text-subtle)" }}>
          Nenhum evento programado no momento. Verifique em breve.
        </p>
      </div>
    );
  }

  const [first, ...rest] = events;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Próximo Evento
        </p>
        <EventCard event={first} />
      </div>

      {rest.length > 0 && (
        <div>
          <p className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
            {rest.length + 1} Próximos Eventos
          </p>
          <div className="grid gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
