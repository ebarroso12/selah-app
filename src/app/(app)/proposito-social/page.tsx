import Image from "next/image";
import { causes } from "@/features/proposito-social/data/causes";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Propósito Social",
  description: "Causas sociais que o SELAH caminha ao lado — começando pelo Instituto Princesa Rivânia.",
};

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
function IconWhatsapp() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.004c5.46 0 9.91-4.45 9.91-9.91C21.98 6.45 17.53 2 12.04 2zm5.76 14.11c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.16-4.94-4.35-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2.01.88 2.15.07.15.11.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.37-.23.63-.14.26.09 1.66.78 1.94.93.28.14.47.21.53.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}
function IconHeartHands() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

export default function PropositoSocialPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-xs tracking-widest uppercase" style={{ color: "var(--violet-light)", fontFamily: "var(--font-cinzel)" }}>
          Fé em Ação
        </p>
        <h1 className="text-2xl" style={{ color: "var(--violet-light)", fontFamily: "var(--font-cinzel)" }}>
          Propósito Social
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Causas urgentes e reais que o SELAH escolhe caminhar ao lado — porque fé sem obra é fé incompleta.
        </p>
      </div>

      {causes.map((c) => (
        <div key={c.slug} className="card overflow-hidden" style={{ borderColor: "var(--violet-border)" }}>
          {/* Logo — clicável, leva ao site da causa */}
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-8"
            style={{ background: c.logoBg }}
            aria-label={`Visitar site de ${c.name}`}
          >
            <Image src={c.logo} alt={c.name} width={280} height={140} className="w-56 h-auto" priority />
          </a>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-cinzel)" }}>
                {c.name}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--violet-light)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
                {c.tagline}
              </p>
            </div>

            {/* Hook — chamada emocional principal */}
            <blockquote
              className="scripture text-base leading-relaxed p-5 rounded-xl"
              style={{ background: "var(--violet-bg)", borderLeft: "3px solid var(--violet)" }}
            >
              {c.hook}
            </blockquote>

            {/* Nota especial — Dr. Edson Barroso */}
            {c.specialNote && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "var(--gold-bg)", border: "1px solid var(--gold-glow)" }}
              >
                <span style={{ color: "var(--gold)" }} className="shrink-0 mt-0.5"><IconHeartHands /></span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{c.specialNote}</p>
              </div>
            )}

            {/* A história */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "var(--violet-light)", fontFamily: "var(--font-cinzel)" }}>
                A História
              </h3>
              <div className="space-y-3">
                {c.founderStory.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p}</p>
                ))}
              </div>
            </div>

            {/* A missão */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "var(--violet-light)", fontFamily: "var(--font-cinzel)" }}>
                A Missão
              </h3>
              <div className="space-y-3">
                {c.mission.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {c.services.map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--violet-bg)", color: "var(--violet-light)", border: "1px solid var(--violet-border)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Urgência */}
            <div className="p-5 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#F87171", fontFamily: "var(--font-cinzel)" }}>
                Por que isso não pode esperar
              </h3>
              <div className="space-y-3">
                {c.urgency.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{p}</p>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {c.contacts.actions.map((a) => (
                <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="btn-wine flex-1 justify-center">
                  {a.label}
                </a>
              ))}
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 justify-center">
                Visitar site
              </a>
            </div>

            {/* Contatos */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--violet-light)", fontFamily: "var(--font-cinzel)" }}>
                Contato
              </p>

              <a href={c.contacts.whatsapp.url} target="_blank" rel="noopener noreferrer" className="btn-heal w-full" style={{ padding: "0.6rem 1rem" }}>
                <IconWhatsapp />
                {c.contacts.whatsapp.label}
              </a>

              <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <div className="flex items-start gap-2">
                  <span style={{ color: "var(--violet-light)" }} className="mt-0.5 shrink-0"><IconPhone /></span>
                  <span>{c.contacts.phones.join(" · ")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span style={{ color: "var(--violet-light)" }} className="mt-0.5 shrink-0"><IconMail /></span>
                  <a href={`mailto:${c.contacts.email}`} className="hover:underline">{c.contacts.email}</a>
                </div>
                {c.contacts.address && (
                  <div className="flex items-start gap-2">
                    <span style={{ color: "var(--violet-light)" }} className="mt-0.5 shrink-0"><IconMapPin /></span>
                    <a href={c.contacts.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {c.contacts.address.line}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {c.contacts.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{ border: "1px solid var(--violet-border)", color: "var(--violet-light)" }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
