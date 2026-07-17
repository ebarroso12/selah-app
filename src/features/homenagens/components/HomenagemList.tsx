import { HomenagemCard } from "./HomenagemCard";
import type { Homenagem } from "../types";

interface HomenagemListProps {
  homenagens: Homenagem[];
}

export function HomenagemList({ homenagens }: HomenagemListProps) {
  if (homenagens.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
          Nenhuma homenagem publicada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {homenagens.map((h) => (
        <HomenagemCard key={h.id} homenagem={h} />
      ))}
    </div>
  );
}
