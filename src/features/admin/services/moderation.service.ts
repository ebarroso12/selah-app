import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { IntegrationError } from "@/shared/lib/errors";

export const moderationService = {
  async listPendingRegistrations(): Promise<unknown[]> {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return data ?? [];
  },

  async listAllPrayers(status?: string): Promise<unknown[]> {
    const supabase = await createServiceClient();
    let query = supabase
      .from("prayer_requests")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new IntegrationError(error.message);
    return data ?? [];
  },

  async updatePrayerStatus(id: string, status: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("prayer_requests")
      .update({ status })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },

  async listAllTestimonies(filter?: { approved?: boolean }): Promise<unknown[]> {
    const supabase = await createServiceClient();
    let query = supabase
      .from("testimonies")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (filter?.approved !== undefined) query = query.eq("approved", filter.approved);

    const { data, error } = await query;
    if (error) throw new IntegrationError(error.message);
    return data ?? [];
  },

  async approveTestimony(id: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("testimonies")
      .update({ approved: true })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },

  async rejectTestimony(id: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("testimonies")
      .update({ approved: false })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },

  async deleteTestimony(id: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("testimonies")
      .delete()
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },

  async listAllHomenagens(status?: string): Promise<unknown[]> {
    const supabase = await createServiceClient();
    let query = supabase
      .from("homenagens")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new IntegrationError(error.message);
    return data ?? [];
  },

  async approveHomenagem(id: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("homenagens")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },

  async rejectHomenagem(id: string): Promise<void> {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from("homenagens")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },
};
