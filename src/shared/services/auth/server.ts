/**
 * server.ts — helpers server-side de autenticação.
 * Uso exclusivo em Server Components e Route Handlers (não importar em client components).
 */
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/shared/services/supabase/supabase.server";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { hasPermission, hasAnyPermission, type Permission } from "./permissions";

// ─── Primitives ───────────────────────────────────────────────────────────────

export async function getServerUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getServerProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}

// ─── Guards para Server Components (lançam redirect) ─────────────────────────

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { user, supabase };
}

/**
 * Exige usuário ativo (não banido/rejeitado).
 * Não exige mais aprovação manual — usuários são criados já aprovados.
 */
export async function requireApproved() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/register");

  if (profile.status === "rejected" || profile.status === "banned") {
    redirect(`/login?error=${profile.status}&signout=1`);
  }

  return { user, profile: profile as Profile, supabase };
}

/**
 * Permite acesso ao /admin para usuários com role=admin OU qualquer permissão.
 */
export async function requireAdminOrPermissioned() {
  const { user, profile, supabase } = await requireApproved();

  if (!hasAnyPermission(profile)) {
    redirect("/home");
  }

  return { user, profile, supabase };
}

/**
 * Exige role=admin (super-admin). Para áreas restritas como gerenciar permissões.
 */
export async function requireAdmin() {
  const { user, profile, supabase } = await requireApproved();

  if (profile.role !== "admin") {
    redirect("/home");
  }

  return { user, profile, supabase };
}

/**
 * Exige permissão específica. Admin (role=admin) sempre passa.
 */
export async function requirePermission(perm: Permission) {
  const { user, profile, supabase } = await requireApproved();

  if (!hasPermission(profile, perm)) {
    redirect("/home");
  }

  return { user, profile, supabase };
}

// ─── Guards para Route Handlers (retornam NextResponse) ──────────────────────

export async function requireAuthOrUnauthorized(): Promise<
  { user: User; profile: Profile } | NextResponse
> {
  const profile = await getServerProfile();
  const user = await getServerUser();

  if (!user || !profile) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  return { user, profile };
}

export async function requireAdminOrForbidden(): Promise<
  { user: User; profile: Profile } | NextResponse
> {
  const result = await requireAuthOrUnauthorized();
  if (result instanceof NextResponse) return result;

  if (result.profile.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return result;
}

export async function requirePermissionOrForbidden(
  perm: Permission
): Promise<{ user: User; profile: Profile } | NextResponse> {
  const result = await requireAuthOrUnauthorized();
  if (result instanceof NextResponse) return result;

  if (!hasPermission(result.profile, perm)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return result;
}
