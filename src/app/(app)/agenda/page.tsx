"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

// Salmos para notificações de compromissos
const PSALMS_FOR_EVENTS = [
  { ref: "Salmos 37:5", text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará." },
  { ref: "Salmos 121:2", text: "O meu socorro vem do Senhor, que fez os céus e a terra." },
  { ref: "Salmos 46:1", text: "Deus é o nosso refúgio e força, socorro bem presente na angústia." },
  { ref: "Salmos 23:1", text: "O Senhor é o meu pastor; nada me faltará." },
  { ref: "Salmos 91:11", text: "Pois ele ordenará que os seus anjos te guardem em todos os teus caminhos." },
  { ref: "Salmos 27:1", text: "O Senhor é a minha luz e a minha salvação; a quem temerei?" },
  { ref: "Salmos 32:8", text: "Instruir-te-ei e ensinar-te-ei o caminho que deves seguir." },
  { ref: "Salmos 55:22", text: "Lança o teu cuidado sobre o Senhor, e ele te susterá." },
  { ref: "Salmos 119:105", text: "A tua palavra é lâmpada que ilumina o meu caminho." },
  { ref: "Salmos 34:18", text: "O Senhor está perto dos que têm o coração quebrantado." },
];

function getRandomPsalm() {
  return PSALMS_FOR_EVENTS[Math.floor(Math.random() * PSALMS_FOR_EVENTS.length)];
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  psalm_ref: string;
  psalm_text: string;
  user_id: string;
  created_at: string;
  notify: boolean;
}

export default function AgendaPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    description: "",
    notify: true,
  });

  const loadEvents = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const psalm = getRandomPsalm();
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: form.title,
      date: form.date,
      time: form.time,
      description: form.description,
      psalm_ref: psalm.ref,
      psalm_text: psalm.text,
      notify: form.notify,
    });
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg("Compromisso salvo com bênção!");
    setShowForm(false);
    setForm({ title: "", date: new Date().toISOString().split("T")[0], time: "09:00", description: "", notify: true });
    loadEvents();
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id: string) {
    const supabase = getBrowserClient();
    await supabase.from("calendar_events").delete().eq("id", id);
    loadEvents();
  }

  // Geração do calendário
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  }

  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
            Agenda
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Seus compromissos abençoados com Salmos
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSelectedDate(null); }}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Compromisso
        </button>
      </div>

      {msg && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.25)" }}>
          {msg}
        </div>
      )}

      {/* Calendário */}
      <div className="card p-4">
        {/* Navegação do mês */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", fontSize: "1rem", letterSpacing: "0.1em" }}>
            {monthNames[month]} {year}
          </h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center py-1" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = getEventsForDay(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all"
                style={{
                  background: isSelected ? "rgba(201,162,39,0.2)" : isToday ? "rgba(201,162,39,0.08)" : "transparent",
                  border: isSelected ? "1px solid rgba(201,162,39,0.5)" : isToday ? "1px solid rgba(201,162,39,0.2)" : "1px solid transparent",
                  color: isToday ? "#c9a227" : "rgba(255,255,255,0.7)",
                  fontFamily: isToday ? "var(--font-cinzel)" : "inherit",
                  fontSize: "0.8rem",
                }}
              >
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
            <button
              onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setShowForm(true); }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}>
              + Adicionar
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum compromisso neste dia.</p>
          ) : (
            selectedEvents.map(ev => (
              <div key={ev.id} className="rounded-xl p-4 space-y-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,162,39,0.1)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>
                      {ev.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{ev.time}</p>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="text-xs px-2 py-1 rounded"
                    style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}>
                    ✕
                  </button>
                </div>
                {ev.description && (
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{ev.description}</p>
                )}
                {/* Salmo do compromisso */}
                <div className="rounded-lg p-3 mt-2" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.12)" }}>
                  <p className="text-xs italic" style={{ color: "rgba(201,162,39,0.8)" }}>
                    &ldquo;{ev.psalm_text}&rdquo;
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
                    — {ev.psalm_ref}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Próximos compromissos */}
      {!selectedDate && (
        <div className="card p-4 space-y-3">
          <p style={{ fontFamily: "var(--font-cinzel)", color: "rgba(201,162,39,0.6)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Próximos Compromissos
          </p>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#c9a227]" />
            </div>
          ) : events.filter(e => e.date >= today).length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
              Nenhum compromisso futuro. Adicione o primeiro!
            </p>
          ) : (
            events.filter(e => e.date >= today).slice(0, 5).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                  style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}>
                  <p style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "0.9rem", lineHeight: 1 }}>
                    {new Date(ev.date + "T12:00:00").getDate()}
                  </p>
                  <p style={{ color: "rgba(201,162,39,0.6)", fontSize: "0.5rem", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
                    {monthNames[new Date(ev.date + "T12:00:00").getMonth()].substring(0, 3).toUpperCase()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>
                    {ev.title}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{ev.time} · {ev.psalm_ref}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de novo compromisso */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "#0d1526", border: "1px solid rgba(201,162,39,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", letterSpacing: "0.08em" }}>
                Novo Compromisso
              </h3>
              <button onClick={() => setShowForm(false)} style={{ color: "rgba(255,255,255,0.4)" }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                  TÍTULO *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Reunião de oração"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                    DATA *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)", colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                    HORÁRIO
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)", colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
                  DESCRIÇÃO
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detalhes do compromisso..."
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)" }}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.notify} onChange={e => setForm(f => ({ ...f, notify: e.target.checked }))}
                  className="w-4 h-4 accent-[#c9a227]" />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Receber Salmo de encorajamento
                </span>
              </label>
              {/* Preview do Salmo */}
              <div className="rounded-lg p-3" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.12)" }}>
                <p className="text-xs" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
                  UM SALMO SERÁ ATRIBUÍDO AO SEU COMPROMISSO
                </p>
                <p className="text-xs mt-1 italic" style={{ color: "rgba(255,255,255,0.5)" }}>
                  &ldquo;Entrega o teu caminho ao Senhor; confia nele, e ele o fará.&rdquo; — Salmos 37:5
                </p>
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-sm">
                Salvar Compromisso
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
