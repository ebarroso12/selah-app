import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  async function handleSignOut() {
    "use server";
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const sb = await createServerClient();
    await sb.auth.signOut();
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }

  return (
    <div className="card p-8 glow-gold text-center">
      <div className="text-center mb-6">
        <p className="selah-wordmark mb-1">SELAH</p>
      </div>

      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5"
        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-lg mb-3" style={{ fontFamily: "var(--font-cinzel)", color: "#fbbf24" }}>
        Aguardando Aprovacao
      </h1>

      <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
        Seu cadastro foi recebido com sucesso.
      </p>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
        O administrador ira revisar suas informacoes e liberar seu acesso em breve.
        Voce recebera uma notificacao no email{" "}
        <strong style={{ color: "rgba(255,255,255,0.85)" }}>{user?.email}</strong>.
      </p>

      <div className="p-4 rounded-lg mb-6"
        style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)" }}>
        <p className="scripture text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          "Aguarda o Senhor; anima-te, e ele fortalecer-te-a o coracao;
          aguarda, pois, o Senhor."
        </p>
        <p className="mt-2 text-xs" style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
          Salmos 27:14
        </p>
      </div>

      <form action={handleSignOut}>
        <button type="submit" className="btn-ghost w-full text-sm">
          Sair da conta
        </button>
      </form>
    </div>
  );
}
