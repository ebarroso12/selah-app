/**
 * PATCH /api/admin/users/[id]/permissions
 * Body: { permissions: Permission[] }
 *
 * Apenas super-admins (role=admin) podem alterar permissões.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { PERMISSION_KEYS, type Permission } from "@/shared/services/auth/permissions";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const raw = body.permissions;

  if (!Array.isArray(raw)) {
    return NextResponse.json({ error: "permissions deve ser um array" }, { status: 400 });
  }

  const permissions = raw.filter(
    (p): p is Permission => typeof p === "string" && PERMISSION_KEYS.includes(p as Permission)
  );

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ permissions })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, permissions });
}
