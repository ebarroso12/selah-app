import { createClient } from "@/shared/services/supabase/supabase.client";
import { IntegrationError } from "@/shared/lib/errors";
import type { CalendarEvent, NewCalendarEvent } from "../types";

export const agendaService = {
  async list(userId: string): Promise<CalendarEvent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []) as CalendarEvent[];
  },

  async create(userId: string, input: NewCalendarEvent): Promise<CalendarEvent> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
        title: input.title,
        date: input.date,
        time: input.time ?? "09:00",
        description: input.description ?? null,
        psalm_ref: input.psalm_ref ?? null,
        psalm_text: input.psalm_text ?? null,
        notify: input.notify ?? true,
      })
      .select()
      .single();

    if (error) throw new IntegrationError(error.message);
    return data as CalendarEvent;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) throw new IntegrationError(error.message);
  },
};
