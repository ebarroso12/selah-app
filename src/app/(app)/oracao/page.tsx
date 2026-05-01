import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import PrayerForm from "./PrayerForm";

export const metadata = { title: "Oração" };

async function getPublicPrayers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*, profile:profiles(full_name, church_name, city)")
    .eq("is_public", true)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(25);
  return data ?? [];
}

export default async function OracaoPage() {
  const prayers = await getPublicPrayers();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Intercessão
        </p>
        <h1 className="text-2xl">Mural de Oração</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Ore pelos pedidos da comunidade. &quot;A oração eficaz do justo pode muito.&quot; — Tiago 5:16
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Mural */}
        <div className="lg:col-span-3 space-y-4">
          <p className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
            {prayers.length} Pedido{prayers.length !== 1 ? "s" : ""} em Aberto
          </p>

          {prayers.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Nenhum pedido público no momento.
              </p>
            </div>
          ) : (
            prayers.map((p: { id: string; text: string; created_at: string; via_whatsapp?: boolean; profile: { full_name?: string; church_name?: string } | null }) => (
              <div key={p.id} className="card p-5">
                <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {p.text}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                      {p.profile?.full_name?.split(" ").slice(0, 2).map((n: string) => n[0]).join("") ?? "?"}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {p.profile?.full_name} · {p.profile?.church_name}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-cinzel)" }}>
                    {formatDate(p.created_at, { day: "2-digit", month: "short" })}
                  </p>
                </div>
                {p.via_whatsapp && (
                  <div className="mt-2">
                    <span className="badge badge-gold" style={{ fontSize: "0.55rem" }}>Via WhatsApp</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulário */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
              Novo Pedido
            </p>
            <PrayerForm />
          </div>
        </div>
      </div>
    </div>
  );
}
