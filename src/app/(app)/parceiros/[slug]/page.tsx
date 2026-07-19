import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { partners } from "@/features/parceiros/data/partners";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return partners.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);
  return { title: partner ? partner.name : "Parceiro" };
}

function IconPhone() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconWhatsapp() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.004c5.46 0 9.91-4.45 9.91-9.91C21.98 6.45 17.53 2 12.04 2zm5.76 14.11c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.16-4.94-4.35-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2.01.88 2.15.07.15.11.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.37-.23.63-.14.26.09 1.66.78 1.94.93.28.14.47.21.53.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = partners.find((partner) => partner.slug === slug);
  if (!p) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/parceiros"
        className="inline-flex items-center gap-1.5 text-xs hover:underline"
        style={{ color: "var(--text-subtle)" }}
      >
        <IconArrowLeft />
        Todos os parceiros
      </Link>

      <div className="card overflow-hidden">
        {/* Logo — clicável, leva ao site do parceiro */}
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-8"
          style={{ background: "#F7F5F1" }}
          aria-label={`Visitar site de ${p.name}`}
        >
          <Image src={p.logo} alt={p.name} width={220} height={224} className="w-40 h-auto" priority />
        </a>

        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
              {p.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}>
              {p.tagline}
            </p>
          </div>

          {/* Apresentação */}
          <div className="space-y-3">
            {p.summary.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Áreas de atuação */}
          <div className="flex flex-wrap gap-2">
            {p.areas.map((area) => (
              <span key={area} className="badge badge-gold">{area}</span>
            ))}
          </div>

          <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
            Visitar site
          </a>

          {/* Contatos */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
              Contato
            </p>

            <a href={p.contacts.whatsapp.url} target="_blank" rel="noopener noreferrer" className="btn-heal w-full" style={{ padding: "0.6rem 1rem" }}>
              <IconWhatsapp />
              {p.contacts.whatsapp.label}
            </a>

            <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <div className="flex items-start gap-2">
                <span style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0"><IconPhone /></span>
                <span>{p.contacts.phones.join(" · ")}</span>
              </div>
              {p.contacts.email && (
                <div className="flex items-start gap-2">
                  <span style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0"><IconMail /></span>
                  <a href={`mailto:${p.contacts.email}`} className="hover:underline">{p.contacts.email}</a>
                </div>
              )}
              {p.contacts.addresses.map((addr) => (
                <div key={addr.label} className="flex items-start gap-2">
                  <span style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0"><IconMapPin /></span>
                  <a href={addr.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <strong style={{ color: "var(--text)" }}>{addr.label}:</strong> {addr.line}
                  </a>
                </div>
              ))}
              <div className="flex items-start gap-2">
                <span style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0"><IconClock /></span>
                <span>{p.contacts.hours}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {p.contacts.social.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{ border: "1px solid var(--nav-border)", color: "var(--gold-label)" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
