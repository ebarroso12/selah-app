"use client";

import { useState, useEffect } from "react";
import { getToday } from "../services/devotional.service";
import type { Devotional } from "../types";

export function useTodayDevotional() {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToday()
      .then(setDevotional)
      .finally(() => setLoading(false));
  }, []);

  return { devotional, loading };
}
