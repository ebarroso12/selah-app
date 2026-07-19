export const dynamic = "force-dynamic";
import Link from "next/link";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { HomenagemList } from "@/features/homenagens";
import type { Homenagem } from "@/features/homenagens";

export const metadata = { title: "Homenagens" };

async function getHomenagens(): Promise<Homenagem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("homenagens")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as Homenagem[];
}

export default async function HomenagensPage() {
  const homenagens = await getHomenagens();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h1 className="text-2xl tracking-widest uppercase" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
            Homenagens
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)" }}>
          Famílias dos Legendários
        </p>
        <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: "var(--text-subtle)" }}>
          Um espaço para honrar as famílias que sustentam, apoiam e caminham ao lado dos Legendários.
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          href="/homenagens/nova"
          className="px-6 py-2 rounded-full text-xs tracking-widest uppercase font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            color: "#0a0a0a",
            fontFamily: "var(--font-cinzel)",
            boxShadow: "0 0 18px rgba(184,115,51,0.35)",
          }}
        >
          + Nova Homenagem
        </Link>
      </div>

      <HomenagemList homenagens={homenagens} />
    </div>
  );
}
