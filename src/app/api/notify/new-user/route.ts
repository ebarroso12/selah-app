import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewUserNotificationToAdmin } from "@/lib/email/client";

// Rate limiting simples em memória (por IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

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
  // Rate limiting por IP
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "full_name, email, whatsapp, church_name, city, state, gender, is_legendario, is_legendario_spouse"
      )
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    await sendNewUserNotificationToAdmin(
      profile as {
        full_name: string;
        email: string;
        whatsapp?: string | null;
        church_name: string;
        city: string;
        state: string;
        gender: string;
        is_legendario: boolean;
        is_legendario_spouse: boolean;
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[notify/new-user] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao enviar notificação" },
      { status: 500 }
    );
  }
}
