"use client";

import { getTodayBR } from "@/shared/lib/utils";
import { DevotionalCard } from "@/features/devocional/components/DevotionalCard";
import { DevotionalGenerator } from "@/features/devocional/components/DevotionalGenerator";
import { DevotionalList } from "@/features/devocional/components/DevotionalList";
import { useTodayDevotional } from "@/features/devocional/hooks/useTodayDevotional";
import { useRecentDevotionals } from "@/features/devocional/hooks/useRecentDevotionals";

export default function DevocionalPage() {
  const { devotional: todayDevotional, loading: loadingToday } = useTodayDevotional();
  const { devotionals, loading: loadingRecent } = useRecentDevotionals(20);

  const loading = loadingToday || loadingRecent;
  const today = getTodayBR();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Devocional
        </p>
        <h1 className="text-2xl">Pause e Reflita</h1>
      </div>

      {/* Gerador interativo com IA */}
      <DevotionalGenerator />

      {/* Devocional do dia */}
      {!loading && todayDevotional && (
        <DevotionalCard devotional={todayDevotional} expanded />
      )}

      {/* Arquivo */}
      {!loading && <DevotionalList devotionals={devotionals} today={today} />}

      {/* Estado vazio */}
      {!loading && devotionals.length === 0 && (
        <div className="card p-6 text-center">
          <p className="scripture text-lg mb-2" style={{ color: "var(--text-muted)" }}>
            &quot;A sua palavra é lâmpada que ilumina o meu caminho.&quot;
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
            Salmos 119:105
          </p>
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
            Use o gerador de IA acima para criar seu primeiro devocional!
          </p>
        </div>
      )}
    </div>
  );
}
