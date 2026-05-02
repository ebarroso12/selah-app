"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LegendarioMember {
  id: string;
  full_name: string;
  email: string;
  church_name: string;
  city: string;
  state: string;
  is_legendario: boolean;
  is_legendario_spouse: boolean;
  status: string;
  created_at: string;
  last_seen_at: string | null;
}

export default function AdminLegendariosPage() {
  const [members, setMembers] = useState<LegendarioMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "legendario" | "spouse">("all");
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true })
      .limit(200);
    if (filter === "legendario") query = query.eq("is_legendario", true);
    if (filter === "spouse") query = query.eq("is_legendario_spouse", true);
    const { data } = await query;
    setMembers((data ?? []) as LegendarioMember[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function toggleLegendario(id: string, current: boolean) {
    await supabase.from("profiles").update({ is_legendario: !current }).eq("id", id);
    setMsg(!current ? "✓ Marcado como Legendário!" : "✓ Removido dos Legendários.");
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function toggleSpouse(id: string, current: boolean) {
    await supabase.from("profiles").update({ is_legendario_spouse: !current }).eq("id", id);
    setMsg(!current ? "✓ Marcado como Esposa Legendário!" : "✓ Removido.");
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.church_name?.toLowerCase().includes(search.toLowerCase())
  );

  const legendarios = members.filter(m => m.is_legendario);
  const spouses = members.filter(m => m.is_legendario_spouse);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#E85D04" }}>Legendários</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Gerencie quem é Legendário e Esposa Legendário no app
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Membros", value: members.length, color: "rgba(255,255,255,0.6)" },
          { label: "Legendários", value: legendarios.length, color: "#E85D04" },
          { label: "Esposas", value: spouses.length, color: "#f472b6" },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-cinzel)" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-cinzel)", fontSize: "0.62rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros + busca */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,93,4,0.2)", color: "rgba(255,255,255,0.85)" }}
          placeholder="Buscar por nome, email ou igreja..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {[
            { key: "all", label: "Todos" },
            { key: "legendario", label: "Legendários" },
            { key: "spouse", label: "Esposas" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
              className="px-3 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase"
              style={{
                background: filter === f.key ? "rgba(232,93,4,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f.key ? "rgba(232,93,4,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: filter === f.key ? "#E85D04" : "rgba(255,255,255,0.45)",
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {msg && <p className="text-xs text-center" style={{ color: "#34d399" }}>{msg}</p>}

      {loading ? (
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum membro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)" }}>
                    {m.full_name}
                  </p>
                  {m.is_legendario && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(232,93,4,0.15)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.3)", fontSize: "0.62rem" }}>
                      Legendário
                    </span>
                  )}
                  {m.is_legendario_spouse && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.3)", fontSize: "0.62rem" }}>
                      Esposa
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {m.email} · {m.church_name} · {m.city}/{m.state}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleLegendario(m.id, m.is_legendario)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: m.is_legendario ? "rgba(232,93,4,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${m.is_legendario ? "rgba(232,93,4,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: m.is_legendario ? "#E85D04" : "rgba(255,255,255,0.4)",
                  }}>
                  {m.is_legendario ? "✓ Legendário" : "+ Legendário"}
                </button>
                <button onClick={() => toggleSpouse(m.id, m.is_legendario_spouse)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: m.is_legendario_spouse ? "rgba(244,114,182,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${m.is_legendario_spouse ? "rgba(244,114,182,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: m.is_legendario_spouse ? "#f472b6" : "rgba(255,255,255,0.4)",
                  }}>
                  {m.is_legendario_spouse ? "✓ Esposa" : "+ Esposa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
