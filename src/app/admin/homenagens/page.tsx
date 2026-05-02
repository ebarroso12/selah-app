"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import Image from "next/image";


interface Homenagem {
  id: string;
  nome_homenageante: string;
  instagram_homenageante: string | null;
  nome_homenageado: string;
  parentesco: string;
  instagram_homenageado: string | null;
  eh_legendario: boolean;
  numero_legendario: number | null;
  texto: string;
  fotos: string[];
  foto_capa: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profile?: { full_name?: string; email?: string };
}

export default function AdminHomenagensPage() {
  const supabase = getBrowserClient();
  const [items, setItems] = useState<Homenagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let query = supabase
      .from("homenagens")
      .select("*, profile:profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setItems((data ?? []) as unknown as Homenagem[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("homenagens").update({ status }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Apagar esta homenagem permanentemente?")) return;
    await supabase.from("homenagens").delete().eq("id", id);
    load();
  }

  const STATUS_LABEL: Record<string, string> = {
    pending: "Pendente", approved: "Aprovada", rejected: "Rejeitada",
  };
  const STATUS_COLOR: Record<string, string> = {
    pending: "#fbbf24", approved: "#34d399", rejected: "#ef4444",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Homenagens</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Aprovação e moderação das homenagens enviadas pelos usuários
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "pending", label: "Pendentes" },
          { key: "approved", label: "Aprovadas" },
          { key: "rejected", label: "Rejeitadas" },
          { key: "all", label: "Todas" },
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
          <p style={{ color: "rgba(255,255,255,0.3)" }}>
            {filter === "pending" ? "Nenhuma homenagem pendente." : "Nenhuma homenagem encontrada."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const sc = STATUS_COLOR[item.status] ?? "#fff";
            const isExpanded = expanded === item.id;
            const capaUrl = item.fotos?.[item.foto_capa] ?? item.fotos?.[0];
            return (
              <div key={item.id} className="card overflow-hidden"
                style={{ borderColor: item.status === "pending" ? "rgba(251,191,36,0.25)" : "rgba(201,162,39,0.1)" }}>
                {/* Foto capa */}
                {capaUrl && (
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image src={capaUrl} alt="Foto da homenagem" fill style={{ objectFit: "cover" }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(6,10,20,0.95))" }} />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  {/* Status + data */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}40`, fontFamily: "var(--font-cinzel)", fontSize: "0.62rem" }}>
                        {STATUS_LABEL[item.status]}
                      </span>
                      {item.eh_legendario && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(232,93,4,0.15)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.3)", fontSize: "0.62rem" }}>
                          Legendário #{item.numero_legendario}
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Homenageante → Homenageado */}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)" }}>
                      {item.nome_homenageante} homenageia {item.nome_homenageado}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Parentesco: {item.parentesco}
                      {item.instagram_homenageante ? ` · @${item.instagram_homenageante}` : ""}
                    </p>
                    {item.profile?.email && (
                      <p className="text-xs" style={{ color: "rgba(201,162,39,0.5)" }}>
                        Enviado por: {item.profile.full_name} ({item.profile.email})
                      </p>
                    )}
                  </div>

                  {/* Texto (expandível) */}
                  <div>
                    <p className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.65)", display: "-webkit-box", WebkitLineClamp: isExpanded ? "unset" : 3, WebkitBoxOrient: "vertical", overflow: isExpanded ? "visible" : "hidden" }}>
                      {item.texto}
                    </p>
                    {item.texto.length > 200 && (
                      <button onClick={() => setExpanded(isExpanded ? null : item.id)}
                        className="text-xs mt-1" style={{ color: "rgba(201,162,39,0.6)" }}>
                        {isExpanded ? "Ver menos" : "Ver mais"}
                      </button>
                    )}
                  </div>

                  {/* Fotos adicionais */}
                  {item.fotos?.length > 1 && (
                    <div className="flex gap-2">
                      {item.fotos.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image src={url} alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {item.status !== "approved" && (
                      <button onClick={() => updateStatus(item.id, "approved")} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                        ✓ Aprovar
                      </button>
                    )}
                    {item.status !== "rejected" && (
                      <button onClick={() => updateStatus(item.id, "rejected")} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                        ✗ Rejeitar
                      </button>
                    )}
                    {item.status === "rejected" && (
                      <button onClick={() => updateStatus(item.id, "pending")} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                        Voltar para Pendente
                      </button>
                    )}
                    <button onClick={() => remove(item.id)} className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "rgba(239,68,68,0.7)" }}>
                      Apagar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
