"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";


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
  image_url: string | null;
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
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [uploadingEventImg, setUploadingEventImg] = useState(false);
  const eventImgRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [mRes, eRes] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name", { ascending: true }),
      supabase.from("events").select("*").in("category", ["rpm", "top", "outro"]).order("date_start", { ascending: false })
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

  async function handleEventImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEventImg(true);
    setMsg("Enviando imagem do evento...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "eventos-legendarios");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setEventImageUrl(json.url);
        setMsg("✓ Imagem enviada!");
      } else {
        setMsg("Erro no upload: " + (json.error || "desconhecido"));
      }
    } catch (err: any) {
      setMsg("Erro no upload: " + err.message);
    } finally {
      setUploadingEventImg(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("events").insert({
      title: eventTitle,
      date_start: new Date(eventDate).toISOString(),
      location: eventLocation || null,
      category: eventCategory,
      image_url: eventImageUrl || null,
    });
    if (!error) {
      setMsg("✓ Evento criado!");
      setShowEventForm(false);
      setEventTitle("");
      setEventDate("");
      setEventLocation("");
      setEventImageUrl("");
      load();
    } else {
      setMsg("Erro: " + error.message);
    }
    setTimeout(() => setMsg(""), 3000);
  }

  function cancelEventForm() {
    setShowEventForm(false);
    setEventTitle("");
    setEventDate("");
    setEventLocation("");
    setEventImageUrl("");
    setMsg("");
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

  const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(232,93,4,0.2)", color: "var(--text)" };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#E85D04" }}>Legendários</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>Gestão de membros e eventos do ministério</p>
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
          <button
            onClick={() => setShowEventForm(true)}
            className="btn-primary w-full py-2 text-xs uppercase tracking-widest"
            style={{ background: "#E85D04" }}
          >
            + Novo Evento Legendários
          </button>

          {showEventForm && (
            <form onSubmit={saveEvent} className="card p-4 space-y-4">
              <p className="text-sm font-bold text-[#E85D04]" style={{ fontFamily: "var(--font-cinzel)" }}>Novo Evento</p>

              <div>
                <label className="block mb-1 text-[10px] uppercase tracking-widest" style={{ color: "rgba(232,93,4,0.7)" }}>Título *</label>
                <input className={inp} style={inpStyle} placeholder="Ex: RPM — Encontro de Líderes" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] uppercase tracking-widest" style={{ color: "rgba(232,93,4,0.7)" }}>Data e Hora *</label>
                  <input type="datetime-local" className={inp} style={inpStyle} value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] uppercase tracking-widest" style={{ color: "rgba(232,93,4,0.7)" }}>Categoria</label>
                  <select className={inp} style={{ ...inpStyle, background: "#0a0e1a" }} value={eventCategory} onChange={e => setEventCategory(e.target.value as "rpm" | "top" | "outro")}>
                    <option value="rpm">RPM</option>
                    <option value="top">TOP</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] uppercase tracking-widest" style={{ color: "rgba(232,93,4,0.7)" }}>Local</label>
                <input className={inp} style={inpStyle} placeholder="Ex: Casa de Oração Franca" value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
              </div>

              {/* Upload de imagem/panfleto do evento */}
              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-widest" style={{ color: "rgba(232,93,4,0.7)" }}>Panfleto / Imagem do Evento</label>
                <div className="space-y-2">
                  {eventImageUrl && (
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={eventImageUrl} alt="Panfleto" className="h-32 w-auto rounded-lg object-cover border border-[#E85D04]/20" />
                      <button
                        type="button"
                        onClick={() => setEventImageUrl("")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                      >×</button>
                    </div>
                  )}
                  <div className="flex gap-2 items-center flex-wrap">
                    <button
                      type="button"
                      onClick={() => eventImgRef.current?.click()}
                      disabled={uploadingEventImg}
                      className="px-3 py-2 rounded-lg text-xs font-semibold"
                      style={{ background: "rgba(232,93,4,0.1)", border: "1px solid rgba(232,93,4,0.3)", color: "#E85D04", opacity: uploadingEventImg ? 0.5 : 1 }}
                    >
                      {uploadingEventImg ? "Enviando..." : "📎 Enviar Imagem"}
                    </button>
                    <span className="text-[10px] text-white/30">ou cole uma URL:</span>
                    <input
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                      style={inpStyle}
                      value={eventImageUrl}
                      placeholder="https://..."
                      onChange={e => setEventImageUrl(e.target.value)}
                    />
                  </div>
                  <input
                    ref={eventImgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEventImageUpload}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest" style={{ background: "#E85D04", color: "white" }}>
                  Salvar Evento
                </button>
                <button type="button" onClick={cancelEventForm} className="flex-1 py-2 rounded-lg text-xs" style={{ background: "var(--bg-2)", border: "1px solid var(--bg-2)", color: "var(--text-muted)" }}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} className="card p-4 flex items-start gap-3 justify-between">
                {e.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image_url} alt={e.title} className="h-16 w-16 rounded-lg object-cover shrink-0 border border-[#E85D04]/20" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#E85D04]">{e.category}</span>
                  <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{e.title}</p>
                  <p className="text-[10px] text-white/40">{new Date(e.date_start).toLocaleString("pt-BR")}</p>
                  {e.location && <p className="text-[10px] text-white/30">📍 {e.location}</p>}
                </div>
                <button onClick={() => deleteEvent(e.id)} className="text-red-500/50 hover:text-red-500 p-2 shrink-0">
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
