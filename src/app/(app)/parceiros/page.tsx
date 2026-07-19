import Image from "next/image";
import Link from "next/link";
import { partners } from "@/features/parceiros/data/partners";

export const dynamic = "force-dynamic";
export const metadata = { title: "Parceiros" };

export default function ParceirosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Rede de Apoio
        </p>
        <h1 className="text-2xl" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
          Parceiros
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Profissionais e negócios de confiança que caminham ao lado da comunidade SELAH.
        </p>
      </div>

      {/* Grade de miniaturas — cada uma abre a subpágina do parceiro */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {partners.map((p) => (
          <Link
            key={p.slug}
            href={`/parceiros/${p.slug}`}
            className="card overflow-hidden flex flex-col items-center text-center transition-transform active:scale-95"
          >
            <div className="w-full flex items-center justify-center p-5" style={{ background: "#F7F5F1" }}>
              <Image src={p.logo} alt={p.name} width={120} height={120} className="w-20 h-20 object-contain" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                {p.name}
              </p>
              <p className="text-[0.65rem] mt-1" style={{ color: "var(--gold-label)" }}>
                {p.tagline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
