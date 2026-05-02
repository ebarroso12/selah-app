"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

const supabase = getBrowserClient();

interface LegendarioMember {
  id: string;
  full_name: string;
  email: string;
  church_name: string;
  city: string;
  state: string;
  is_legendario: boolean;
  is_legendario_spouse: boolean;
  legendario_number: number | null;
  status: string;
  created_at: string;
  last_seen_at: string | null;
}

interface LegendarioEvent {
  id: string;
  title: string;
  date_start: string;
  location: string | null;
  category: "rpm" | "top" | "outro";
}

export default function AdminLegendariosPage() {
  const [members, setMembers] = useState<LegendarioMember[]>([]);
  const [events, setEvents] = useState<LegendarioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"membros" | "eventos">("membros");

  // Event Form
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState<"rpm" | "top" | "outro">("rpm");

  async function load() {
    setLoading(true);
    const [mRes, eRes] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name", { ascending: true }),
      supabase.from("events").select("*").in("category", ["rpm", "top"]).order("date_start", { ascending: false })
    ]);
    setMembers((mRes.data ?? []) as LegendarioMember[]);
    setEvents((eRes.data ?? []) as LegendarioEvent[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleLegendario(id: string, current: boolean) {
    await supabase.from("profiles").update({ is_legendario: !current }).eq("id", id);
    setMsg(!current ? "✓ Marcado como Legendário!" : "✓ Removido.");
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function updateNumber(id: string, num: string) {
    const val = num === "" ? null : parseInt(num);
    await supabase.from("profiles").update({ legendario_number: val }).eq("id", id);
    setMsg("✓ Número atualizado!");
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("events").insert({
      title: eventTitle,
      date_start: new Date(eventDate).toISOString(),
      location: eventLocation,
      category: eventCategory
    });
    if (!error) {
      setMsg("✓ Evento criado!");
      setShowEventForm(false);
      load();
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Apagar evento?")) return;
    await supabase.from("events").delete().eq("id", id);
    load();
  }

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#E85D04" }}>Legendários</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Gestão de membros e eventos do ministério</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button onClick={() => setActiveTab("membros")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeTab === "membros" ? "border-b-2 border-[#E85D04] text-[#E85D04]" : "text-white/40"}`}>Membros</button>
        <button onClick={() => setActiveTab("eventos")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeTab === "eventos" ? "border-b-2 border-[#E85D04] text-[#E85D04]" : "text-white/40"}`}>Eventos</button>
      </div>

      {msg && <p className="text-xs text-center text-gold">{msg}</p>}

      {activeTab === "membros" ? (
        <div className="space-y-4">
          <input className="input-field w-full" placeholder="Buscar membro..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="space-y-2">
            {filtered.map(m => (
              <div key={m.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{m.full_name}</p>
                  <p className="text-xs text-white/40">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-white/30 uppercase">Nº</label>
                    <input type="number" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-16 text-gold" 
                      defaultValue={m.legendario_number || ""} onBlur={e => updateNumber(m.id, e.target.value)} />
                  </div>
                  <button onClick={() => toggleLegendario(m.id, m.is_legendario)} className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold ${m.is_legendario ? "bg-[#E85D04]/20 text-[#E85D04] border border-[#E85D04]/40" : "bg-white/5 text-white/40 border border-white/10"}`}>
                    {m.is_legendario ? "Legendário" : "+ Legendário"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setShowEventForm(true)} className="btn-primary w-full py-2 text-xs uppercase tracking-widest" style={{ background: "#E85D04" }}>+ Novo Evento Legendários</button>
          
          {showEventForm && (
            <form onSubmit={saveEvent} className="card p-4 space-y-3">
              <input className="input-field w-full" placeholder="Título do Evento" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <input type="datetime-local" className="input-field w-full" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                <select className="input-field w-full bg-black" value={eventCategory} onChange={e => setEventCategory(e.target.value as any)}>
                  <option value="rpm">RPM</option>
                  <option value="top">TOP</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <input className="input-field w-full" placeholder="Local" value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary py-2 text-xs">Salvar</button>
                <button type="button" onClick={() => setShowEventForm(false)} className="flex-1 btn-outline py-2 text-xs">Cancelar</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} className="card p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#E85D04]">{e.category}</span>
                  <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{e.title}</p>
                  <p className="text-[10px] text-white/40">{new Date(e.date_start).toLocaleString("pt-BR")}</p>
                </div>
                <button onClick={() => deleteEvent(e.id)} className="text-red-500/50 hover:text-red-500 p-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
