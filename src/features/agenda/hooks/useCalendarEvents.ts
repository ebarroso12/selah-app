"use client";
import { useState, useEffect, useCallback } from "react";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";
import { agendaService } from "../services/agenda.service";
import type { CalendarEvent, NewCalendarEvent } from "../types";

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await agendaService.list(user.id);
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(input: NewCalendarEvent): Promise<boolean> {
    try {
      const supabase = getBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      await agendaService.create(user.id, input);
      await load();
      return true;
    } catch {
      return false;
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await agendaService.remove(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      await load();
    }
  }

  return { events, loading, error, create, remove, reload: load };
}
