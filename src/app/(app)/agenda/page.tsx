"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { getTodayBR } from "@/shared/lib/utils";
import { useCalendarEvents } from "@/features/agenda";
import { AgendaEventCard } from "@/features/agenda";
import { NewEventForm } from "@/features/agenda";

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaPage() {
  const { events, loading, create, remove } = useCalendarEvents();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [msg, setMsg] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayBR();

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  }

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  async function handleCreate(input: Parameters<typeof create>[0]) {
    const ok = await create(input);
    if (ok) {
      setMsg("Compromisso salvo com bênção!");
      setShowForm(false);
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("Erro ao salvar compromisso.");
      setTimeout(() => setMsg(""), 3000);
    }
    return ok;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Agenda</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-subtle)" }}>
            Seus compromissos abençoados com Salmos
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setSelectedDate(null); }}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Compromisso
        </button>
      </div>

      {msg && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.25)" }}>
          {msg}
        </div>
      )}

      {/* Calendário */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg" style={{ background: "var(--bg-2)", color: "var(--text-muted)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", fontSize: "1rem", letterSpacing: "0.1em" }}>
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg" style={{ background: "var(--bg-2)", color: "var(--text-muted)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center py-1"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = getEventsForDay(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            return (
              <button key={day} onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all"
                style={{
                  background: isSelected ? "rgba(201,162,39,0.2)" : isToday ? "rgba(201,162,39,0.08)" : "transparent",
                  border: isSelected ? "1px solid rgba(201,162,39,0.5)" : isToday ? "1px solid rgba(201,162,39,0.2)" : "1px solid transparent",
                  color: isToday ? "#c9a227" : "var(--text-muted)",
                  fontFamily: isToday ? "var(--font-cinzel)" : "inherit",
                  fontSize: "0.8rem",
                }}>
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="w-1 h-1 rounded-full" style={{ background: "#c9a227" }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Eventos do dia selecionado */}
      {selectedDate && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <button onClick={() => setShowForm(true)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}>
              + Adicionar
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Nenhum compromisso neste dia.</p>
          ) : (
            selectedEvents.map((ev) => (
              <AgendaEventCard key={ev.id} event={ev} onRemove={remove} />
            ))
          )}
        </div>
      )}

      {/* Próximos compromissos */}
      {!selectedDate && (
        <div className="card p-4 space-y-3">
          <p style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold-label)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Próximos Compromissos
          </p>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#c9a227]" />
            </div>
          ) : events.filter((e) => e.date >= today).length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "var(--text-subtle)" }}>
              Nenhum compromisso futuro. Adicione o primeiro!
            </p>
          ) : (
            events.filter((e) => e.date >= today).slice(0, 5).map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "var(--bg-2)", border: "1px solid var(--bg-2)" }}>
                <div className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                  style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}>
                  <p style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "0.9rem", lineHeight: "1" }}>
                    {new Date(ev.date + "T12:00:00").getDate()}
                  </p>
                  <p style={{ color: "var(--gold-label)", fontSize: "0.5rem", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
                    {MONTH_NAMES[new Date(ev.date + "T12:00:00").getMonth()].substring(0, 3).toUpperCase()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>
                    {ev.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    {ev.time}{ev.psalm_ref ? ` · ${ev.psalm_ref}` : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <NewEventForm
          initialDate={selectedDate ?? undefined}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
