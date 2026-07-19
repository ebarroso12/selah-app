"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";


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
  approved: "Ativo", rejected: "Rejeitado", banned: "Banido",
};
const STATUS_COLOR: Record<string, string> = {
  approved: "#34d399", rejected: "#ef4444", banned: "#ef4444",
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

type FilterKey = "todos" | "approved" | "rejected" | "banned";

export default function AdminUsuariosPage() {
  const supabase = getBrowserClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [copied, setCopied] = useState(false);

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

  async function generateInvite() {
    setInviting(true);
    setInviteMsg("");
    setInviteUrl("");
    const res = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) { setInviteMsg("Erro: " + (data.error ?? "falha ao gerar")); return; }
    setInviteUrl(data.url);
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const counts = {
    todos: users.length,
    approved: users.filter(u => u.status === "approved").length,
    rejected: users.filter(u => u.status === "rejected").length,
    banned: users.filter(u => u.status === "banned").length,
  };

  const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(184,115,51,0.2)", color: "var(--text)" };
  const labelStyle = { color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#B87333" }}>Usuários</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            {counts.todos} cadastrados · {counts.approved} ativos · {counts.banned} banidos
          </p>
        </div>
        <button onClick={() => { setShowInvite(v => !v); setInviteUrl(""); setInviteMsg(""); }}
          className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
          style={{ background: "rgba(184,115,51,0.15)", border: "1px solid rgba(184,115,51,0.4)", color: "#B87333" }}>
          + Convidar para o app
        </button>
      </div>

      {/* Gerador de link de convite */}
      {showInvite && (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold" style={{ color: "#B87333", fontFamily: "var(--font-cinzel)" }}>
            Convidar para o app
          </p>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            Gere um link único e compartilhe — quem abrir vai direto para o cadastro (ou login com Google) e entra no app sem precisar de aprovação.
          </p>

          {!inviteUrl ? (
            <button onClick={generateInvite} disabled={inviting}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(184,115,51,0.2)", border: "1px solid rgba(184,115,51,0.5)", color: "#B87333", opacity: inviting ? 0.6 : 1 }}>
              {inviting ? "Gerando..." : "Gerar link de convite"}
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block" style={labelStyle}>Link gerado (válido por 7 dias, uso único)</label>
              <div className="flex gap-2">
                <input readOnly className={inp} style={inpStyle} value={inviteUrl} onFocus={(e) => e.currentTarget.select()} />
                <button onClick={copyInvite}
                  className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: copied ? "rgba(52,211,153,0.15)" : "rgba(184,115,51,0.15)", border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(184,115,51,0.4)"}`, color: copied ? "#34d399" : "#B87333" }}>
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <button onClick={generateInvite} disabled={inviting}
                className="text-xs underline"
                style={{ color: "var(--text-subtle)" }}>
                Gerar outro link
              </button>
            </div>
          )}

          {inviteMsg && <p className="text-xs" style={{ color: inviteMsg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{inviteMsg}</p>}
          <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg text-xs"
            style={{ background: "var(--bg-2)", border: "1px solid var(--bg-2)", color: "var(--text-muted)" }}>
            Fechar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "todos" as FilterKey, label: `Todos (${counts.todos})` },
          { key: "approved" as FilterKey, label: `Ativos (${counts.approved})` },
          { key: "rejected" as FilterKey, label: `Rejeitados (${counts.rejected})` },
          { key: "banned" as FilterKey, label: `Banidos (${counts.banned})` },
        ]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{
              background: filter === f.key ? "rgba(184,115,51,0.15)" : "var(--bg-2)",
              border: `1px solid ${filter === f.key ? "rgba(184,115,51,0.4)" : "var(--bg-2)"}`,
              color: filter === f.key ? "#B87333" : "var(--text-subtle)",
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
        <p className="text-center text-sm py-8" style={{ color: "var(--text-subtle)" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "var(--text-subtle)" }}>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => {
            const sc = STATUS_COLOR[u.status] ?? "var(--text-subtle)";
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
                      <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                        {u.full_name}
                      </p>
                      {u.is_legendario && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(232,93,4,0.15)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.3)", fontSize: "0.6rem" }}>
                          Legendário
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                      {u.church_name} · {u.city}/{u.state}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold"
                      style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>
                      {STATUS_LABEL[u.status]}
                    </span>
                    <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                      Visto: {timeAgo(u.last_seen_at)}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5">
                  <Link href={`/admin/usuarios/${u.id}`}
                    className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    style={{ textDecoration: "none" }}>
                    Detalhes / Permissões
                  </Link>
                  {u.status !== "approved" && (
                    <button onClick={() => updateStatus(u.id, "approved")}
                      className="px-3 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Reativar
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
