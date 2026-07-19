"use client";

import { getTodayBR } from "@/shared/lib/utils";
import type { Devotional } from "../types";
import { DevotionalCard } from "./DevotionalCard";

interface DevotionalListProps {
  devotionals: Devotional[];
  today?: string;
}

export function DevotionalList({ devotionals, today }: DevotionalListProps) {
  const todayStr = today ?? getTodayBR();
  const archive = devotionals.filter((d) => d.date !== todayStr);

  if (archive.length === 0) return null;

  return (
    <div>
      <p
        className="text-xs tracking-widest uppercase mb-4"
        style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
      >
        Arquivo
      </p>
      <div className="space-y-3">
        {archive.map((d) => (
          <DevotionalCard key={d.id} devotional={d} />
        ))}
      </div>
    </div>
  );
}
