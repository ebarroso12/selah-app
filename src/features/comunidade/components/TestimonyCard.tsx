import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate, getInitials } from "@/shared/lib/utils";
import type { Testimony, TestimonyType } from "../types";

const TYPE_LABELS: Record<TestimonyType, string> = {
  irmao: "Irmão / Irmã",
  legendario: "Legendário",
  esposa_legendario: "Esposa de Legendário",
};

interface TestimonyCardProps {
  testimony: Testimony;
}

export function TestimonyCard({ testimony }: TestimonyCardProps) {
  const name = testimony.profile?.full_name ?? "Anônimo";
  const initials = getInitials(name);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", fontFamily: "var(--font-cinzel)" }}
          >
            {initials}
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}
            >
              {name}
            </p>
            {(testimony.profile?.church_name || testimony.profile?.city) && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                {[testimony.profile.church_name, testimony.profile.city].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="badge-gold">
            {TYPE_LABELS[testimony.type]}
          </Badge>
          <span
            className="text-xs"
            style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}
          >
            {formatDate(testimony.created_at, { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      <h2 className="text-base mb-3" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
        {testimony.title}
      </h2>

      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
        {testimony.content}
      </p>
    </Card>
  );
}
