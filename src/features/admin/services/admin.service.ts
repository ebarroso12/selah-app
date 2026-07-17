import { randomBytes } from "crypto";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { IntegrationError } from "@/shared/lib/errors";

function generateSecurePassword(): string {
  return randomBytes(20).toString("base64url");
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  status: string;
  last_seen_at: string | null;
  church_name: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export const adminService = {
  async listUsers(filter?: string): Promise<AdminProfile[]> {
    const supabase = await createServiceClient();
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter && filter !== "todos") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as AdminProfile[];
  },

  async updateStatus(userId: string, status: "approved" | "banned"): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);

    if (error) throw new IntegrationError(error.message);
  },

  async deleteUser(userId: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw new IntegrationError(profileError.message);

    await supabase.auth.admin.deleteUser(userId);
  },

  async inviteUser(email: string, fullName: string): Promise<{ userId: string; alreadyExisted: boolean }> {
    const supabase = await createServiceClient();

    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === email);

    if (existing) {
      await supabase.from("profiles").upsert({
        id: existing.id,
        email,
        full_name: fullName || email.split("@")[0],
        status: "approved",
        gender: "male",
        church_name: "",
        city: "",
        state: "",
      }, { onConflict: "id" });

      return { userId: existing.id, alreadyExisted: true };
    }

    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password: generateSecurePassword(),
      email_confirm: true,
      user_metadata: { full_name: fullName || email.split("@")[0] },
    });

    if (error || !newUser?.user) throw new IntegrationError(error?.message ?? "Erro ao criar usuário.");

    await supabase.from("profiles").insert({
      id: newUser.user.id,
      email,
      full_name: fullName || email.split("@")[0],
      status: "approved",
      gender: "male",
      church_name: "",
      city: "",
      state: "",
    });

    return { userId: newUser.user.id, alreadyExisted: false };
  },
};
