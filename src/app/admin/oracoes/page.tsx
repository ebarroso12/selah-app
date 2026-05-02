"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Prayer {
  id: string;
  text: string;
  is_public: boolean;
  via_whatsapp: boolean;
  status: "open" | "answered" | "closed";
  created_at: string;
  profile?: { full_name?: string; church_name?: string; city?: string };
}

const STATUS_LABELS: Record<string, string> = {
  open: "Aberto", answered: "Respondido", closed: "Fechado",
};
const STATUS_COLORS: Record<string, string> = {
  open: "#34d399", answered: "#c9a227", closed: "rgba(255,255,255,0.3)",
};

export default function AdminOracoesPage() {
  const [items, setItems] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "answered" | "closed">("all");

  async function load() {
    setLoading(true);
    let query = supabase
      .from("prayer_requests")
      .select("*, profile:profiles(full_name, church_name, city)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setItems((data ?? []) as unknown as Prayer[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("prayer_requests").update({ status }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Apagar este pedido de oração?")) return;
    await supabase.from("prayer_requests").delete().eq("id", id);
    load();
  }

  async function togglePublic(id: string, current: boolean) {
    await supabase.from("prayer_requests").update({ is_public: !current }).eq("id", id);
    load();
  }

  const counts = {
    all: items.length,
    open: items.filter(i => i.status === "open").length,
    answered: items.filter(i => i.status === "answered").length,
    closed: items.filter(i => i.status === "closed").length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Moderação de Orações</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Controle total sobre os pedidos de oração da comunidade
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: `Todos (${counts.all})` },
          { key: "open", label: `Abertos (${counts.open})` },
          { key: "answered", label: `Respondidos (${counts.answered})` },
          { key: "closed", label: `Fechados (${counts.closed})` },
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

      {loading ? (
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Carregando...</p>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Nenhum pedido de oração encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.closed;
            return (
              <div key={item.id} className="card p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}40`, fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                      {STATUS_LABELS[item.status]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: item.is_public ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.05)",
                        color: item.is_public ? "#60a5fa" : "rgba(255,255,255,0.35)",
                        border: `1px solid ${item.is_public ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.1)"}`,
                        fontSize: "0.62rem",
                      }}>
                      {item.is_public ? "Público" : "Privado"}
                    </span>
                    {item.via_whatsapp && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)", fontSize: "0.62rem" }}>
                        WhatsApp
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-cinzel)" }}>
                    {new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Autor */}
                {item.profile?.full_name && (
                  <p className="text-xs" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)" }}>
                    {item.profile.full_name}
                    {item.profile.church_name ? ` · ${item.profile.church_name}` : ""}
                    {item.profile.city ? ` · ${item.profile.city}` : ""}
                  </p>
                )}

                {/* Texto */}
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {item.text}
                </p>

                {/* Ações */}
                <div className="flex gap-2 flex-wrap pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {item.status !== "open" && (
                    <button onClick={() => updateStatus(item.id, "open")} className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                      Reabrir
                    </button>
                  )}
                  {item.status !== "answered" && (
                    <button onClick={() => updateStatus(item.id, "answered")} className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)", color: "#c9a227" }}>
                      Marcar Respondido
                    </button>
                  )}
                  {item.status !== "closed" && (
                    <button onClick={() => updateStatus(item.id, "closed")} className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                      Fechar
                    </button>
                  )}
                  <button onClick={() => togglePublic(item.id, item.is_public)} className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
                    {item.is_public ? "Tornar Privado" : "Tornar Público"}
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
