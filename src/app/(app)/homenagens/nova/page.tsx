import { NovaHomenagemForm } from "@/features/homenagens";

export const metadata = { title: "Nova Homenagem" };

export default function NovaHomenagemPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-xl tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
          Nova Homenagem
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
          Famílias dos Legendários
        </p>
      </div>
      <NovaHomenagemForm />
    </div>
  );
}
