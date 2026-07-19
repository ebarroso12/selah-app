import { createClient } from "@/shared/services/supabase/supabase.client";
import { IntegrationError } from "@/shared/lib/errors";
import type { Event, NewEvent, UpdateEvent } from "../types";

export const eventService = {
  async listUpcoming(limit = 20): Promise<Event[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date_start", new Date().toISOString())
      .order("date_start", { ascending: true })
      .limit(limit);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as Event[];
  },

  async listAll(limit = 100): Promise<Event[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date_start", { ascending: true })
      .limit(limit);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as Event[];
  },

  async create(input: NewEvent): Promise<Event> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: input.title,
        category: input.category,
        date_start: input.date_start,
        date_end: input.date_end ?? null,
        description: input.description ?? null,
        location: input.location ?? null,
        image_url: input.image_url ?? null,
      })
      .select()
      .single();

    if (error) throw new IntegrationError(error.message);
    return data as Event;
  },

  async update(id: string, input: UpdateEvent): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("events")
      .update(input)
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },
};
