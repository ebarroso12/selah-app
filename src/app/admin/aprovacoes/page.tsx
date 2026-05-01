import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email/client";

async function approveUser(userId: string) {
  "use server";
  const supabase = await createServiceClient();

  // Busca dados do usuário antes de atualizar
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  await supabase.from("profiles").update({
    status: "approved",
    approved_by: "edson.barroso@gmail.com",
    approved_at: new Date().toISOString(),
  }).eq("id", userId);

  // Envia email de aprovação ao usuário
  if (profile) {
    await sendApprovalEmail({
      email: profile.email,
      full_name: profile.full_name,
    }).catch(console.error);
  }

  revalidatePath("/admin/aprovacoes");
}

async function rejectUser(userId: string) {
  "use server";
  const supabase = await createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  await supabase.from("profiles").update({ status: "rejected" }).eq("id", userId);

  // Envia email de rejeição ao usuário
  if (profile) {
    await sendRejectionEmail({
      email: profile.email,
      full_name: profile.full_name,
    }).catch(console.error);
  }

  revalidatePath("/admin/aprovacoes");
}

export default async function AprovacoesPage() {
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Aprovacoes Pendentes</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          {pending?.length ?? 0} usuario(s) aguardando aprovacao
        </p>
      </div>

      {!pending || pending.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Nenhum cadastro pendente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((user) => (
            <div key={user.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold" style={{ color: "#fff", fontFamily: "var(--font-cinzel)" }}>
                      {user.full_name}
                    </p>
                    {user.is_legendario && <span className="badge badge-gold">Legendario</span>}
                    {user.is_legendario_spouse && <span className="badge badge-gold">Esposa Legendario</span>}
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{user.email}</p>
                  {user.whatsapp && (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{user.whatsapp}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>{user.gender === "male" ? "Homem" : "Mulher"}</span>
                    <span>·</span>
                    <span>{user.church_name}</span>
                    <span>·</span>
                    <span>{user.city} / {user.state}</span>
                    <span>·</span>
                    <span>Cadastro: {formatDate(user.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <form action={rejectUser.bind(null, user.id)}>
                    <button type="submit" className="btn-ghost text-sm px-4 py-2"
                      style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)", border: "1px solid" }}>
                      Rejeitar
                    </button>
                  </form>
                  <form action={approveUser.bind(null, user.id)}>
                    <button type="submit" className="btn-primary text-sm px-4 py-2">
                      Aprovar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
