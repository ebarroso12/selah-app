/**
 * /api/admin/invitations — gerencia links de convite.
 *
 * POST   → cria um novo convite e retorna a URL pública
 * GET    → lista convites criados pelo usuário atual
 * DELETE → revoga um convite por id
 *
 * Autorização: role=admin OU permissão `invite_users`.
 */
import { NextResponse, NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { requirePermissionOrForbidden } from "@/shared/services/auth/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { PERMISSION_KEYS, type Permission } from "@/shared/services/auth/permissions";

export const dynamic = "force-dynamic";

function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

function isValidPermissionList(list: unknown): list is Permission[] {
  if (!Array.isArray(list)) return false;
  return list.every((p) => typeof p === "string" && PERMISSION_KEYS.includes(p as Permission));
}

export async function POST(request: NextRequest) {
  const auth = await requirePermissionOrForbidden("invite_users");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const defaultPermissions: Permission[] = isValidPermissionList(body.default_permissions)
    ? body.default_permissions
    : [];

  const onlyAdmin = auth.profile.role === "admin";
  if (defaultPermissions.length > 0 && !onlyAdmin) {
    return NextResponse.json(
      { error: "Apenas administradores podem pré-conceder permissões." },
      { status: 403 }
    );
  }

  const token = generateToken();
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      token,
      created_by: auth.profile.id,
      default_permissions: defaultPermissions,
    })
    .select("id, token, expires_at, default_permissions")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Erro ao criar convite" }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const url = `${origin}/convite/${data.token}`;

  return NextResponse.json({ ...data, url });
}

export async function GET() {
  const auth = await requirePermissionOrForbidden("invite_users");
  if (auth instanceof NextResponse) return auth;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, token, created_at, expires_at, used_at, used_by, default_permissions")
    .eq("created_by", auth.profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitations: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePermissionOrForbidden("invite_users");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("created_by", auth.profile.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
