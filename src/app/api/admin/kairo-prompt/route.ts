import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { requireAdmin } from "@/shared/services/auth/server";
import { KAIRO_SYSTEM_PROMPT } from "@/features/kairo/prompts/kairo.system";

const SETTING_KEY = "kairo_system_prompt";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value, updated_at")
      .eq("key", SETTING_KEY)
      .maybeSingle();

    return NextResponse.json({
      prompt: data?.value ?? KAIRO_SYSTEM_PROMPT,
      updated_at: data?.updated_at ?? null,
      is_custom: !!data,
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 50) {
      return NextResponse.json({ error: "Prompt inválido (mínimo 50 caracteres)" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { error } = await supabase.from("app_settings").upsert({
      key: SETTING_KEY,
      value: prompt.trim(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao salvar prompt";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await requireAdmin();
    const supabase = await createServiceClient();
    await supabase.from("app_settings").delete().eq("key", SETTING_KEY);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
