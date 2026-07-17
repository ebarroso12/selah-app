import { PrayerCard } from "./PrayerCard";
import type { PrayerRequest } from "../types";

interface PrayerListProps {
  prayers: PrayerRequest[];
}

export function PrayerList({ prayers }: PrayerListProps) {
  if (prayers.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
          Nenhum pedido público no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prayers.map((prayer) => (
        <PrayerCard key={prayer.id} prayer={prayer} />
      ))}
    </div>
  );
}
