"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { getTodayBR } from "@/shared/lib/utils";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";


interface Devotional {
  id: string;
  date: string;
  title: string;
  bible_book: string;
  bible_chapter: number;
  bible_verse_start: number;
  bible_verse_end: number | null;
  bible_passage: string;
  reflection_text: string;
  prayer_text: string | null;
  generated_by_ai: boolean;
  created_at: string;
}

interface Testimony {
  id: string;
  title: string;
  content: string;
  type: string;
  approved: boolean;
  created_at: string;
  profile?: { full_name?: string; church_name?: string };
}

const TYPE_LABELS: Record<string, string> = {
  irmao: "Irmão", legendario: "Legendário", esposa_legendario: "Esposa Leg.",
};

const emptyDev = {
  date: getTodayBR(),
  title: "",
  bible_book: "",
  bible_chapter: 1,
  bible_verse_start: 1,
  bible_verse_end: null as number | null,
  bible_passage: "",
  reflection_text: "",
  prayer_text: "",
};

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(184,115,51,0.2)", color: "var(--text)" };
const labelStyle = { color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

export default function AdminConteudoPage() {
  const supabase = getBrowserClient();
  const [tab, setTab] = useState<"devotionals" | "testimonies">("devotionals");
  const [devs, setDevs] = useState<Devotional[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Devotional | null>(null);
  const [form, setForm] = useState({ ...emptyDev });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadDevs() {
    const { data } = await supabase.from("devotionals").select("*").order("date", { ascending: false }).limit(50);
    setDevs(data ?? []);
  }

  async function loadTestimonies() {
    const { data } = await supabase
      .from("testimonies")
      .select("*, profile:profiles(full_name, church_name)")
      .order("created_at", { ascending: false })
      .limit(50);
    setTestimonies((data ?? []) as unknown as Testimony[]);
  }

  async function load() {
    setLoading(true);
    await Promise.all([loadDevs(), loadTestimonies()]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ ...emptyDev, date: getTodayBR() });
    setShowForm(true);
    setMsg("");
  }

  function openEdit(item: Devotional) {
    setEditing(item);
    setForm({
      date: item.date,
      title: item.title,
      bible_book: item.bible_book,
      bible_chapter: item.bible_chapter,
      bible_verse_start: item.bible_verse_start,
      bible_verse_end: item.bible_verse_end,
      bible_passage: item.bible_passage,
      reflection_text: item.reflection_text,
      prayer_text: item.prayer_text ?? "",
    });
    setShowForm(true);
    setMsg("");
  }

  async function saveDev() {
    if (!form.title || !form.bible_passage || !form.reflection_text) {
      setMsg("Preencha título, passagem e reflexão."); return;
    }
    setSaving(true);
    const payload = { ...form, generated_by_ai: false };
    let error;
    if (editing) {
      ({ error } = await supabase.from("devotionals").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("devotionals").insert(payload));
    }
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg(editing ? "✓ Devocional atualizado!" : "✓ Devocional publicado!");
    setShowForm(false);
    loadDevs();
  }

  async function removeDev(id: string) {
    if (!confirm("Apagar este devocional?")) return;
    await supabase.from("devotionals").delete().eq("id", id);
    loadDevs();
  }

  async function approveTestimony(id: string) {
    await supabase.from("testimonies").update({ approved: true }).eq("id", id);
    loadTestimonies();
  }

  async function removeTestimony(id: string) {
    if (!confirm("Apagar este testemunho?")) return;
    await supabase.from("testimonies").delete().eq("id", id);
    loadTestimonies();
  }

  const pending = testimonies.filter(t => !t.approved);
  const approved = testimonies.filter(t => t.approved);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#B87333" }}>Conteúdo</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            Devocionais · Testemunhos da Comunidade
          </p>
        </div>
        {tab === "devotionals" && (
          <button onClick={openNew} className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(184,115,51,0.15)", border: "1px solid rgba(184,115,51,0.4)", color: "#B87333" }}>
            + Novo Devocional
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "devotionals", label: `Devocionais (${devs.length})` },
          { key: "testimonies", label: `Testemunhos ${pending.length > 0 ? `(${pending.length} pendentes)` : `(${testimonies.length})`}` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "devotionals" | "testimonies")}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{
              background: tab === t.key ? "rgba(184,115,51,0.15)" : "var(--bg-2)",
              border: `1px solid ${tab === t.key ? "rgba(184,115,51,0.4)" : "var(--bg-2)"}`,
              color: tab === t.key ? "#B87333" : "var(--text-subtle)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-sm" style={{ color: "var(--text-subtle)" }}>Carregando...</p>}

      {/* ===== DEVOCIONAIS ===== */}
      {!loading && tab === "devotionals" && (
        <>
          {/* Formulário */}
          {showForm && (
            <div className="card p-5 space-y-4">
              <p className="text-sm font-semibold" style={{ color: "#B87333", fontFamily: "var(--font-cinzel)" }}>
                {editing ? "Editar Devocional" : "Novo Devocional"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1" style={labelStyle}>Data</label>
                  <input type="date" className={inp} style={inpStyle} value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="block mb-1" style={labelStyle}>Título</label>
                  <input className={inp} style={inpStyle} value={form.title} placeholder="Título do devocional"
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1" style={labelStyle}>Livro</label>
                  <input className={inp} style={inpStyle} value={form.bible_book} placeholder="Ex: João"
                    onChange={e => setForm(f => ({ ...f, bible_book: e.target.value }))} />
                </div>
                <div>
                  <label className="block mb-1" style={labelStyle}>Capítulo</label>
                  <input type="number" className={inp} style={inpStyle} value={form.bible_chapter}
                    onChange={e => setForm(f => ({ ...f, bible_chapter: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block mb-1" style={labelStyle}>Vers. início</label>
                  <input type="number" className={inp} style={inpStyle} value={form.bible_verse_start}
                    onChange={e => setForm(f => ({ ...f, bible_verse_start: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block mb-1" style={labelStyle}>Vers. fim</label>
                  <input type="number" className={inp} style={inpStyle} value={form.bible_verse_end ?? ""}
                    onChange={e => setForm(f => ({ ...f, bible_verse_end: e.target.value ? Number(e.target.value) : null }))} />
                </div>
              </div>
              <div>
                <label className="block mb-1" style={labelStyle}>Passagem bíblica</label>
                <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={form.bible_passage}
                  placeholder="Texto da passagem bíblica..."
                  onChange={e => setForm(f => ({ ...f, bible_passage: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1" style={labelStyle}>Reflexão</label>
                <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={7} value={form.reflection_text}
                  placeholder="Texto da reflexão..."
                  onChange={e => setForm(f => ({ ...f, reflection_text: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1" style={labelStyle}>Oração (opcional)</label>
                <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={form.prayer_text ?? ""}
                  placeholder="Texto da oração..."
                  onChange={e => setForm(f => ({ ...f, prayer_text: e.target.value }))} />
              </div>
              {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}
              <div className="flex gap-3">
                <button onClick={saveDev} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
                  style={{ background: "rgba(184,115,51,0.2)", border: "1px solid rgba(184,115,51,0.5)", color: "#B87333", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Publicar"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-xs"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--bg-2)", color: "var(--text-muted)" }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {devs.length === 0 ? (
            <div className="card p-10 text-center">
              <p style={{ color: "var(--text-subtle)" }}>Nenhum devocional publicado ainda.</p>
              <button onClick={openNew} className="mt-4 px-4 py-2 rounded-lg text-xs"
                style={{ background: "rgba(184,115,51,0.1)", border: "1px solid rgba(184,115,51,0.3)", color: "#B87333" }}>
                Criar o primeiro devocional
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {devs.map(item => (
                <div key={item.id} className="card p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(184,115,51,0.1)", color: "#B87333", border: "1px solid rgba(184,115,51,0.2)", fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                        {new Date(item.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      {item.generated_by_ai && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)", fontSize: "0.62rem" }}>
                          IA
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                      {item.bible_book} {item.bible_chapter}:{item.bible_verse_start}{item.bible_verse_end ? `-${item.bible_verse_end}` : ""}
                    </p>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-subtle)" }}>
                      {item.reflection_text.slice(0, 130)}...
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(item)} className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                      Editar
                    </button>
                    <button onClick={() => removeDev(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                      Apagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== TESTEMUNHOS ===== */}
      {!loading && tab === "testimonies" && (
        <div className="space-y-6">
          {/* Pendentes */}
          {pending.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase mb-3"
                style={{ color: "#fbbf24", fontFamily: "var(--font-cinzel)" }}>
                ⚠️ Pendentes de Aprovação ({pending.length})
              </p>
              <div className="space-y-3">
                {pending.map(t => (
                  <div key={t.id} className="card p-4" style={{ borderColor: "rgba(251,191,36,0.2)" }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                            {t.title}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(184,115,51,0.1)", color: "#B87333", border: "1px solid rgba(184,115,51,0.2)", fontSize: "0.62rem" }}>
                            {TYPE_LABELS[t.type] ?? t.type}
                          </span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: "var(--text-subtle)" }}>
                          {t.profile?.full_name} · {t.profile?.church_name}
                        </p>
                        <p className="text-sm line-clamp-3" style={{ color: "var(--text-muted)" }}>
                          {t.content}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approveTestimony(t.id)} className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                          Aprovar
                        </button>
                        <button onClick={() => removeTestimony(t.id)} className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aprovados */}
          <div>
            <p className="text-xs tracking-widest uppercase mb-3"
              style={{ color: "#34d399", fontFamily: "var(--font-cinzel)" }}>
              ✓ Publicados ({approved.length})
            </p>
            {approved.length === 0 ? (
              <div className="card p-8 text-center">
                <p style={{ color: "var(--text-subtle)", fontSize: "0.875rem" }}>Nenhum testemunho publicado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approved.map(t => (
                  <div key={t.id} className="card p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                        {t.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-subtle)" }}>
                        {t.profile?.full_name} · {t.content.slice(0, 100)}...
                      </p>
                    </div>
                    <button onClick={() => removeTestimony(t.id)} className="px-3 py-1.5 rounded-lg text-xs shrink-0"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                      Apagar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
