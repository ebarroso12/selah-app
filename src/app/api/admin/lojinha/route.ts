/**
 * /api/admin/lojinha — gerencia os destaques da Lojinha.
 *
 * GET    → produtos atuais (personalizados ou padrão)
 * POST   → salva a lista de produtos editada pelo admin
 * DELETE → restaura os produtos padrão
 *
 * Autorização: role=admin OU permissão `manage_lojinha`.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { requirePermissionOrForbidden } from "@/shared/services/auth/server";
import {
  DEFAULT_PRODUCTS,
  LOJINHA_SETTING_KEY,
  isValidProductList,
} from "@/features/lojinha/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requirePermissionOrForbidden("manage_lojinha");
  if (auth instanceof NextResponse) return auth;

  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value, updated_at")
    .eq("key", LOJINHA_SETTING_KEY)
    .maybeSingle();

  let products = DEFAULT_PRODUCTS;
  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value);
      if (isValidProductList(parsed)) products = parsed;
    } catch { /* JSON inválido — usa padrão */ }
  }

  return NextResponse.json({
    products,
    updated_at: data?.updated_at ?? null,
    is_custom: !!data,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermissionOrForbidden("manage_lojinha");
  if (auth instanceof NextResponse) return auth;

  const { products } = await req.json().catch(() => ({ products: null }));

  if (!isValidProductList(products)) {
    return NextResponse.json(
      { error: "Lista inválida: cada produto precisa de nome e imagem (URL http), máximo 12 itens." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServiceClient();
    const { error } = await supabase.from("app_settings").upsert({
      key: LOJINHA_SETTING_KEY,
      value: JSON.stringify(products),
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao salvar produtos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requirePermissionOrForbidden("manage_lojinha");
  if (auth instanceof NextResponse) return auth;

  const supabase = await createServiceClient();
  await supabase.from("app_settings").delete().eq("key", LOJINHA_SETTING_KEY);
  return NextResponse.json({ ok: true });
}
