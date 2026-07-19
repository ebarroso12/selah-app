"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
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
}

export default function AprovacoesPage() {
  const supabase = getBrowserClient();
  const [pending, setPending] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(100);
    setPending((data ?? []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string, name: string) {
    await supabase.from("profiles").update({ status: "approved" }).eq("id", id);
    setMsg(`✓ ${name} aprovado!`);
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function reject(id: string, name: string) {
    if (!confirm(`Rejeitar "${name}"?`)) return;
    await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
    setMsg(`${name} rejeitado.`);
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Excluir permanentemente "${name}"?`)) return;
    await supabase.from("profiles").delete().eq("id", id);
    await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    }).catch(() => {});
    setMsg(`"${name}" excluído.`);
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function approveAll() {
    if (!confirm(`Aprovar todos os ${pending.length} usuários pendentes?`)) return;
    await supabase.from("profiles").update({ status: "approved" }).eq("status", "pending");
    setMsg(`✓ Todos os ${pending.length} usuários aprovados!`);
    setTimeout(() => setMsg(""), 4000);
    load();
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Aprovações</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            {loading ? "Carregando..." : `${pending.length} usuário${pending.length !== 1 ? "s" : ""} aguardando aprovação`}
          </p>
        </div>
        {pending.length > 1 && (
          <button onClick={approveAll}
            className="px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" }}>
            ✓ Aprovar Todos ({pending.length})
          </button>
        )}
      </div>

      {msg && (
        <p className="text-xs text-center py-2 rounded-lg"
          style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
          {msg}
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm py-8" style={{ color: "var(--text-subtle)" }}>Carregando...</p>
      ) : pending.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <p className="text-3xl">✅</p>
          <p className="font-semibold" style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)" }}>
            Nenhuma aprovação pendente
          </p>
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
            Todos os usuários cadastrados já foram processados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(u => (
            <div key={u.id} className="card p-4 space-y-3">
              {/* Info */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                      {u.full_name}
                    </p>
                    {u.is_legendario && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(232,93,4,0.15)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.3)", fontSize: "0.6rem" }}>
                        Legendário
                      </span>
                    )}
                    {u.is_legendario_spouse && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.3)", fontSize: "0.6rem" }}>
                        Esposa
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                  {u.whatsapp && (
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>📱 {u.whatsapp}</p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    {u.church_name} · {u.city}/{u.state} · {u.gender === "male" ? "Homem" : "Mulher"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                    Pendente
                  </span>
                  <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
                    {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: "1px solid var(--bg-2)" }}>
                <button onClick={() => approve(u.id, u.full_name)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }}>
                  ✓ Aprovar
                </button>
                <button onClick={() => reject(u.id, u.full_name)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                  Rejeitar
                </button>
                <button onClick={() => deleteUser(u.id, u.full_name)}
                  className="py-2 px-3 rounded-lg text-xs"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", color: "rgba(239,68,68,0.5)" }}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
