export const dynamic = "force-dynamic";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { PrayerForm, PrayerList } from "@/features/oracao";
import type { PrayerRequest } from "@/features/oracao";

export const metadata = { title: "Oração" };

async function getPublicPrayers(): Promise<PrayerRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*, profile:profiles(full_name, church_name, city)")
    .eq("is_public", true)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(25);
  return (data ?? []) as PrayerRequest[];
}

export default async function OracaoPage() {
  const prayers = await getPublicPrayers();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Intercessão
        </p>
        <h1 className="text-2xl">Mural de Oração</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
          Ore pelos pedidos da comunidade. &quot;A oração eficaz do justo pode muito.&quot; — Tiago 5:16
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            {prayers.length} Pedido{prayers.length !== 1 ? "s" : ""} em Aberto
          </p>
          <PrayerList prayers={prayers} />
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
            >
              Novo Pedido
            </p>
            <PrayerForm />
          </div>
        </div>
      </div>
    </div>
  );
}
