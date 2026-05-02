"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, use } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = getBrowserClient();

function fmtMin(sec: number) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}

const STATUS_COLOR: Record<string, string> = {
  approved: "#34d399",
  pending: "#fbbf24",
  rejected: "#f87171",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, string | boolean | null> | null>(null);
  const [metrics, setMetrics] = useState<{ date: string; devocionais_read?: number; verses_favorited?: number; session_duration_seconds?: number }[]>([]);
  const [prayerCount, setPrayerCount] = useState(0);
  const [testimonyCount, setTestimonyCount] = useState(0);
  const [actionMsg, setActionMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [
        { data: profile },
        { data: m },
        { count: pc },
        { count: tc },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("user_metrics").select("*").eq("user_id", id).order("date", { ascending: false }).limit(30),
        supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("user_id", id),
        supabase.from("testimonies").select("*", { count: "exact", head: true }).eq("user_id", id),
      ]);
      if (!profile) { router.replace("/admin/usuarios"); return; }
      setUser(profile);
      setMetrics(m ?? []);
      setPrayerCount(pc ?? 0);
      setTestimonyCount(tc ?? 0);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleApprove() {
    setActionLoading(true);
    const { error } = await supabase.from("profiles").update({
      status: "approved",
      approved_by: "edson.barroso@gmail.com",
      approved_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { setActionMsg("Erro ao aprovar: " + error.message); }
    else { setActionMsg("Usuário aprovado com sucesso!"); setUser(u => u ? { ...u, status: "approved" } : u); }
    setActionLoading(false);
  }

  async function handleBan() {
    setActionLoading(true);
    const { error } = await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
    if (error) { setActionMsg("Erro ao banir: " + error.message); }
    else { setActionMsg("Acesso revogado."); setUser(u => u ? { ...u, status: "rejected" } : u); }
    setActionLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Tem certeza? Esta ação é irreversível e apagará todos os dados do usuário.")) return;
    setActionLoading(true);
    await Promise.all([
      supabase.from("user_metrics").delete().eq("user_id", id),
      supabase.from("prayer_requests").delete().eq("user_id", id),
      supabase.from("testimonies").delete().eq("user_id", id),
    ]);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) { setActionMsg("Erro ao excluir: " + error.message); setActionLoading(false); return; }
    router.replace("/admin/usuarios");
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  const totalSessionMin = Math.round(metrics.reduce((acc, m) => acc + (m.session_duration_seconds ?? 0), 0) / 60);
  const totalDevocionais = metrics.reduce((acc, m) => acc + (m.devocionais_read ?? 0), 0);
  const totalVerses = metrics.reduce((acc, m) => acc + (m.verses_favorited ?? 0), 0);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/usuarios" className="text-xs btn-ghost px-3 py-1.5" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
            {user.full_name as string}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{user.email as string}</p>
        </div>
        <span className="ml-auto text-xs px-3 py-1 rounded-full font-semibold"
          style={{
            background: `${STATUS_COLOR[user.status as string] ?? "#c9a227"}20`,
            color: STATUS_COLOR[user.status as string] ?? "#c9a227",
            border: `1px solid ${STATUS_COLOR[user.status as string] ?? "#c9a227"}40`,
            fontFamily: "var(--font-cinzel)",
          }}>
          {STATUS_LABEL[user.status as string] ?? user.status as string}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Min. de Uso Total", value: totalSessionMin, color: "#fb923c" },
          { label: "Devocionais Lidos", value: totalDevocionais, color: "#c9a227" },
          { label: "Versículos Favoritos", value: totalVerses, color: "#a78bfa" },
          { label: "Pedidos de Oração", value: prayerCount, color: "#60a5fa" },
          { label: "Testemunhos", value: testimonyCount, color: "#f472b6" },
          { label: "Dias de Atividade", value: metrics.length, color: "#34d399" },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <p className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-cinzel)" }}>
              {kpi.value.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Dados do Perfil
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "WhatsApp", value: (user.whatsapp as string) ?? "—" },
            { label: "Igreja", value: (user.church_name as string) ?? "—" },
            { label: "Cidade / Estado", value: `${(user.city as string) ?? "—"} / ${(user.state as string) ?? "—"}` },
            { label: "Gênero", value: user.gender === "male" ? "Homem" : user.gender === "female" ? "Mulher" : "—" },
            { label: "Legendário", value: user.is_legendario ? "Sim" : "Não" },
            { label: "Esposa de Legendário", value: user.is_legendario_spouse ? "Sim" : "Não" },
            { label: "Cadastro", value: user.created_at ? new Date(user.created_at as string).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—" },
            { label: "Aprovado por", value: (user.approved_by as string) ?? "—" },
            { label: "Aprovado em", value: user.approved_at ? new Date(user.approved_at as string).toLocaleDateString("pt-BR") : "—" },
            { label: "Último acesso", value: user.last_seen_at ? new Date(user.last_seen_at as string).toLocaleDateString("pt-BR") : "—" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs mb-1" style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {item.label}
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Ações do Administrador
        </p>
        {actionMsg && (
          <p className="text-sm mb-4 px-3 py-2 rounded" style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}>
            {actionMsg}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {user.status !== "approved" && (
            <button onClick={handleApprove} disabled={actionLoading} className="btn-primary text-xs px-5 py-2.5">
              {actionLoading ? "..." : "Aprovar Acesso"}
            </button>
          )}
          {user.status !== "rejected" && (
            <button onClick={handleBan} disabled={actionLoading} className="btn-outline text-xs px-5 py-2.5"
              style={{ borderColor: "#f87171", color: "#f87171" }}>
              {actionLoading ? "..." : "Revogar / Banir"}
            </button>
          )}
          <button onClick={handleDelete} disabled={actionLoading} className="btn-outline text-xs px-5 py-2.5"
            style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.06)" }}>
            {actionLoading ? "..." : "Excluir Permanentemente"}
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          A exclusão permanente remove todos os dados do usuário e não pode ser desfeita.
        </p>
      </div>

      {metrics.length > 0 && (
        <div className="card p-6">
          <p className="text-xs tracking-widest uppercase mb-5"
            style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
            Histórico de Atividade (últimos 30 dias)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.12)" }}>
                  {["Data", "Devocionais", "Versículos Fav.", "Tempo de Uso"].map((h) => (
                    <th key={h} className="text-left px-3 py-2"
                      style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i, arr) => (
                  <tr key={m.date} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.78rem" }}>
                      {new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>{m.devocionais_read ?? 0}</td>
                    <td className="px-3 py-2" style={{ color: "#a78bfa", fontSize: "0.85rem" }}>{m.verses_favorited ?? 0}</td>
                    <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>{fmtMin(m.session_duration_seconds ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
