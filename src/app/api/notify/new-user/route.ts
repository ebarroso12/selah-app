import { NextResponse } from "next/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { emailService } from "@/shared/services/email/email.service";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  try {
    let body: { userId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
    }

    const { userId } = body;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, whatsapp, church_name, city, state, gender, is_legendario, is_legendario_spouse")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    await emailService.send({
      template: "newUser",
      to: profile.email,
      data: {
        full_name: profile.full_name,
        email: profile.email,
        whatsapp: profile.whatsapp,
        church_name: profile.church_name,
        city: profile.city,
        state: profile.state,
        gender: profile.gender,
        is_legendario: profile.is_legendario ?? false,
        is_legendario_spouse: profile.is_legendario_spouse ?? false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[notify/new-user] Erro:", error);
    return NextResponse.json({ error: "Falha ao enviar notificação" }, { status: 500 });
  }
}
