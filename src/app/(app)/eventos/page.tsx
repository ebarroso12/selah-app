export const dynamic = "force-dynamic";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { EventList } from "@/features/eventos";
import type { Event } from "@/features/eventos";

export const metadata = { title: "Eventos" };

async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("date_start", new Date().toISOString())
    .order("date_start", { ascending: true })
    .limit(20);
  return (data ?? []) as Event[];
}

export default async function EventosPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Programação
        </p>
        <h1 className="text-2xl">Eventos</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Agenda da Casa de Oração e Ministério Legendários
        </p>
      </div>

      <EventList events={events} />

      {/* Cultos regulares */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
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
              <p className="text-xs mb-1" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
                {c.day}
              </p>
              <p className="text-2xl font-bold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                {c.time}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {c.type}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: "var(--text-subtle)" }}>
          Av. Alagoas, 1163 — Jardim Paulista, Franca/SP
        </p>
      </div>

      {/* RPM Legendários */}
      <div className="card p-6" style={{ borderColor: "rgba(201,162,39,0.25)" }}>
        <p className="text-xs tracking-widest uppercase mb-3"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Ministério Legendários Brasil
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold mb-1" style={{ color: "#fff", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
              RPM — Reunião Mensal
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Toda primeira segunda-feira do mês
            </p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold mb-1" style={{ color: "#fff", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
              TOP — Track Outdoor
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Imersões de 4 dias — datas divulgadas pelo app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
