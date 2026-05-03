"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";


interface Profile {
  id: string;
  email: string;
  full_name: string;
  whatsapp: string | null;
  church_name: string;
  city: string;
  state: string;
  gender: string;
  is_legendario: boolean;
  is_legendario_spouse: boolean;
  status: string;
  created_at: string;
  last_seen_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado", pending: "Pendente", rejected: "Rejeitado", banned: "Banido",
};
const STATUS_COLOR: Record<string, string> = {
  approved: "#34d399", pending: "#fbbf24", rejected: "#ef4444", banned: "#ef4444",
};

function timeAgo(iso: string | null) {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Agora";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

type FilterKey = "todos" | "approved" | "pending" | "rejected" | "banned";

export default function AdminUsuariosPage() {
  const supabase = getBrowserClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Usando a API interna que ignora RLS via Service Role
      const res = await fetch(`/api/admin/users?filter=${filter}`);
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.church_name?.toLowerCase().includes(search.toLowerCase())
  );

  async function updateStatus(id: string, status: string) {
    // Para ações de escrita, usamos a API de admin que já deve estar configurada ou o próprio supabase client se o usuário for admin
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) {
      setMsg("Erro ao atualizar status.");
    } else {
      setMsg(`✓ Status atualizado para ${STATUS_LABEL[status]}.`);
      load();
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Excluir permanentemente "${name}"? Esta ação não pode ser desfeita.`)) return;
    
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    
    if (res.ok) {
      setMsg(`✓ Usuário "${name}" excluído.`);
      load();
    } else {
      setMsg("Erro ao excluir usuário.");
    }
    setTimeout(() => setMsg(""), 4000);
  }

  async function invite() {
    if (!inviteEmail) { setInviteMsg("Informe o email."); return; }
    setInviting(true);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteName || inviteEmail.split("@")[0] }),
    });
    const data = await res.json();
    setInviting(false);
    if (data.error) { setInviteMsg("Erro: " + data.error); return; }
    setInviteMsg("✓ Usuário convidado com sucesso!");
    setInviteEmail(""); setInviteName("");
    setTimeout(() => { setInviteMsg(""); setShowInvite(false); }, 2000);
    load();
  }

  const counts = {
    todos: users.length,
    approved: users.filter(u => u.status === "approved").length,
    pending: users.filter(u => u.status === "pending").length,
    rejected: users.filter(u => u.status === "rejected").length,
    banned: users.filter(u => u.status === "banned").length,
  };

  const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inpStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "rgba(255,255,255,0.85)" };
  const labelStyle = { color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Usuários</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {counts.todos} cadastrados · {counts.approved} aprovados · {counts.pending} pendentes
          </p>
        </div>
        <button onClick={() => setShowInvite(v => !v)}
          className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
          style={{ background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.4)", color: "#c9a227" }}>
          + Convidar
        </button>
      </div>

      {/* Formulário de convite */}
      {showInvite && (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>Convidar Usuário</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={labelStyle}>Email *</label>
              <input className={inp} style={inpStyle} type="email" value={inviteEmail} placeholder="email@exemplo.com"
                onChange={e => setInviteEmail(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1" style={labelStyle}>Nome (opcional)</label>
              <input className={inp} style={inpStyle} value={inviteName} placeholder="Nome completo"
                onChange={e => setInviteName(e.target.value)} />
            </div>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Senha padrão: <strong style={{ color: "#c9a227" }}>Mudar123</strong> — o usuário pode alterar depois.
          </p>
          {inviteMsg && <p className="text-xs" style={{ color: inviteMsg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{inviteMsg}</p>}
          <div className="flex gap-3">
            <button onClick={invite} disabled={inviting}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.5)", color: "#c9a227", opacity: inviting ? 0.6 : 1 }}>
              {inviting ? "Enviando..." : "Liberar Acesso"}
            </button>
            <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "todos" as FilterKey, label: `Todos (${counts.todos})` },
          { key: "approved" as FilterKey, label: `Aprovados (${counts.approved})` },
          { key: "pending" as FilterKey, label: `Pendentes (${counts.pending})` },
          { key: "rejected" as FilterKey, label: `Rejeitados (${counts.rejected})` },
          { key: "banned" as FilterKey, label: `Banidos (${counts.banned})` },
        ]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
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

      {/* Busca */}
      <input className={inp} style={inpStyle} value={search} placeholder="Buscar por nome, email ou igreja..."
        onChange={e => setSearch(e.target.value)} />

      {msg && (
        <p className="text-xs text-center py-2 rounded-lg"
          style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
          {msg}
        </p>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-center text-sm py-8" style={{ color: "rgba(255,255,255,0.3)" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => {
            const sc = STATUS_COLOR[u.status] ?? "rgba(255,255,255,0.4)";
            const isOnline = u.last_seen_at && (Date.now() - new Date(u.last_seen_at).getTime()) < 5 * 60 * 1000;
            return (
              <div key={u.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {isOnline && (
                        <span className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                      )}
                      <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>
                        {u.full_name}
                      </p>
                      {u.is_legendario && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(232,93,4,0.15)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.3)", fontSize: "0.6rem" }}>
                          Legendário
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{u.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {u.church_name} · {u.city}/{u.state}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold"
                      style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>
                      {STATUS_LABEL[u.status]}
                    </span>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Visto: {timeAgo(u.last_seen_at)}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5">
                  {u.status !== "approved" && (
                    <button onClick={() => updateStatus(u.id, "approved")}
                      className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Aprovar
                    </button>
                  )}
                  {u.status !== "banned" && (
                    <button onClick={() => updateStatus(u.id, "banned")}
                      className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                      Banir
                    </button>
                  )}
                  <button onClick={() => deleteUser(u.id, u.full_name)}
                    className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-white/5 text-white/40 border border-white/10">
                    Excluir
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
