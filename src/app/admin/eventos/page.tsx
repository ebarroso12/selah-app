"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { getNowBRDateTime } from "@/shared/lib/utils";
import { useEvents } from "@/features/eventos";
import { CATEGORY_LABEL, CATEGORY_COLOR } from "@/features/eventos";
import type { EventCategory, NewEvent } from "@/features/eventos";

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "culto", label: "Culto" },
  { value: "retiro", label: "Retiro" },
  { value: "rpm", label: "RPM" },
  { value: "top", label: "TOP" },
  { value: "celula", label: "Célula" },
  { value: "outro", label: "Outro" },
];

const emptyForm = {
  title: "",
  description: "",
  date_start: getNowBRDateTime(),
  date_end: "",
  location: "",
  category: "culto" as EventCategory,
};

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(184,115,51,0.2)", color: "var(--text)" };
const labelStyle = { color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

export default function AdminEventosPage() {
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
  const { events, loading, error, create, update, remove } = useEvents(filter);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, date_start: getNowBRDateTime() });
    setShowForm(true);
  }

  function openEdit(id: string) {
    const item = events.find((e) => e.id === id);
    if (!item) return;
    setEditingId(id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      date_start: item.date_start.slice(0, 16),
      date_end: item.date_end?.slice(0, 16) ?? "",
      location: item.location ?? "",
      category: item.category,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.title || !form.date_start) { flash("Preencha título e data."); return; }
    setSaving(true);
    const payload: NewEvent = {
      title: form.title,
      description: form.description || null,
      date_start: new Date(form.date_start).toISOString(),
      date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
      location: form.location || null,
      category: form.category,
      image_url: null,
    };
    const ok = editingId
      ? await update(editingId, payload)
      : await create(payload);
    setSaving(false);
    if (ok) {
      flash(editingId ? "✓ Evento atualizado!" : "✓ Evento criado!");
      setShowForm(false);
    } else {
      flash("Erro ao salvar evento.");
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Apagar este evento?")) return;
    await remove(id);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#B87333" }}>Eventos</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            Agenda da Casa de Oração e Ministério Legendários
          </p>
        </div>
        <button onClick={openNew} className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
          style={{ background: "rgba(184,115,51,0.15)", border: "1px solid rgba(184,115,51,0.4)", color: "#B87333" }}>
          + Novo Evento
        </button>
      </div>

      <div className="flex gap-2">
        {[{ key: "upcoming", label: "Próximos" }, { key: "all", label: "Todos" }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key as "upcoming" | "all")}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{
              background: filter === f.key ? "rgba(184,115,51,0.15)" : "var(--bg-2)",
              border: `1px solid ${filter === f.key ? "rgba(184,115,51,0.4)" : "var(--bg-2)"}`,
              color: filter === f.key ? "#B87333" : "var(--text-subtle)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: "#B87333", fontFamily: "var(--font-cinzel)" }}>
            {editingId ? "Editar Evento" : "Novo Evento"}
          </p>
          <div>
            <label className="block mb-1" style={labelStyle}>Título</label>
            <input className={inp} style={inpStyle} value={form.title} placeholder="Nome do evento"
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Data e hora início</label>
              <input type="datetime-local" className={inp} style={inpStyle} value={form.date_start}
                onChange={(e) => setForm((f) => ({ ...f, date_start: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Data e hora fim (opcional)</label>
              <input type="datetime-local" className={inp} style={inpStyle} value={form.date_end}
                onChange={(e) => setForm((f) => ({ ...f, date_end: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Local</label>
              <input className={inp} style={inpStyle} value={form.location} placeholder="Ex: Casa de Oração Franca"
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Categoria</label>
              <select className={inp} style={inpStyle} value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as EventCategory }))}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Descrição</label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={form.description}
              placeholder="Descrição do evento..."
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(184,115,51,0.2)", border: "1px solid rgba(184,115,51,0.5)", color: "#B87333", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Evento"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-xs"
              style={{ background: "var(--bg-2)", border: "1px solid var(--bg-2)", color: "var(--text-muted)" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-center" style={{ color: "#ef4444" }}>{error}</p>}
      {msg && !showForm && <p className="text-xs text-center py-2 rounded-lg"
        style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>{msg}</p>}

      {loading ? (
        <p className="text-center text-sm" style={{ color: "var(--text-subtle)" }}>Carregando...</p>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "var(--text-subtle)" }}>Nenhum evento encontrado.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 rounded-lg text-xs"
            style={{ background: "rgba(184,115,51,0.1)", border: "1px solid rgba(184,115,51,0.3)", color: "#B87333" }}>
            Criar o primeiro evento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((item) => {
            const catColor = CATEGORY_COLOR[item.category] ?? CATEGORY_COLOR.outro;
            const dt = new Date(item.date_start);
            return (
              <div key={item.id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}40`, fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                      {CATEGORY_LABEL[item.category]}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
                      {dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} · {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                    {item.title}
                  </p>
                  {item.location && <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>📍 {item.location}</p>}
                  {item.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-subtle)" }}>{item.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                    Editar
                  </button>
                  <button onClick={() => handleRemove(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
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
