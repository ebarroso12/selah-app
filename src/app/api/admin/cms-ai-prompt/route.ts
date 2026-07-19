import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import {
  CMS_AI_DEFAULT_PROMPTS,
  isCmsAiKind,
  settingKeyFor,
  type CmsAiKind,
} from "@/features/admin-cms/prompts/cms-ai-prompts";

export const dynamic = "force-dynamic";

/**
 * GET  /api/admin/cms-ai-prompt?kind=partner|cause|legendarios_event
 *   → { prompt, updated_at, is_custom }
 * POST /api/admin/cms-ai-prompt  { kind, prompt }
 *   → { ok: true }  (salva o prompt padrão em app_settings)
 * DELETE /api/admin/cms-ai-prompt?kind=...
 *   → { ok: true }  (restaura o default hardcoded)
 *
 * Mesmo padrão de /api/admin/kairo-prompt (app_settings via service_role).
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  const kind = req.nextUrl.searchParams.get("kind");
  if (!isCmsAiKind(kind)) {
    return NextResponse.json({ error: "kind inválido" }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value, updated_at")
      .eq("key", settingKeyFor(kind))
      .maybeSingle();

    return NextResponse.json({
      prompt: data?.value ?? CMS_AI_DEFAULT_PROMPTS[kind as CmsAiKind],
      updated_at: data?.updated_at ?? null,
      is_custom: !!data,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar prompt" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  try {
    const { kind, prompt } = await req.json();
    if (!isCmsAiKind(kind)) {
      return NextResponse.json({ error: "kind inválido" }, { status: 400 });
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 30) {
      return NextResponse.json({ error: "Prompt inválido (mínimo 30 caracteres)" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { error } = await supabase.from("app_settings").upsert(
      {
        key: settingKeyFor(kind),
        value: prompt.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao salvar prompt";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  const kind = req.nextUrl.searchParams.get("kind");
  if (!isCmsAiKind(kind)) {
    return NextResponse.json({ error: "kind inválido" }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();
    await supabase.from("app_settings").delete().eq("key", settingKeyFor(kind));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao restaurar prompt" }, { status: 500 });
  }
}
