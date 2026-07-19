export const dynamic = "force-dynamic";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { TestimonyForm, TestimonyList } from "@/features/comunidade";
import type { Testimony, TestimonyType } from "@/features/comunidade";

export const metadata = { title: "Comunidade" };

const TYPE_LABELS: Record<string, string> = {
  todos: "Todos",
  irmao: "Irmãos",
  legendario: "Legendários",
  esposa_legendario: "Esposas de Legendários",
};

async function getTestimonies(type?: TestimonyType): Promise<Testimony[]> {
  const supabase = await createClient();
  let query = supabase
    .from("testimonies")
    .select("*, profile:profiles(full_name, photo_url, church_name, city)")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data } = await query.limit(20);
  return (data ?? []) as Testimony[];
}

export default async function ComunidadePage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const activeType = tipo ?? "todos";
  const testimonies = await getTestimonies(
    activeType !== "todos" ? (activeType as TestimonyType) : undefined
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Comunidade
        </p>
        <h1 className="text-2xl">Testemunhos</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
          Histórias que edificam e fortalecem a fé da comunidade.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_LABELS).map(([value, label]) => {
          const isActive = activeType === value;
          return (
            <a
              key={value}
              href={value === "todos" ? "/comunidade" : `/comunidade?tipo=${value}`}
              className="text-xs px-4 py-2 rounded-full transition-all"
              style={{
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: isActive ? "var(--gold)" : "var(--bg-2)",
                color: isActive ? "#080d1a" : "var(--text-muted)",
                border: `1px solid ${isActive ? "var(--gold)" : "var(--border)"}`,
              }}
            >
              {label}
            </a>
          );
        })}
      </div>

      <TestimonyList testimonies={testimonies} />

      <div className="border-t pt-8" style={{ borderColor: "rgba(184,115,51,0.12)" }}>
        <h2 className="text-lg mb-1">Compartilhar Testemunho</h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-subtle)" }}>
          Seu testemunho será revisado antes de ser publicado.
        </p>
        <TestimonyForm />
      </div>
    </div>
  );
}
