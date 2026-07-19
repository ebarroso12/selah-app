"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";


function thirtyDaysAgo() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}

function fmtMin(sec: number) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}

interface UserStat {
  userId: string;
  name: string;
  totalSec: number;
  devocionais: number;
  versiculos: number;
  kairo: number;
  biblia: number;
  oracao: number;
  tokens: number;
}

export default function MetricasPage() {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalApproved: 0,
    totalPending: 0,
    totalTestimonies: 0,
    totalPrayers: 0,
    totalDevotionals: 0,
    totalSessionMin: 0,
    totalTokens: 0,
  });
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [sortedCities, setSortedCities] = useState<[string, number][]>([]);
  const [dailyActivity, setDailyActivity] = useState<{ date: string; devocionais_read?: number; verses_favorited?: number; session_duration_seconds?: number }[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = thirtyDaysAgo();

      const [
        { count: totalApproved },
        { count: totalPending },
        { count: totalTestimonies },
        { count: totalPrayers },
        { count: totalDevotionals },
        { data: globalMetrics },
        { data: topCities },
        { data: userMetrics },
        { data: tokenUsage },
        { data: profiles },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("testimonies").select("*", { count: "exact", head: true }).eq("approved", true),
        supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
        supabase.from("devotionals").select("*", { count: "exact", head: true }),
        supabase.from("user_metrics")
          .select("date, devocionais_read, verses_favorited, session_duration_seconds")
          .gte("date", since).order("date", { ascending: true }),
        supabase.from("profiles").select("city, state").eq("status", "approved").limit(500),
        supabase.from("user_metrics")
          .select("user_id, session_duration_seconds, devocionais_read, verses_favorited, kairo_interactions, bible_searches, prayer_count, date")
          .gte("date", since),
        supabase.from("token_usage")
          .select("user_id, feature, tokens_used, created_at")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("profiles").select("id, full_name, email").eq("status", "approved"),
      ]);

      const profileMap: Record<string, string> = {};
      (profiles ?? []).forEach((p: { id: string; full_name: string; email: string }) => {
        profileMap[p.id] = p.full_name || p.email;
      });

      const userMap: Record<string, UserStat> = {};
      (userMetrics ?? []).forEach((m: {
        user_id: string; session_duration_seconds?: number; devocionais_read?: number;
        verses_favorited?: number; kairo_interactions?: number; bible_searches?: number; prayer_count?: number;
      }) => {
        if (!userMap[m.user_id]) {
          userMap[m.user_id] = {
            userId: m.user_id, name: profileMap[m.user_id] ?? m.user_id,
            totalSec: 0, devocionais: 0, versiculos: 0, kairo: 0, biblia: 0, oracao: 0, tokens: 0,
          };
        }
        const u = userMap[m.user_id];
        u.totalSec += m.session_duration_seconds ?? 0;
        u.devocionais += m.devocionais_read ?? 0;
        u.versiculos += m.verses_favorited ?? 0;
        u.kairo += m.kairo_interactions ?? 0;
        u.biblia += m.bible_searches ?? 0;
        u.oracao += m.prayer_count ?? 0;
      });

      (tokenUsage ?? []).forEach((t: { user_id: string; tokens_used?: number }) => {
        if (!userMap[t.user_id]) {
          userMap[t.user_id] = {
            userId: t.user_id, name: profileMap[t.user_id] ?? t.user_id,
            totalSec: 0, devocionais: 0, versiculos: 0, kairo: 0, biblia: 0, oracao: 0, tokens: 0,
          };
        }
        userMap[t.user_id].tokens += t.tokens_used ?? 0;
      });

      const stats = Object.values(userMap).sort((a, b) => b.totalSec - a.totalSec);
      const totalSessionMin = Math.round(
        (globalMetrics ?? []).reduce((s: number, m: { session_duration_seconds?: number }) => s + (m.session_duration_seconds ?? 0), 0) / 60
      );
      const totalTokens = stats.reduce((s, u) => s + u.tokens, 0);

      const cityMap: Record<string, number> = {};
      (topCities ?? []).forEach((p: { city?: string; state?: string }) => {
        const key = `${p.city ?? "?"} / ${p.state ?? "?"}`;
        cityMap[key] = (cityMap[key] ?? 0) + 1;
      });
      const cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

      setKpis({
        totalApproved: totalApproved ?? 0,
        totalPending: totalPending ?? 0,
        totalTestimonies: totalTestimonies ?? 0,
        totalPrayers: totalPrayers ?? 0,
        totalDevotionals: totalDevotionals ?? 0,
        totalSessionMin,
        totalTokens,
      });
      setUserStats(stats);
      setSortedCities(cities);
      setDailyActivity(globalMetrics ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B87333]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cinzel)", color: "#B87333" }}>Métricas</h1>
        <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Últimos 30 dias · Visível apenas para o Admin Master</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Usuários Ativos", value: kpis.totalApproved, color: "#B87333" },
          { label: "Aguardando", value: kpis.totalPending, color: "#fbbf24" },
          { label: "Minutos de Uso", value: kpis.totalSessionMin, color: "#fb923c" },
          { label: "Tokens Gastos", value: kpis.totalTokens.toLocaleString("pt-BR"), color: "#a78bfa", raw: true },
          { label: "Devocionais", value: kpis.totalDevotionals, color: "#34d399" },
          { label: "Pedidos de Oração", value: kpis.totalPrayers, color: "#60a5fa" },
          { label: "Testemunhos", value: kpis.totalTestimonies, color: "#f472b6" },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <p className="text-3xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-cinzel)" }}>
              {kpi.raw ? kpi.value : (kpi.value as number).toLocaleString("pt-BR")}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Uso por Usuário (30 dias)
        </p>
        {userStats.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(184,115,51,0.12)" }}>
                  {["Usuário", "Tempo Total", "Kairo (IA)", "Devocional", "Bíblia", "Oração", "Tokens"].map((h) => (
                    <th key={h} className="text-left px-3 py-2"
                      style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userStats.map((u, i, arr) => (
                  <tr key={u.userId} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--bg-2)" : "none" }}>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{u.name}</p>
                    </td>
                    <td className="px-3 py-2.5"><p style={{ color: "#fb923c", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{fmtMin(u.totalSec)}</p></td>
                    <td className="px-3 py-2.5"><p style={{ color: "#a78bfa", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{u.kairo}</p></td>
                    <td className="px-3 py-2.5"><p style={{ color: "#34d399", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{u.devocionais}</p></td>
                    <td className="px-3 py-2.5"><p style={{ color: "#60a5fa", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{u.biblia}</p></td>
                    <td className="px-3 py-2.5"><p style={{ color: "#f472b6", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{u.oracao}</p></td>
                    <td className="px-3 py-2.5"><p style={{ color: "#B87333", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>{u.tokens.toLocaleString("pt-BR")}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Usuários por Cidade
        </p>
        {sortedCities.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Dados insuficientes.</p>
        ) : (
          <div className="space-y-3">
            {sortedCities.map(([city, count], i) => {
              const pct = Math.round((count / sortedCities[0][1]) * 100);
              return (
                <div key={city} className="flex items-center gap-3">
                  <span className="text-xs w-4 text-right shrink-0" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm truncate" style={{ color: "var(--text)" }}>{city}</p>
                      <p className="text-xs ml-2 shrink-0" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>{count}</p>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "rgba(184,115,51,0.6)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Atividade Diária (últimos 10 dias)
        </p>
        {dailyActivity.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(184,115,51,0.1)" }}>
                  {["Data", "Devocionais", "Versículos Fav.", "Tempo de Uso"].map((h) => (
                    <th key={h} className="text-left px-3 py-2"
                      style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyActivity.slice(-10).reverse().map((m, i, arr) => (
                  <tr key={m.date} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--bg-2)" : "none" }}>
                    <td className="px-3 py-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)", fontSize: "0.78rem" }}>
                      {new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-3 py-2" style={{ color: "#B87333", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>{m.devocionais_read ?? 0}</td>
                    <td className="px-3 py-2" style={{ color: "#B87333", fontFamily: "var(--font-cinzel)", fontSize: "0.85rem" }}>{m.verses_favorited ?? 0}</td>
                    <td className="px-3 py-2" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{fmtMin(m.session_duration_seconds ?? 0)}</td>
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
