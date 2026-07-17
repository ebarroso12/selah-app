"use client";

import { useState, useEffect, useCallback } from "react";
import { eventService } from "../services/event.service";
import type { Event, NewEvent, UpdateEvent } from "../types";

export function useEvents(mode: "upcoming" | "all" = "upcoming") {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = mode === "upcoming"
        ? await eventService.listUpcoming()
        : await eventService.listAll();
      setEvents(data);
    } catch {
      setError("Erro ao carregar eventos.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  async function create(input: NewEvent): Promise<boolean> {
    try {
      await eventService.create(input);
      await load();
      return true;
    } catch {
      setError("Erro ao criar evento.");
      return false;
    }
  }

  async function update(id: string, input: UpdateEvent): Promise<boolean> {
    try {
      await eventService.update(id, input);
      await load();
      return true;
    } catch {
      setError("Erro ao atualizar evento.");
      return false;
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await eventService.remove(id);
      await load();
      return true;
    } catch {
      setError("Erro ao remover evento.");
      return false;
    }
  }

  return { events, loading, error, reload: load, create, update, remove };
}
