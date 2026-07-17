export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/services/supabase/supabase.server";
import type { Profile } from "@/types/database";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Meu Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = data as Profile | null;
  if (!profile) redirect("/login");

  const { data: metrics } = await supabase
    .from("user_metrics")
    .select("devocionais_read, verses_favorited, consecutive_days, session_duration_seconds")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30);

  const totalDevocionais = (metrics ?? []).reduce((s: number, m: { devocionais_read?: number }) => s + (m.devocionais_read ?? 0), 0);
  const totalFavoritos = (metrics ?? []).reduce((s: number, m: { verses_favorited?: number }) => s + (m.verses_favorited ?? 0), 0);
  const diasConsecutivos = metrics?.[0]?.consecutive_days ?? 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Minha Conta
        </p>
        <h1 className="text-2xl">Perfil</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Dias Consecutivos", value: diasConsecutivos },
          { label: "Devocionais Lidos", value: totalDevocionais },
          { label: "Versículos Favoritos", value: totalFavoritos },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card p-5">
        <p className="text-xs tracking-widest uppercase mb-3"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Identificação
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-gold">{profile.church_name}</span>
          <span className="badge badge-gold">{profile.city} / {profile.state}</span>
          {profile.is_legendario && <span className="badge badge-gold">Legendário</span>}
          {profile.is_legendario_spouse && <span className="badge badge-gold">Esposa de Legendário</span>}
          <span className="badge badge-success">Acesso Aprovado</span>
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
