import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServiceClient();
    
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Executar cada query individualmente com tratamento de erro para não quebrar tudo se uma falhar
    const getProfiles = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (error) console.error("Erro profiles:", error);
        return data || [];
      } catch (e) { return []; }
    };

    const getCount = async (table: string, filter?: { col: string, val: any }) => {
      try {
        let query = supabase.from(table).select("*", { count: "exact", head: true });
        if (filter) query = query.eq(filter.col, filter.val);
        const { count, error } = await query;
        if (error) console.error(`Erro count ${table}:`, error);
        return count || 0;
      } catch (e) { return 0; }
    };

    const getMetrics = async () => {
      try {
        const { data, error } = await supabase.from("user_metrics").select("user_id, session_duration_seconds");
        if (error) console.error("Erro metrics:", error);
        return data || [];
      } catch (e) { return []; }
    };

    const getHomenagens = async () => {
      try {
        const { data, error } = await supabase.from("homenagens").select("id, status");
        if (error) console.error("Erro homenagens:", error);
        return data || [];
      } catch (e) { return []; }
    };

    const [
      profiles,
      totalDevotionals,
      openPrayers,
      metrics,
      totalEvents,
      homenagens
    ] = await Promise.all([
      getProfiles(),
      getCount("devotionals"),
      getCount("prayer_requests", { col: "status", val: "open" }),
      getMetrics(),
      getCount("events"),
      getHomenagens()
    ]);

    const metricsByUser: Record<string, number> = {};
    metrics.forEach(m => {
      metricsByUser[m.user_id] = (metricsByUser[m.user_id] || 0) + (m.session_duration_seconds || 0);
    });

    const enrichedUsers = profiles.map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      status: u.status,
      last_seen_at: u.last_seen_at,
      totalMinutes: Math.round((metricsByUser[u.id] || 0) / 60),
      isOnline: u.last_seen_at ? u.last_seen_at >= fiveMinAgo : false,
      activeToday: u.last_seen_at ? u.last_seen_at >= oneDayAgo : false,
    }));

    return NextResponse.json({
      totalUsers: profiles.length,
      onlineNow: enrichedUsers.filter(u => u.isOnline).length,
      activeToday: enrichedUsers.filter(u => u.activeToday).length,
      neverLoggedIn: enrichedUsers.filter(u => !u.last_seen_at).length,
      totalMinutesAll: enrichedUsers.reduce((acc, u) => acc + u.totalMinutes, 0),
      totalDevotionals: totalDevotionals,
      openPrayers: openPrayers,
      totalEvents: totalEvents,
      homenagensPendentes: homenagens.filter(h => h.status === 'pending').length,
      users: enrichedUsers
    });
  } catch (error: any) {
    console.error("[API_ADMIN_STATS] Erro Fatal:", error);
    // Retorna um objeto vazio em vez de erro 500 para não quebrar a UI
    return NextResponse.json({ 
      error: error.message,
      totalUsers: 0,
      onlineNow: 0,
      activeToday: 0,
      neverLoggedIn: 0,
      totalMinutesAll: 0,
      totalDevotionals: 0,
      openPrayers: 0,
      totalEvents: 0,
      homenagensPendentes: 0,
      users: []
    });
  }
}
