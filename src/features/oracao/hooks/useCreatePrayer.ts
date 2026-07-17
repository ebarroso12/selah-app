"use client";

import { useState } from "react";
import { prayerService } from "../services/prayer.service";
import type { NewPrayerRequest, PrayerRequest } from "../types";
import type { AppError } from "@/shared/lib/errors";

export function useCreatePrayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  async function create(input: NewPrayerRequest): Promise<PrayerRequest | null> {
    setLoading(true);
    setError(null);
    try {
      const result = await prayerService.create(input);
      return result;
    } catch (e) {
      setError(e as AppError);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { create, loading, error } as const;
}
