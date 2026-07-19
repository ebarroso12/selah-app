"use client";

import { useState, useEffect, useCallback } from "react";
import { prayerService } from "../services/prayer.service";
import type { PrayerRequest } from "../types";
import type { AppError } from "@/shared/lib/errors";

export function usePublicPrayers() {
  const [data, setData] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await prayerService.listPublic();
      setData(result);
    } catch (e) {
      setError(e as AppError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh } as const;
}
