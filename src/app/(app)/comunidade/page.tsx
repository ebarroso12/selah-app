import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Testimony } from "@/types/database";
import TestimonyForm from "./TestimonyForm";

export const metadata = { title: "Comunidade" };

async function getTestimonies(type?: string): Promise<Testimony[]> {
  const supabase = await createClient();
  let query = supabase
    .from("testimonies")
    .select("*, profile:profiles(full_name, photo_url, church_name, city)")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (type && type !== "todos") query = query.eq("type", type);
  const { data } = await query;
  return (data ?? []) as unknown as Testimony[];
}

const TYPE_LABELS: Record<string, string> = {
  todos: "Todos",
  irmao: "Irmãos",
  legendario: "Legendários",
  esposa_legendario: "Esposas de Legendários",
};

const TYPE_BADGE: Record<string, string> = {
  irmao: "badge-gold",
  legendario: "badge-gold",
  esposa_legendario: "badge-gold",
};

export default async function ComunidadePage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const activeType = tipo ?? "todos";
  const testimonies = await getTestimonies(activeType !== "todos" ? activeType : undefined);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Comunidade
        </p>
        <h1 className="text-2xl">Testemunhos</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Histórias que edificam e fortalecem a fé da comunidade.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_LABELS).map(([value, label]) => {
          const isActive = activeType === value;
          return (
            <a key={value}
              href={value === "todos" ? "/comunidade" : `/comunidade?tipo=${value}`}
              className="text-xs px-4 py-2 rounded-full transition-all"
              style={{
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: isActive ? "#c9a227" : "rgba(255,255,255,0.04)",
                color: isActive ? "#080d1a" : "rgba(255,255,255,0.5)",
                border: `1px solid ${isActive ? "#c9a227" : "rgba(255,255,255,0.1)"}`,
              }}>
              {label}
            </a>
          );
        })}
      </div>

      {/* Testemunhos */}
      {testimonies.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="scripture text-base mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            &quot;Eles o venceram por causa do sangue do Cordeiro e pela palavra do seu testemunho.&quot;
          </p>
          <p className="text-xs mt-2" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
            Apocalipse 12:11
          </p>
          <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Nenhum testemunho publicado ainda. Seja o primeiro.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {testimonies.map((t) => {
            const profile = t.profile as { full_name?: string; church_name?: string; city?: string } | null;
            return (
              <article key={t.id} className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
                      {profile?.full_name?.split(" ").slice(0, 2).map((n: string) => n[0]).join("") ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-cinzel)" }}>
                        {profile?.full_name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {profile?.church_name} · {profile?.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${TYPE_BADGE[t.type] ?? "badge-gold"}`}>
                      {TYPE_LABELS[t.type] ?? t.type}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-cinzel)" }}>
                      {formatDate(t.created_at, { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <h2 className="text-base mb-3" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>
                  {t.title}
                </h2>

                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {t.content}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Compartilhar testemunho */}
      <div className="border-t pt-8" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
        <h2 className="text-lg mb-1">Compartilhar Testemunho</h2>
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
          Seu testemunho será revisado antes de ser publicado.
        </p>
        <TestimonyForm />
      </div>
    </div>
  );
}
