"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Testimony {
  id: string;
  title: string;
  content: string;
  type: string;
  approved: boolean;
  created_at: string;
  profile?: { full_name?: string; church_name?: string; city?: string };
}

const TYPE_LABELS: Record<string, string> = {
  irmao: "Irmão", legendario: "Legendário", esposa_legendario: "Esposa Legendário",
};

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)" };
const labelStyle = { color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

export default function AdminComunidadePage() {
  const [items, setItems] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimony | null>(null);
  const [form, setForm] = useState({ title: "", content: "", type: "irmao" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    let query = supabase
      .from("testimonies")
      .select("*, profile:profiles(full_name, church_name, city)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter === "pending") query = query.eq("approved", false);
    if (filter === "approved") query = query.eq("approved", true);
    const { data } = await query;
    setItems((data ?? []) as unknown as Testimony[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  function openEdit(item: Testimony) {
    setEditing(item);
    setForm({ title: item.title, content: item.content, type: item.type });
    setShowForm(true);
    setMsg("");
  }

  async function save() {
    if (!form.title || !form.content) { setMsg("Preencha título e conteúdo."); return; }
    setSaving(true);
    const { error } = await supabase.from("testimonies").update(form).eq("id", editing!.id);
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg("✓ Testemunho atualizado!");
    setShowForm(false);
    load();
  }

  async function approve(id: string) {
    await supabase.from("testimonies").update({ approved: true }).eq("id", id);
    load();
  }

  async function unapprove(id: string) {
    await supabase.from("testimonies").update({ approved: false }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Apagar este testemunho?")) return;
    await supabase.from("testimonies").delete().eq("id", id);
    load();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Comunidade</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Moderação de testemunhos e publicações da comunidade
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "pending", label: "Pendentes" },
          { key: "approved", label: "Publicados" },
          { key: "all", label: "Todos" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{
              background: filter === f.key ? "rgba(201,162,39,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f.key ? "rgba(201,162,39,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: filter === f.key ? "#c9a227" : "rgba(255,255,255,0.45)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Formulário de edição */}
      {showForm && editing && (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            Editar Testemunho
          </p>
          <div>
            <label className="block mb-1" style={labelStyle}>Título</label>
            <input className={inp} style={inpStyle} value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Tipo</label>
            <select className={inp} style={inpStyle} value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Conteúdo</label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={6} value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.5)", color: "#c9a227", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Carregando...</p>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>
            {filter === "pending" ? "Nenhum testemunho pendente." : "Nenhum testemunho encontrado."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 space-y-3"
              style={{ borderColor: !item.approved ? "rgba(251,191,36,0.2)" : "rgba(201,162,39,0.1)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)" }}>
                      {item.title}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)", fontSize: "0.62rem" }}>
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: item.approved ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                        color: item.approved ? "#34d399" : "#fbbf24",
                        border: `1px solid ${item.approved ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`,
                        fontSize: "0.62rem",
                      }}>
                      {item.approved ? "Publicado" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
                    {item.profile?.full_name}
                    {item.profile?.church_name ? ` · ${item.profile.church_name}` : ""}
                    {item.profile?.city ? ` · ${item.profile.city}` : ""}
                  </p>
                </div>
                <p className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <p className="text-sm line-clamp-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                {item.content}
              </p>
              <div className="flex gap-2 flex-wrap pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {!item.approved ? (
                  <button onClick={() => approve(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                    Aprovar
                  </button>
                ) : (
                  <button onClick={() => unapprove(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                    Despublicar
                  </button>
                )}
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
          ))}
        </div>
      )}
    </div>
  );
}
