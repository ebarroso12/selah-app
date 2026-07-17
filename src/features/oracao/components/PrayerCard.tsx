import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate, getInitials } from "@/shared/lib/utils";
import type { PrayerRequest } from "../types";

interface PrayerCardProps {
  prayer: PrayerRequest;
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  const name = prayer.profile?.full_name ?? "Anônimo";
  const initials = getInitials(name);

  return (
    <Card className="p-5">
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
        {prayer.text}
      </p>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "rgba(201,162,39,0.12)",
              color: "#c9a227",
              fontFamily: "var(--font-cinzel)",
            }}
          >
            {initials}
          </div>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            {name}
            {prayer.profile?.church_name ? ` · ${prayer.profile.church_name}` : ""}
          </p>
        </div>
        <p
          className="text-xs"
          style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}
        >
          {formatDate(prayer.created_at, { day: "2-digit", month: "short" })}
        </p>
      </div>
      {prayer.via_whatsapp && (
        <div className="mt-2">
          <Badge variant="outline" className="text-[0.55rem]">Via WhatsApp</Badge>
        </div>
      )}
    </Card>
  );
}
