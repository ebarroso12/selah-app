/**
 * invitations.server.ts — utilitários server-side para convites.
 */
import { createServiceClient } from "@/shared/services/supabase/supabase.server";

export interface InvitationCheckResult {
  valid: boolean;
  permissions: string[];
  reason?: "expired" | "used" | "not_found";
}

export async function getInvitation(token: string | null | undefined): Promise<InvitationCheckResult> {
  if (!token) return { valid: false, permissions: [], reason: "not_found" };

  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("invitations")
    .select("default_permissions, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (!data) return { valid: false, permissions: [], reason: "not_found" };
  if (data.used_at) return { valid: false, permissions: [], reason: "used" };
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { valid: false, permissions: [], reason: "expired" };
  }

  return { valid: true, permissions: data.default_permissions ?? [] };
}

/**
 * Marca o convite como usado e retorna as permissões a aplicar.
 * Retorna [] se o token for inválido (silencioso — usuário entra sem permissões extras).
 */
export async function consumeInvitationToken(
  token: string | null | undefined,
  usedByUserId: string
): Promise<string[]> {
  const check = await getInvitation(token);
  if (!check.valid || !token) return [];

  const supabase = await createServiceClient();
  await supabase
    .from("invitations")
    .update({ used_by: usedByUserId, used_at: new Date().toISOString() })
    .eq("token", token);

  return check.permissions;
}
