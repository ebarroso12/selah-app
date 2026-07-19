import { createClient } from "@/shared/services/supabase/supabase.client";
import { IntegrationError } from "@/shared/lib/errors";
import type { Testimony, NewTestimony, ListApprovedOptions } from "../types";

export const testimonyService = {
  async listApproved(options: ListApprovedOptions = {}): Promise<Testimony[]> {
    const { type, limit = 20 } = options;
    const supabase = createClient();

    let query = supabase
      .from("testimonies")
      .select("*, profile:profiles(full_name, photo_url, church_name, city)")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (type) query = query.eq("type", type);

    const { data, error } = await query.limit(limit);
    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as Testimony[];
  },

  async create(input: NewTestimony): Promise<Testimony> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("testimonies")
      .insert({ ...input, approved: false })
      .select()
      .single();

    if (error) throw new IntegrationError(error.message);
    return data as Testimony;
  },

  async approve(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("testimonies")
      .update({ approved: true })
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },
};
