"use client";

import { useState, useEffect } from "react";
import { getRecent } from "../services/devotional.service";
import type { Devotional } from "../types";

export function useRecentDevotionals(limit = 20) {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecent(limit)
      .then(setDevotionals)
      .finally(() => setLoading(false));
  }, [limit]);

  return { devotionals, loading };
}
