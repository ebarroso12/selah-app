import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { generateAI } from "@/shared/services/ai/ai.service";
import {
  CMS_AI_DEFAULT_PROMPTS,
  isCmsAiKind,
  settingKeyFor,
  fillPrompt,
} from "@/features/admin-cms/prompts/cms-ai-prompts";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/cms-ai-generate
 * Body: { kind, name, url?, rawNotes, promptOverride? }
 * Gera o texto de apresentação/autoridade de um parceiro, causa social ou
 * evento em destaque, seguindo o padrão do prompt Kairo (app_settings + fallback).
 *
 * Retorna: { paragraphs: string[] }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const { kind, name, url, rawNotes, promptOverride } = body ?? {};

    if (!isCmsAiKind(kind)) {
      return NextResponse.json({ error: "kind inválido" }, { status: 400 });
    }
    if (!rawNotes || typeof rawNotes !== "string" || rawNotes.trim().length < 10) {
      return NextResponse.json(
        { error: "Forneça informações brutas (mín. 10 caracteres) para a IA usar como base." },
        { status: 400 }
      );
    }

    // Template: override do editor → app_settings → default hardcoded
    let template: string;
    if (typeof promptOverride === "string" && promptOverride.trim().length >= 30) {
      template = promptOverride;
    } else {
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", settingKeyFor(kind))
        .maybeSingle();
      template = data?.value ?? CMS_AI_DEFAULT_PROMPTS[kind];
    }

    const systemPrompt = fillPrompt(template, {
      name: typeof name === "string" ? name : "",
      url: typeof url === "string" ? url : "",
      rawNotes,
    });

    // feature="homenagens_reescrever": reaproveita a tag de "reescrita de texto".
    // Sem userId → não dispara tracking/orçamento (utilitário admin), igual ao
    // padrão do endpoint /api/admin/kairo-prompt/test.
    const { content } = await generateAI({
      model: "gpt-4o-mini",
      feature: "homenagens_reescrever",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            'Gere o texto agora, respondendo apenas com o JSON no formato {"paragraphs": [...]}.',
        },
      ],
      maxTokens: 1400,
      temperature: 0.8,
      responseFormat: "json_object",
    });

    let paragraphs: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.paragraphs)) {
        paragraphs = parsed.paragraphs
          .filter((p: unknown): p is string => typeof p === "string")
          .map((p: string) => p.trim())
          .filter(Boolean);
      }
    } catch {
      // Fallback: quebra o texto por linhas em branco se não vier JSON válido
      paragraphs = content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
    }

    if (paragraphs.length === 0) {
      return NextResponse.json(
        { error: "A IA não retornou texto utilizável. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ paragraphs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao gerar texto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
