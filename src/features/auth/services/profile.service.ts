/**
 * profile.service.ts — operações de perfil do usuário
 */
import { createClient } from "@/shared/services/supabase/supabase.client";
import type { Profile } from "@/types/database";
import type { UpdateProfileInput } from "../types";

// ─── Get profile by userId ────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[profile.service] getProfile error:", error.message);
    return null;
  }

  return data;
}

// ─── Get current user's profile ──────────────────────────────────────────────

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  return getProfile(user.id);
}

// ─── Update profile ───────────────────────────────────────────────────────────

export interface UpdateProfileResult {
  ok: boolean;
  profile?: Profile;
  error?: string;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, profile: data ?? undefined };
}
