"use client";

import { useSignOut } from "../hooks/useSignOut";
import { SelahLogo } from "@/shared/components/brand/SelahLogo";

interface PendingApprovalCardProps {
  email?: string | null;
}

export function PendingApprovalCard({ email }: PendingApprovalCardProps) {
  const { logout, loading } = useSignOut();

  return (
    <div className="card p-8 glow-gold text-center">
      <div className="text-center mb-6">
        <SelahLogo size={56} className="mx-auto mb-3" />
        <p className="selah-wordmark mb-1">SELAH</p>
      </div>

      <div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5"
        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-lg mb-3" style={{ fontFamily: "var(--font-cinzel)", color: "#fbbf24" }}>
        Aguardando Aprovação
      </h1>

      <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>
        Seu cadastro foi recebido com sucesso.
      </p>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
        O administrador irá revisar suas informações e liberar seu acesso em breve.
        {email && (
          <>
            {" "}Você receberá uma notificação no email{" "}
            <strong style={{ color: "var(--text)" }}>{email}</strong>.
          </>
        )}
      </p>

      <div
        className="p-4 rounded-lg mb-6"
        style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)" }}
      >
        <p className="scripture text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          &quot;Aguarda o Senhor; anima-te, e ele fortalecer-te-á o coração;
          aguarda, pois, o Senhor.&quot;
        </p>
        <p
          className="mt-2 text-xs"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}
        >
          Salmos 27:14
        </p>
      </div>

      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="btn-ghost w-full text-sm"
      >
        {loading ? "Saindo..." : "Sair da conta"}
      </button>
    </div>
  );
}
