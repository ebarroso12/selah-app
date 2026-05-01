import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Métricas — Admin" };

export default async function MetricasPage() {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [
    { count: totalApproved },
    { count: totalPending },
    { count: totalTestimonies },
    { count: totalPrayers },
    { count: totalDevotionals },
    { data: recentMetrics },
    { data: topCities },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("testimonies").select("*", { count: "exact", head: true }).eq("approved", true),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("devotionals").select("*", { count: "exact", head: true }),
    supabase.from("user_metrics").select("date, devocionais_read, verses_favorited, session_duration_seconds")
      .gte("date", thirtyDaysAgo).order("date", { ascending: true }),
    supabase.from("profiles").select("city, state").eq("status", "approved").limit(500),
  ]);

  // Agrupa cidades
  const cityMap: Record<string, number> = {};
  (topCities ?? []).forEach((p: any) => {
    const key = `${p.city} / ${p.state}`;
    cityMap[key] = (cityMap[key] ?? 0) + 1;
  });
  const sortedCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const totalSessionMin = Math.round(
    (recentMetrics ?? []).reduce((s: number, m: any) => s + (m.session_duration_seconds ?? 0), 0) / 60
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl mb-1">Métricas</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Visão geral dos últimos 30 dias
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: "Usuários Aprovados", value: totalApproved ?? 0, color: "#c9a227" },
          { label: "Aguardando Aprovação", value: totalPending ?? 0, color: "#fbbf24" },
          { label: "Devocionais Publicados", value: totalDevotionals ?? 0, color: "#34d399" },
          { label: "Pedidos de Oração", value: totalPrayers ?? 0, color: "#60a5fa" },
          { label: "Testemunhos Aprovados", value: totalTestimonies ?? 0, color: "#a78bfa" },
          { label: "Minutos de Uso (30 dias)", value: totalSessionMin, color: "#fb923c" },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <p className="text-3xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-cinzel)" }}>
              {kpi.value.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Top cidades */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Usuários por Cidade
        </p>
        {sortedCities.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Dados insuficientes.</p>
        ) : (
          <div className="space-y-3">
            {sortedCities.map(([city, count], i) => {
              const max = sortedCities[0][1];
              const pct = Math.round((count / max) * 100);
              return (
                <div key={city} className="flex items-center gap-3">
                  <span className="text-xs w-4 text-right shrink-0"
                    style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm truncate" style={{ color: "rgba(255,255,255,0.8)" }}>{city}</p>
                      <p className="text-xs ml-2 shrink-0" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)" }}>
                        {count}
                      </p>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: "rgba(201,162,39,0.6)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Atividade recente */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Atividade Diária (30 dias)
        </p>
        {!recentMetrics || recentMetrics.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
                  {["Data", "Devocionais Lidos", "Versículos Favoritos", "Tempo de Uso"].map((h) => (
                    <th key={h} className="text-left px-3 py-2"
                      style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentMetrics as any[]).slice(-10).reverse().map((m, i, arr) => (
                  <tr key={m.date} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td className="px-3 py-2" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.78rem" }}>
                      {new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
                      {m.devocionais_read ?? 0}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>
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
        )}
      </div>
    </div>
  );
}
