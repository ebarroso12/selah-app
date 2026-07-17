import { TestimonyCard } from "./TestimonyCard";
import type { Testimony } from "../types";

interface TestimonyListProps {
  testimonies: Testimony[];
}

export function TestimonyList({ testimonies }: TestimonyListProps) {
  if (testimonies.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="scripture text-base mb-2" style={{ color: "var(--text-subtle)" }}>
          &quot;Eles o venceram por causa do sangue do Cordeiro e pela palavra do seu testemunho.&quot;
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Apocalipse 12:11
        </p>
        <p className="text-sm mt-4" style={{ color: "var(--text-subtle)" }}>
          Nenhum testemunho publicado ainda. Seja o primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {testimonies.map((t) => (
        <TestimonyCard key={t.id} testimony={t} />
      ))}
    </div>
  );
}
