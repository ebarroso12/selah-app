import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServiceClient();
    
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: users, error: errUsers },
      { count: totalDevotionals },
      { count: openPrayers },
      { data: metricsData },
      { count: totalEvents },
      { data: homenagens }
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("devotionals").select("*", { count: "exact", head: true }),
      supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("user_metrics").select("user_id, session_duration_seconds"),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("homenagens").select("id, status")
    ]);

    if (errUsers) throw errUsers;

    const profiles = users || [];
    const metrics = metricsData || [];
    
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
      totalDevotionals: totalDevotionals || 0,
      openPrayers: openPrayers || 0,
      totalEvents: totalEvents || 0,
      homenagensPendentes: (homenagens || []).filter(h => h.status === 'pending').length,
      users: enrichedUsers
    });
  } catch (error: any) {
    console.error("[API_ADMIN_STATS] Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
