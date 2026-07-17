import type { CalendarEvent } from "../types";

interface AgendaEventCardProps {
  event: CalendarEvent;
  onRemove: (id: string) => void;
}

export function AgendaEventCard({ event, onRemove }: AgendaEventCardProps) {
  return (
    <div className="rounded-xl p-4 space-y-2"
      style={{ background: "var(--bg-2)", border: "1px solid rgba(201,162,39,0.1)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
            {event.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{event.time}</p>
        </div>
        <button onClick={() => onRemove(event.id)} className="text-xs px-2 py-1 rounded"
          style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}>
          ✕
        </button>
      </div>
      {event.description && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{event.description}</p>
      )}
      {event.psalm_ref && event.psalm_text && (
        <div className="rounded-lg p-3 mt-2" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.12)" }}>
          <p className="text-xs italic" style={{ color: "var(--gold-label)" }}>
            &ldquo;{event.psalm_text}&rdquo;
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
            — {event.psalm_ref}
          </p>
        </div>
      )}
    </div>
  );
}
