import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Legendários",
  description: "Movimento Legendários — Homens inquebrantáveis com histórias dignas a serem contadas.",
};

export default function LegendariosPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(230,80,20,0.18) 0%, rgba(6,10,20,0.98) 50%, rgba(230,80,20,0.10) 100%)",
          borderBottom: "1px solid rgba(230,80,20,0.3)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Logo oficial dos Legendários */}
            <div
              className="rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.96)",
                padding: "16px 24px",
                boxShadow: "0 0 40px rgba(230,80,20,0.35), 0 4px 24px rgba(0,0,0,0.5)",
                border: "2px solid rgba(230,80,20,0.5)",
              }}
            >
              <Image
                src="/legendarios-logo.png"
                alt="Logo Legendários"
                width={220}
                height={180}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            <div>
              <p
                className="text-base md:text-lg max-w-2xl mx-auto"
                style={{ color: "rgba(245,242,235,0.7)", fontFamily: "var(--font-lora)", fontStyle: "italic" }}
              >
                "Homens inquebrantáveis com histórias dignas a serem contadas."
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <span
                className="badge"
                style={{
                  background: "rgba(230,80,20,0.18)",
                  border: "1px solid rgba(230,80,20,0.45)",
                  color: "#ff6b35",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                }}
              >
                +150 mil membros
              </span>
              <span
                className="badge"
                style={{
                  background: "rgba(230,80,20,0.18)",
                  border: "1px solid rgba(230,80,20,0.45)",
                  color: "#ff6b35",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                }}
              >
                +20 países
              </span>
              <span
                className="badge"
                style={{
                  background: "rgba(230,80,20,0.18)",
                  border: "1px solid rgba(230,80,20,0.45)",
                  color: "#ff6b35",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                }}
              >
                +150 sedes
              </span>
              <span
                className="badge"
                style={{
                  background: "rgba(230,80,20,0.18)",
                  border: "1px solid rgba(230,80,20,0.45)",
                  color: "#ff6b35",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                }}
              >
                +1.300 TOPs realizados
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Manifesto */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: "rgba(230,80,20,0.08)",
            border: "1px solid rgba(230,80,20,0.3)",
          }}
        >
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "#ff6b35", fontFamily: "var(--font-cinzel)" }}
          >
            Manifesto
          </p>
          <blockquote
            className="scripture text-base leading-relaxed"
            style={{ borderLeft: "3px solid #e65014", paddingLeft: "1.25rem" }}
          >
            "Faço parte dos Legendários e meu compromisso é fazer história... Vou seguir em
            frente e esperar pelo legendário número um: Jesus Cristo."
          </blockquote>
        </div>

        {/* O que é */}
        <div className="card p-6">
          <h2
            className="text-xl mb-4"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
          >
            O Movimento
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(245,242,235,0.8)" }}>
            O Movimento Legendários é uma iniciativa global de transformação masculina, com foco
            espiritual cristão. Nascido dentro da Casa de Oração de Franca/SP, o movimento se
            expandiu para mais de 20 países, reunindo homens que desejam viver com propósito,
            coragem e fé inabalável.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(245,242,235,0.8)" }}>
            Mais do que um grupo, é um chamado: ser homem de Deus, marido presente, pai comprometido,
            líder íntegro — um homem com uma história digna de ser contada para as próximas gerações.
          </p>
        </div>

        {/* Eventos */}
        <div>
          <h2
            className="text-xl mb-4"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
          >
            Eventos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RPM */}
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(230,80,20,0.08)",
                border: "1px solid rgba(230,80,20,0.3)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(230,80,20,0.15)", border: "1px solid rgba(230,80,20,0.4)" }}
                >
                  <span style={{ fontSize: "1.2rem" }}>🔥</span>
                </div>
                <div>
                  <h3
                    className="text-base"
                    style={{ color: "#ff6b35", fontFamily: "var(--font-cinzel)" }}
                  >
                    RPM
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Toda 1ª segunda-feira do mês
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(245,242,235,0.75)" }}>
                Reunião mensal de homens para adoração, Palavra e comunhão. Um encontro que
                fortalece a identidade masculina em Cristo e alimenta a chama do propósito.
              </p>
            </div>

            {/* TOPs */}
            <div
              className="p-5 rounded-xl"
              style={{
                background: "rgba(230,80,20,0.08)",
                border: "1px solid rgba(230,80,20,0.3)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(230,80,20,0.15)", border: "1px solid rgba(230,80,20,0.4)" }}
                >
                  <span style={{ fontSize: "1.2rem" }}>⛺</span>
                </div>
                <div>
                  <h3
                    className="text-base"
                    style={{ color: "#ff6b35", fontFamily: "var(--font-cinzel)" }}
                  >
                    TOPs
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Track Outdoor de Potencial
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(245,242,235,0.75)" }}>
                Retiros imersivos de 4 dias para homens. Uma experiência transformadora na
                natureza, onde fé, desafio físico e comunidade se unem para revelar o potencial
                que Deus colocou em cada homem.
              </p>
            </div>
          </div>
        </div>

        {/* Pilares */}
        <div>
          <h2
            className="text-xl mb-4"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
          >
            Pilares do Movimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "✝️",
                title: "Fé Inabalável",
                desc: "Jesus Cristo como fundamento de toda identidade e propósito masculino.",
                color: "var(--gold)",
                bg: "var(--gold-bg)",
                border: "rgba(201,168,76,0.3)",
              },
              {
                icon: "🛡️",
                title: "Caráter Forjado",
                desc: "Homens que não quebram sob pressão porque foram moldados pela Palavra.",
                color: "#ff6b35",
                bg: "rgba(230,80,20,0.08)",
                border: "rgba(230,80,20,0.3)",
              },
              {
                icon: "🌱",
                title: "Legado Vivo",
                desc: "Histórias que inspiram filhos, famílias e gerações futuras.",
                color: "var(--heal-light)",
                bg: "var(--heal-bg)",
                border: "var(--heal-border)",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="p-5 rounded-xl"
                style={{ background: p.bg, border: `1px solid ${p.border}` }}
              >
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: p.color, fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}
                >
                  {p.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,235,0.7)" }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Versículo */}
        <div
          className="p-6 rounded-xl text-center"
          style={{
            background: "linear-gradient(135deg, rgba(230,80,20,0.10) 0%, rgba(201,168,76,0.08) 100%)",
            border: "1px solid rgba(230,80,20,0.25)",
          }}
        >
          <p
            className="scripture text-base leading-relaxed mb-2"
          >
            "Sede fortes e corajosos. Não temais, nem vos atemorizeis diante deles;
            porque o Senhor teu Deus é o que vai contigo; não te deixará, nem te desamparará."
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}
          >
            Deuteronômio 31:6
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pb-4">
          <a
            href="https://legendariosbr.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #e65014 0%, #ff6b35 100%)",
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.08em",
              padding: "12px 28px",
              borderRadius: "8px",
              fontWeight: "700",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Conhecer o Movimento
          </a>
          <Link href="/comunidade" className="btn-outline">
            Ver Comunidade SELAH
          </Link>
        </div>
      </div>
    </div>
  );
}
