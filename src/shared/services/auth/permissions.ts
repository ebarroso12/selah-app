/**
 * permissions.ts — sistema de permissões granulares
 *
 * Admin (`role === 'admin'`) tem todas as permissões implicitamente.
 * Demais usuários só têm o que estiver em `profile.permissions[]`.
 */
import type { Profile } from "@/types/database";

export const PERMISSIONS = {
  manage_users: "Gerenciar usuários (ver, banir, excluir)",
  manage_homenagens: "Aprovar homenagens",
  manage_events: "Criar e editar eventos",
  manage_oracoes: "Moderar pedidos de oração",
  manage_comunidade: "Moderar comunidade e testemunhos",
  manage_devocional: "Gerenciar devocionais",
  manage_kairo: "Editar prompt do Kairo",
  manage_legendarios: "Gerenciar legendários",
  manage_parceiros: "Gerenciar parceiros",
  manage_proposito: "Gerenciar propósito social",
  manage_igreja: "Gerenciar dados da igreja",
  manage_lojinha: "Gerenciar destaques da Lojinha",
  view_metrics: "Ver métricas",
  invite_users: "Convidar usuários",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

export function hasPermission(
  profile: Pick<Profile, "role" | "permissions"> | null | undefined,
  perm: Permission
): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return profile.permissions?.includes(perm) ?? false;
}

export function hasAnyPermission(
  profile: Pick<Profile, "role" | "permissions"> | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return (profile.permissions?.length ?? 0) > 0;
}
