import { createClient } from "@/shared/services/supabase/supabase.client";
import { IntegrationError } from "@/shared/lib/errors";
import type { PrayerRequest, NewPrayerRequest, PrayerStatus } from "../types";

export const prayerService = {
  async listPublic(limit = 25): Promise<PrayerRequest[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*, profile:profiles(full_name, church_name, city)")
      .eq("is_public", true)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as PrayerRequest[];
  },

  async create(input: NewPrayerRequest): Promise<PrayerRequest> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("prayer_requests")
      .insert({ ...input, via_whatsapp: input.via_whatsapp ?? false, status: "open" })
      .select()
      .single();

    if (error) throw new IntegrationError(error.message);
    return data as PrayerRequest;
  },

  async updateStatus(id: string, status: PrayerStatus): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("prayer_requests")
      .update({ status })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },
};
