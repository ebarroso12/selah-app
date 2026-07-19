"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  /** Data/hora alvo em ISO (ex: "2026-08-27T08:00:00-03:00") */
  target: string;
  accentColor?: string;
  className?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getRemaining(target: string): Remaining {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

const UNITS: { key: keyof Omit<Remaining, "done">; label: string }[] = [
  { key: "days", label: "Dias" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Seg" },
];

export function CountdownTimer({ target, accentColor = "var(--gold)", className = "" }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    setRemaining(getRemaining(target));
    const interval = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!remaining) return null;

  if (remaining.done) {
    return (
      <p className={`text-center font-bold ${className}`} style={{ color: accentColor, fontFamily: "var(--font-cinzel)" }}>
        O evento começou!
      </p>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2.5 sm:gap-4 ${className}`}>
      {UNITS.map((u) => (
        <div key={u.key} className="flex flex-col items-center">
          <div
            className="flex items-center justify-center rounded-xl font-bold tabular-nums"
            style={{
              width: 58,
              height: 58,
              background: "rgba(0,0,0,0.28)",
              border: `1.5px solid ${accentColor}`,
              color: accentColor,
              fontFamily: "var(--font-cinzel)",
              fontSize: "1.4rem",
              boxShadow: `0 0 20px ${accentColor}55`,
            }}
          >
            {String(remaining[u.key]).padStart(2, "0")}
          </div>
          <span
            className="mt-1.5 text-[0.6rem] tracking-widest uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)" }}
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
