import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { sendRejectionEmail } from "@/lib/email/client";

async function deleteUser(userId: string) {
  "use server";
  const supabase = await createServiceClient();
  // Remove métricas do usuário
  await supabase.from("user_metrics").delete().eq("user_id", userId);
  // Remove pedidos de oração
  await supabase.from("prayer_requests").delete().eq("user_id", userId);
  // Remove testemunhos
  await supabase.from("testimonies").delete().eq("user_id", userId);
  // Remove o perfil
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) {
    console.error("[deleteUser] Erro ao excluir usuário:", error);
    return;
  }
  // Remove da autenticação do Supabase
  await supabase.auth.admin.deleteUser(userId).catch(console.error);
  redirect("/admin/usuarios");
}

async function banUser(userId: string) {
  "use server";
  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
  await supabase.from("profiles").update({ status: "rejected" }).eq("id", userId);
  if (profile) {
    await sendRejectionEmail({ email: profile.email, full_name: profile.full_name }).catch(console.error);
  }
  revalidatePath(`/admin/usuarios/${userId}`);
}

async function approveUser(userId: string) {
  "use server";
  const supabase = await createServiceClient();
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin";
  await supabase.from("profiles").update({
    status: "approved",
    approved_by: adminEmail,
    approved_at: new Date().toISOString(),
  }).eq("id", userId);
  revalidatePath(`/admin/usuarios/${userId}`);
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) redirect("/admin/usuarios");

  // Métricas do usuário
  const { data: metrics } = await supabase
    .from("user_metrics")
    .select("*")
    .eq("user_id", id)
    .order("date", { ascending: false })
    .limit(30);

  const { count: prayerCount } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  const { count: testimonyCount } = await supabase
    .from("testimonies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  const totalSessionMin = Math.round(
    (metrics ?? []).reduce((acc: number, m: { session_duration_seconds?: number }) => acc + (m.session_duration_seconds ?? 0), 0) / 60
  );
  const totalDevocionais = (metrics ?? []).reduce((acc: number, m: { devocionais_read?: number }) => acc + (m.devocionais_read ?? 0), 0);
  const totalVerses = (metrics ?? []).reduce((acc: number, m: { verses_favorited?: number }) => acc + (m.verses_favorited ?? 0), 0);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/usuarios" className="text-xs btn-ghost px-3 py-1.5"
          style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
            {user.full_name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{user.email}</p>
        </div>
        <span className="ml-auto text-xs px-3 py-1 rounded-full font-semibold"
          style={{
            background: `${STATUS_COLOR[user.status] ?? "#c9a227"}20`,
            color: STATUS_COLOR[user.status] ?? "#c9a227",
            border: `1px solid ${STATUS_COLOR[user.status] ?? "#c9a227"}40`,
            fontFamily: "var(--font-cinzel)",
          }}>
          {STATUS_LABEL[user.status] ?? user.status}
        </span>
      </div>

      {/* KPIs do usuário */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Min. de Uso Total", value: totalSessionMin, color: "#fb923c" },
          { label: "Devocionais Lidos", value: totalDevocionais, color: "#c9a227" },
          { label: "Versículos Favoritos", value: totalVerses, color: "#a78bfa" },
          { label: "Pedidos de Oração", value: prayerCount ?? 0, color: "#60a5fa" },
          { label: "Testemunhos", value: testimonyCount ?? 0, color: "#f472b6" },
          { label: "Dias de Atividade", value: (metrics ?? []).length, color: "#34d399" },
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

      {/* Dados do perfil */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Dados do Perfil
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "WhatsApp", value: user.whatsapp ?? "—" },
            { label: "Igreja", value: user.church_name ?? "—" },
            { label: "Cidade / Estado", value: `${user.city ?? "—"} / ${user.state ?? "—"}` },
            { label: "Gênero", value: user.gender === "male" ? "Homem" : user.gender === "female" ? "Mulher" : "—" },
            { label: "Legendário", value: user.is_legendario ? "Sim" : "Não" },
            { label: "Esposa de Legendário", value: user.is_legendario_spouse ? "Sim" : "Não" },
            { label: "Cadastro", value: new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) },
            { label: "Aprovado por", value: user.approved_by ?? "—" },
            { label: "Aprovado em", value: user.approved_at ? new Date(user.approved_at).toLocaleDateString("pt-BR") : "—" },
            { label: "Último acesso", value: user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString("pt-BR") : "—" },
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

      {/* Ações do admin */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Ações do Administrador
        </p>
        <div className="flex flex-wrap gap-3">
          {user.status !== "approved" && (
            <form action={approveUser.bind(null, id)}>
              <button type="submit" className="btn-primary text-xs px-5 py-2.5">
                Aprovar Acesso
              </button>
            </form>
          )}
          {user.status !== "rejected" && (
            <form action={banUser.bind(null, id)}>
              <button type="submit" className="btn-outline text-xs px-5 py-2.5"
                style={{ borderColor: "#f87171", color: "#f87171" }}>
                Revogar / Banir
              </button>
            </form>
          )}
          <form action={deleteUser.bind(null, id)}
            onSubmit={(e) => { if (!confirm("Tem certeza? Esta ação é irreversível e apagará todos os dados do usuário.")) e.preventDefault(); }}>
            <button type="submit" className="btn-outline text-xs px-5 py-2.5"
              style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.06)" }}>
              Excluir Permanentemente
            </button>
          </form>
        </div>
        <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          A exclusão permanente remove todos os dados do usuário e não pode ser desfeita.
        </p>
      </div>

      {/* Histórico de atividade */}
      {metrics && metrics.length > 0 && (
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
                {(metrics as { date: string; devocionais_read?: number; verses_favorited?: number; session_duration_seconds?: number }[]).map((m, i, arr) => (
                  <tr key={m.date} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.78rem" }}>
                      {new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
                      {m.devocionais_read ?? 0}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#a78bfa", fontSize: "0.85rem" }}>
                      {m.verses_favorited ?? 0}
                    </td>
                    <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      {Math.round((m.session_duration_seconds ?? 0) / 60)} min
                    </td>
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
