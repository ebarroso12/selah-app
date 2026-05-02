"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChurchSchedule {
  id: string;
  day_of_week: string;
  time: string;
  title: string;
  description: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

interface ChurchMember {
  id: string;
  name: string;
  role: string;
  description: string | null;
  photo_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)" };
const labelStyle = { color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

export default function AdminIgrejaPage() {
  const [tab, setTab] = useState<"schedules" | "members">("schedules");
  const [schedules, setSchedules] = useState<ChurchSchedule[]>([]);
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ChurchSchedule | null>(null);
  const [editingMember, setEditingMember] = useState<ChurchMember | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ day_of_week: "Domingo", time: "19:00", title: "", description: "", location: "", is_active: true });
  const [memberForm, setMemberForm] = useState({ name: "", role: "", description: "", photo_url: "", order_index: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadSchedules() {
    const { data } = await supabase.from("church_schedules").select("*").order("order_index", { ascending: true }).limit(50);
    if (data) setSchedules(data as ChurchSchedule[]);
    else {
      // Tabela pode não existir ainda — mostrar vazio
      setSchedules([]);
    }
  }

  async function loadMembers() {
    const { data } = await supabase.from("church_members").select("*").order("order_index", { ascending: true }).limit(50);
    if (data) setMembers(data as ChurchMember[]);
    else setMembers([]);
  }

  async function load() {
    setLoading(true);
    await Promise.all([loadSchedules(), loadMembers()]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ---- Schedules ----
  function openNewSchedule() {
    setEditingSchedule(null);
    setScheduleForm({ day_of_week: "Domingo", time: "19:00", title: "", description: "", location: "", is_active: true });
    setShowForm(true);
    setMsg("");
  }

  function openEditSchedule(item: ChurchSchedule) {
    setEditingSchedule(item);
    setScheduleForm({ day_of_week: item.day_of_week, time: item.time, title: item.title, description: item.description ?? "", location: item.location ?? "", is_active: item.is_active });
    setShowForm(true);
    setMsg("");
  }

  async function saveSchedule() {
    if (!scheduleForm.title || !scheduleForm.time) { setMsg("Preencha título e horário."); return; }
    setSaving(true);
    const payload = { ...scheduleForm, description: scheduleForm.description || null, location: scheduleForm.location || null };
    let error;
    if (editingSchedule) {
      ({ error } = await supabase.from("church_schedules").update(payload).eq("id", editingSchedule.id));
    } else {
      ({ error } = await supabase.from("church_schedules").insert({ ...payload, order_index: schedules.length }));
    }
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg(editingSchedule ? "✓ Horário atualizado!" : "✓ Horário adicionado!");
    setShowForm(false);
    loadSchedules();
  }

  async function removeSchedule(id: string) {
    if (!confirm("Apagar este horário?")) return;
    await supabase.from("church_schedules").delete().eq("id", id);
    loadSchedules();
  }

  // ---- Members ----
  function openNewMember() {
    setEditingMember(null);
    setMemberForm({ name: "", role: "", description: "", photo_url: "", order_index: members.length, is_active: true });
    setShowForm(true);
    setMsg("");
  }

  function openEditMember(item: ChurchMember) {
    setEditingMember(item);
    setMemberForm({ name: item.name, role: item.role, description: item.description ?? "", photo_url: item.photo_url ?? "", order_index: item.order_index, is_active: item.is_active });
    setShowForm(true);
    setMsg("");
  }

  async function saveMember() {
    if (!memberForm.name || !memberForm.role) { setMsg("Preencha nome e função."); return; }
    setSaving(true);
    const payload = { ...memberForm, description: memberForm.description || null, photo_url: memberForm.photo_url || null };
    let error;
    if (editingMember) {
      ({ error } = await supabase.from("church_members").update(payload).eq("id", editingMember.id));
    } else {
      ({ error } = await supabase.from("church_members").insert(payload));
    }
    setSaving(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg(editingMember ? "✓ Membro atualizado!" : "✓ Membro adicionado!");
    setShowForm(false);
    loadMembers();
  }

  async function removeMember(id: string) {
    if (!confirm("Apagar este membro?")) return;
    await supabase.from("church_members").delete().eq("id", id);
    loadMembers();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Igreja</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Horários de culto, membros e conteúdo da Casa de Oração
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setMsg(""); tab === "schedules" ? openNewSchedule() : openNewMember(); }}
          className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
          style={{ background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.4)", color: "#c9a227" }}>
          + {tab === "schedules" ? "Novo Horário" : "Novo Membro"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "schedules", label: `Horários (${schedules.length})` },
          { key: "members", label: `Membros (${members.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key as typeof tab); setShowForm(false); }}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{
              background: tab === t.key ? "rgba(201,162,39,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === t.key ? "rgba(201,162,39,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: tab === t.key ? "#c9a227" : "rgba(255,255,255,0.45)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== FORMULÁRIO HORÁRIOS ===== */}
      {showForm && tab === "schedules" && (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            {editingSchedule ? "Editar Horário" : "Novo Horário de Culto"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Dia da semana</label>
              <select className={inp} style={inpStyle} value={scheduleForm.day_of_week}
                onChange={e => setScheduleForm(f => ({ ...f, day_of_week: e.target.value }))}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Horário</label>
              <input type="time" className={inp} style={inpStyle} value={scheduleForm.time}
                onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Ativo</label>
              <select className={inp} style={inpStyle} value={scheduleForm.is_active ? "sim" : "nao"}
                onChange={e => setScheduleForm(f => ({ ...f, is_active: e.target.value === "sim" }))}>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Título do culto</label>
            <input className={inp} style={inpStyle} value={scheduleForm.title} placeholder="Ex: Culto de Adoração"
              onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Local</label>
            <input className={inp} style={inpStyle} value={scheduleForm.location} placeholder="Ex: Casa de Oração Franca"
              onChange={e => setScheduleForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Descrição (opcional)</label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={2} value={scheduleForm.description}
              onChange={e => setScheduleForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}
          <div className="flex gap-3">
            <button onClick={saveSchedule} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.5)", color: "#c9a227", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : editingSchedule ? "Salvar" : "Adicionar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ===== FORMULÁRIO MEMBROS ===== */}
      {showForm && tab === "members" && (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            {editingMember ? "Editar Membro" : "Novo Membro"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Nome</label>
              <input className={inp} style={inpStyle} value={memberForm.name} placeholder="Nome completo"
                onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Função / Cargo</label>
              <input className={inp} style={inpStyle} value={memberForm.role} placeholder="Ex: Pastor, Diácono, Líder"
                onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>URL da foto (opcional)</label>
            <input className={inp} style={inpStyle} value={memberForm.photo_url} placeholder="https://..."
              onChange={e => setMemberForm(f => ({ ...f, photo_url: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1" style={labelStyle}>Descrição (opcional)</label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={memberForm.description}
              placeholder="Mini-biografia ou função na igreja..."
              onChange={e => setMemberForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Ordem de exibição</label>
              <input type="number" className={inp} style={inpStyle} value={memberForm.order_index}
                onChange={e => setMemberForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Ativo</label>
              <select className={inp} style={inpStyle} value={memberForm.is_active ? "sim" : "nao"}
                onChange={e => setMemberForm(f => ({ ...f, is_active: e.target.value === "sim" }))}>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>
          {msg && <p className="text-xs" style={{ color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}
          <div className="flex gap-3">
            <button onClick={saveMember} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.5)", color: "#c9a227", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : editingMember ? "Salvar" : "Adicionar"}
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
      ) : (
        <>
          {/* ===== LISTA HORÁRIOS ===== */}
          {tab === "schedules" && (
            schedules.length === 0 ? (
              <div className="card p-10 text-center">
                <p style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum horário cadastrado.</p>
                <button onClick={openNewSchedule} className="mt-4 px-4 py-2 rounded-lg text-xs"
                  style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)", color: "#c9a227" }}>
                  Adicionar primeiro horário
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {schedules.map(item => (
                  <div key={item.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)", fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                          {item.day_of_week} · {item.time}
                        </span>
                        {!item.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.62rem" }}>
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)" }}>
                        {item.title}
                      </p>
                      {item.location && <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>📍 {item.location}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditSchedule(item)} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                        Editar
                      </button>
                      <button onClick={() => removeSchedule(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                        Apagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ===== LISTA MEMBROS ===== */}
          {tab === "members" && (
            members.length === 0 ? (
              <div className="card p-10 text-center">
                <p style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum membro cadastrado.</p>
                <button onClick={openNewMember} className="mt-4 px-4 py-2 rounded-lg text-xs"
                  style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)", color: "#c9a227" }}>
                  Adicionar primeiro membro
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(item => (
                  <div key={item.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)" }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(201,162,39,0.6)" }}>{item.role}</p>
                      {item.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.4)" }}>{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditMember(item)} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                        Editar
                      </button>
                      <button onClick={() => removeMember(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                        Apagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
