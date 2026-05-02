"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";


type EventCategory = "culto" | "retiro" | "rpm" | "top" | "celula" | "outro";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  location: string | null;
  category: EventCategory;
  image_url: string | null;
  created_at: string;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "culto", label: "Culto" },
  { value: "retiro", label: "Retiro" },
  { value: "rpm", label: "RPM" },
  { value: "top", label: "TOP" },
  { value: "celula", label: "Célula" },
  { value: "outro", label: "Outro" },
];

const CAT_COLORS: Record<string, string> = {
  culto: "#c9a227", retiro: "#60a5fa", rpm: "#34d399", top: "#f472b6", celula: "#a78bfa", outro: "rgba(255,255,255,0.4)",
};

const emptyForm = {
  title: "",
  description: "",
  date_start: new Date().toISOString().slice(0, 16),
  date_end: "",
  location: "",
  category: "culto" as EventCategory,
  image_url: "",
};

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)" };
const labelStyle = { color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

export default function AdminEventosPage() {
  const supabase = getBrowserClient();
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  async function load() {
    setLoading(true);
    let query = supabase.from("events").select("*").order("date_start", { ascending: true });
    if (filter === "upcoming") query = query.gte("date_start", new Date().toISOString());
    const { data } = await query.limit(100);
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm, date_start: new Date().toISOString().slice(0, 16) });
    setShowForm(true);
    setMsg("");
  }

  function openEdit(item: Event) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description ?? "",
      date_start: item.date_start.slice(0, 16),
      date_end: item.date_end?.slice(0, 16) ?? "",
      location: item.location ?? "",
      category: item.category,
      image_url: item.image_url ?? "",
    });
    setShowForm(true);
    setMsg("");
  }

  async function save() {
    if (!form.title || !form.date_start) { setMsg("Preencha título e data."); return; }
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      date_start: new Date(form.date_start).toISOString(),
      date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
      location: form.location || null,
      category: form.category,
      image_url: form.image_url || null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("events").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("events").insert(payload));
    }
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg(editing ? "✓ Evento atualizado!" : "✓ Evento criado!");
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Apagar este evento?")) return;
    await supabase.from("events").delete().eq("id", id);
    load();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Eventos</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Agenda da Casa de Oração e Ministério Legendários
          </p>
        </div>
        <button onClick={openNew} className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
          style={{ background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.4)", color: "#c9a227" }}>
          + Novo Evento
        </button>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {[{ key: "upcoming", label: "Próximos" }, { key: "all", label: "Todos" }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as "upcoming" | "all")}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{
              background: filter === f.key ? "rgba(201,162,39,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f.key ? "rgba(201,162,39,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: filter === f.key ? "#c9a227" : "rgba(255,255,255,0.45)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            {editing ? "Editar Evento" : "Novo Evento"}
          </p>
          <div>
            <label className="block mb-1" style={labelStyle}>Título</label>
            <input className={inp} style={inpStyle} value={form.title} placeholder="Nome do evento"
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Data e hora início</label>
              <input type="datetime-local" className={inp} style={inpStyle} value={form.date_start}
                onChange={e => setForm(f => ({ ...f, date_start: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Data e hora fim (opcional)</label>
              <input type="datetime-local" className={inp} style={inpStyle} value={form.date_end}
                onChange={e => setForm(f => ({ ...f, date_end: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Local</label>
              <input className={inp} style={inpStyle} value={form.location} placeholder="Ex: Casa de Oração Franca"
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Categoria</label>
              <select className={inp} style={inpStyle} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as EventCategory }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Descrição</label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={form.description}
              placeholder="Descrição do evento..."
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>URL da imagem (opcional)</label>
            <input className={inp} style={inpStyle} value={form.image_url} placeholder="https://..."
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>
          {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.5)", color: "#c9a227", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Criar Evento"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Carregando...</p>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum evento encontrado.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 rounded-lg text-xs"
            style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)", color: "#c9a227" }}>
            Criar o primeiro evento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const catColor = CAT_COLORS[item.category] ?? CAT_COLORS.outro;
            const dt = new Date(item.date_start);
            return (
              <div key={item.id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}40`, fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                      {CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-cinzel)" }}>
                      {dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} · {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)" }}>
                    {item.title}
                  </p>
                  {item.location && (
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>📍 {item.location}</p>
                  )}
                  {item.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(item)} className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                    Editar
                  </button>
                  <button onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                    Apagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
