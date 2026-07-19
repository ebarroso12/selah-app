import { NextResponse } from "next/server";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json() as {
      sessionSeconds?: number;
      section?: string;
    };

    const { sessionSeconds = 0, section } = body;
    const { getTodayBR } = await import("@/shared/lib/utils");
    const today = getTodayBR();
    const serviceClient = await createServiceClient();

    // Buscar registro do dia
    const { data: existing } = await serviceClient
      .from("user_metrics")
      .select("id, session_duration_seconds, sections_visited, consecutive_days")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      // Atualizar registro existente
      const sectionsVisited = (existing.sections_visited as Record<string, number>) ?? {};
      if (section) {
        sectionsVisited[section] = (sectionsVisited[section] ?? 0) + 1;
      }
      await serviceClient
        .from("user_metrics")
        .update({
          session_duration_seconds: (existing.session_duration_seconds ?? 0) + sessionSeconds,
          sections_visited: sectionsVisited,
        })
        .eq("id", existing.id);
    } else {
      // Criar novo registro para hoje
      const sectionsVisited: Record<string, number> = {};
      if (section) sectionsVisited[section] = 1;

      // Calcular dias consecutivos
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const { data: yesterdayMetric } = await serviceClient
        .from("user_metrics")
        .select("consecutive_days")
        .eq("user_id", user.id)
        .eq("date", yesterday)
        .maybeSingle();
      const consecutiveDays = yesterdayMetric ? (yesterdayMetric.consecutive_days ?? 0) + 1 : 1;

      await serviceClient.from("user_metrics").insert({
        user_id: user.id,
        date: today,
        session_duration_seconds: sessionSeconds,
        sections_visited: sectionsVisited,
        consecutive_days: consecutiveDays,
      });
    }

    // Atualizar last_seen_at no perfil — essencial para "Online Agora" e "Ativo Hoje"
    await serviceClient
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[metrics/session] Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
