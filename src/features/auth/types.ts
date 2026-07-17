import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import type { SignInInput, SignUpInput, ForgotPasswordInput, ResetPasswordInput } from "./schemas/auth.schema";

// Re-export schema input types for convenience
export type { SignInInput, SignUpInput, ForgotPasswordInput, ResetPasswordInput };

// Auth state
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

// Service result wrappers
export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface SignInResult extends AuthResult {
  redirectTo?: string;
}

export interface SignUpResult extends AuthResult {
  userId?: string;
}

// Profile update input (subset of Profile.Update)
export interface UpdateProfileInput {
  full_name?: string;
  church_name?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram_handle?: string | null;
  linkedin_url?: string | null;
  birth_date?: string | null;
  photo_url?: string | null;
  wants_to_be_legendario?: boolean;
}

// Re-export Profile type
export type { Profile, User };
