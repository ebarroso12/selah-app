"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";


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
  legendario_photo_url: string | null;
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
  const supabase = getBrowserClient();
  const [members, setMembers] = useState<LegendarioMember[]>([]);
  const [events, setEvents] = useState<LegendarioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"membros" | "eventos">("membros");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [numberValues, setNumberValues] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
    const membersData = (mRes.data ?? []) as LegendarioMember[];
    setMembers(membersData);
    // Inicializar os valores dos números
    const nums: Record<string, string> = {};
    membersData.forEach(m => {
      nums[m.id] = m.legendario_number != null ? String(m.legendario_number) : "";
    });
    setNumberValues(nums);
    setEvents((eRes.data ?? []) as LegendarioEvent[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleLegendario(id: string, current: boolean) {
    const { error } = await supabase.from("profiles").update({ is_legendario: !current }).eq("id", id);
    if (error) {
      setMsg("Erro: " + error.message);
    } else {
      setMsg(!current ? "✓ Marcado como Legendário!" : "✓ Removido.");
    }
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function saveNumber(id: string) {
    const val = numberValues[id];
    const numVal = val === "" ? null : parseInt(val, 10);
    if (val !== "" && isNaN(numVal!)) {
      setMsg("Número inválido.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    const { error } = await supabase.from("profiles").update({ legendario_number: numVal }).eq("id", id);
    if (error) {
      setMsg("Erro ao salvar número: " + error.message);
    } else {
      setMsg("✓ Número atualizado!");
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function handlePhotoUpload(memberId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(memberId);
    setMsg("Enviando foto...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "legendarios");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        const { error } = await supabase.from("profiles").update({ legendario_photo_url: json.url }).eq("id", memberId);
        if (error) {
          setMsg("Erro ao salvar foto: " + error.message);
        } else {
          setMsg("✓ Foto atualizada!");
          load();
        }
      } else {
        setMsg("Erro no upload: " + (json.error || "desconhecido"));
      }
    } catch (err: any) {
      setMsg("Erro no upload: " + err.message);
    } finally {
      setUploadingId(null);
      setTimeout(() => setMsg(""), 4000);
    }
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
      setEventTitle("");
      setEventDate("");
      setEventLocation("");
      load();
    } else {
      setMsg("Erro: " + error.message);
    }
    setTimeout(() => setMsg(""), 3000);
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

      {msg && <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: msg.startsWith("✓") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}

      {loading ? (
        <p className="text-center text-sm text-white/30">Carregando...</p>
      ) : activeTab === "membros" ? (
        <div className="space-y-4">
          <input className="input-field w-full" placeholder="Buscar membro..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="space-y-3">
            {filtered.map(m => (
              <div key={m.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Foto do Legendário */}
                  <div className="relative shrink-0">
                    {m.legendario_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.legendario_photo_url} alt={m.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-[#E85D04]/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg" style={{ background: "rgba(232,93,4,0.1)", border: "2px solid rgba(232,93,4,0.2)" }}>
                        {m.full_name?.[0] || "?"}
                      </div>
                    )}
                    <button
                      onClick={() => fileRefs.current[m.id]?.click()}
                      disabled={uploadingId === m.id}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background: "#E85D04", color: "white" }}
                      title="Alterar foto"
                    >
                      {uploadingId === m.id ? "..." : "📷"}
                    </button>
                    <input
                      ref={el => { fileRefs.current[m.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handlePhotoUpload(m.id, e)}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{m.full_name}</p>
                    <p className="text-xs text-white/40">{m.email}</p>
                    {m.city && <p className="text-xs text-white/30">{m.city}{m.state ? `, ${m.state}` : ""}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Número do Legendário */}
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-white/30 uppercase">Nº Legendário</label>
                    <input
                      type="number"
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-20 text-[#E85D04]"
                      value={numberValues[m.id] ?? ""}
                      onChange={e => setNumberValues(prev => ({ ...prev, [m.id]: e.target.value }))}
                      onBlur={() => saveNumber(m.id)}
                      placeholder="0"
                    />
                  </div>

                  {/* Toggle Legendário */}
                  <button
                    onClick={() => toggleLegendario(m.id, m.is_legendario)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold ${m.is_legendario ? "bg-[#E85D04]/20 text-[#E85D04] border border-[#E85D04]/40" : "bg-white/5 text-white/40 border border-white/10"}`}
                  >
                    {m.is_legendario ? "✓ Legendário" : "+ Tornar Legendário"}
                  </button>

                  {m.is_legendario && m.legendario_number && (
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(232,93,4,0.1)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.2)" }}>
                      #{m.legendario_number}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-white/30 py-8">Nenhum membro encontrado.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setShowEventForm(true)} className="btn-primary w-full py-2 text-xs uppercase tracking-widest" style={{ background: "#E85D04" }}>+ Novo Evento Legendários</button>
          
          {showEventForm && (
            <form onSubmit={saveEvent} className="card p-4 space-y-3">
              <p className="text-sm font-bold text-[#E85D04]" style={{ fontFamily: "var(--font-cinzel)" }}>Novo Evento</p>
              <input className="input-field w-full" placeholder="Título do Evento" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <input type="datetime-local" className="input-field w-full" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                <select className="input-field w-full bg-black" value={eventCategory} onChange={e => setEventCategory(e.target.value as "rpm" | "top" | "outro")}>
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
                  {e.location && <p className="text-[10px] text-white/30">📍 {e.location}</p>}
                </div>
                <button onClick={() => deleteEvent(e.id)} className="text-red-500/50 hover:text-red-500 p-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-sm text-white/30 py-8">Nenhum evento cadastrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
