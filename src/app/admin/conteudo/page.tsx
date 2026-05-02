export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Conteúdo — Admin" };

async function approveTestimony(id: string) {
  "use server";
  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();
  await supabase.from("testimonies").update({ approved: true }).eq("id", id);
  revalidatePath("/admin/conteudo");
}

async function rejectTestimony(id: string) {
  "use server";
  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();
  await supabase.from("testimonies").delete().eq("id", id);
  revalidatePath("/admin/conteudo");
}

const TYPE_LABELS: Record<string, string> = {
  irmao: "Irmão", legendario: "Legendário", esposa_legendario: "Esposa Leg.",
};

export default async function ConteudoPage() {
  const supabase = await createClient();

  const [{ data: pendingTestimonies }, { data: devotionals }] = await Promise.all([
    supabase.from("testimonies")
      .select("*, profile:profiles(full_name, church_name)")
      .eq("approved", false)
      .order("created_at", { ascending: true }),
    supabase.from("devotionals")
      .select("id, date, title, bible_book, bible_chapter, bible_verse_start, generated_by_ai")
      .order("date", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl mb-1">Gerenciamento de Conteúdo</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Testemunhos pendentes e devocionais publicados
        </p>
      </div>

      {/* Testemunhos pendentes */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg">Testemunhos Pendentes</h2>
          {(pendingTestimonies?.length ?? 0) > 0 && (
            <span className="badge badge-pending">{pendingTestimonies?.length}</span>
          )}
        </div>

        {!pendingTestimonies || pendingTestimonies.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              Nenhum testemunho aguardando revisão.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(pendingTestimonies as { id: string; title: string; type: string; content: string; created_at: string; profile?: { full_name?: string; church_name?: string } }[]).map((t) => (
              <div key={t.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold" style={{ color: "#fff", fontFamily: "var(--font-cinzel)", fontSize: "0.9rem" }}>
                        {t.title}
                      </p>
                      <span className="badge badge-gold">{TYPE_LABELS[t.type] ?? t.type}</span>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {t.profile?.full_name} · {t.profile?.church_name} · {formatDate(t.created_at, { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={rejectTestimony.bind(null, t.id)}>
                      <button type="submit" className="btn-ghost text-xs px-3 py-1.5"
                        style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                        Remover
                      </button>
                    </form>
                    <form action={approveTestimony.bind(null, t.id)}>
                      <button type="submit" className="btn-primary text-xs px-3 py-1.5">
                        Publicar
                      </button>
                    </form>
                  </div>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {t.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Devocionais publicados */}
      <div>
        <h2 className="text-lg mb-4">Últimos Devocionais</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
                {["Data", "Título", "Passagem", "Origem"].map((h) => (
                  <th key={h} className="text-left px-4 py-3"
                    style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(devotionals ?? []).map((d: { id: string; date: string; title: string; bible_book: string; bible_chapter: string; bible_verse_start: string; generated_by_ai: boolean }, i: number, arr: { id: string }[]) => (
                <tr key={d.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td className="px-4 py-3">
                    <p style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", fontSize: "0.78rem" }}>
                      {new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem" }}>
                      {d.title}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                      {d.bible_book} {d.bible_chapter}:{d.bible_verse_start}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${d.generated_by_ai ? "badge-gold" : "badge-success"}`}
                      style={{ fontSize: "0.6rem" }}>
                      {d.generated_by_ai ? "IA" : "Manual"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!devotionals || devotionals.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>Nenhum devocional publicado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
