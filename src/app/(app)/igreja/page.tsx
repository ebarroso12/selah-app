export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Igreja — Casa de Oração Franca" };

const pastores = [
  {
    nome: "Ap. Marcos Arantes",
    titulo: "Apóstolo Sênior & Co-fundador",
    instagram: "apmarcosarantes",
    foto: "/pastores/marcos-arantes.jpg",
    bio: "Co-fundador da Casa de Oração Franca ao lado de sua esposa, a Apóstola Wânia Arantes. Engenheiro civil aposentado, recebeu o chamado profético para plantar a Casa de Oração em 1999, quando se mudou para Franca-SP. Lidera a igreja com paternidade espiritual, visão apostólica e amor pela família.",
  },
  {
    nome: "Ap. Wânia Arantes",
    titulo: "Apóstola Sênior & Co-fundadora",
    instagram: "apwaniaarantes",
    foto: "/pastores/wania-arantes.jpg",
    bio: "Co-fundadora e Apóstola Sênior da Casa de Oração Franca. Radialista, apresentadora de TV, compositora e escritora (livro: \"Servir a maior linguagem do Amor\"). Fundou o movimento Impacto Rosa e lidera um dos maiores ministérios proféticos do interior de São Paulo.",
  },
  {
    nome: "Pr. Gustavo Arantes",
    titulo: "Pastor",
    instagram: "gustavoarantes_",
    foto: "/pastores/gustavo-arantes.jpg",
    bio: "Filho dos Apóstolos Marcos e Wânia Arantes, cresceu dentro do ministério e hoje serve como pastor na Casa de Oração Franca. Apaixonado por discipulado, jovens e pelo avivamento, Gustavo é referência de liderança jovem e comprometida com o Reino de Deus.",
  },
  {
    nome: "Pr. Rafael Melo",
    titulo: "Pastor",
    instagram: "pastorrafaelmelo",
    foto: "/pastores/rafael-melo.jpg",
    bio: "Pastor na Casa de Oração Franca, Rafael Melo é reconhecido por seu ministério de ensino bíblico profundo e acessível. Apaixonado pela Palavra de Deus e pela vida no Espírito Santo, serve com excelência na formação espiritual dos membros da Casa.",
  },
];

export default function IgrejaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      {/* Header com logo */}
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "2px solid rgba(201,168,76,0.3)",
              boxShadow: "0 0 32px rgba(201,168,76,0.12)",
            }}
          >
            <Image
              src="/pastores/casa-de-oracao-logo.webp"
              alt="Casa de Oração"
              width={112}
              height={112}
              className="w-full h-full object-contain p-2"
            />
          </div>
        </div>

        <div>
          <h1
            className="text-3xl tracking-widest uppercase"
            style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}
          >
            Casa de Oração
          </h1>
          <p
            className="text-sm mt-1 tracking-widest uppercase"
            style={{ color: "rgba(201,168,76,0.6)", fontFamily: "var(--font-cinzel)" }}
          >
            Franca — SP
          </p>
        </div>

        <p
          className="text-sm leading-relaxed max-w-md mx-auto"
          style={{ color: "rgba(245,242,235,0.6)" }}
        >
          Centro Apostólico e Profético de Cura e Paternidade. Uma família para você pertencer.
        </p>

        {/* Badges de info */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: "Fundada em 2015" },
            { label: "+2.000 membros" },
            { label: "+30 ministérios" },
          ].map((b) => (
            <span
              key={b.label}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "rgba(201,168,76,0.8)",
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.06em",
              }}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Horários */}
        <div
          className="card p-4 text-sm space-y-1"
          style={{ borderColor: "rgba(201,168,76,0.15)" }}
        >
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "rgba(201,168,76,0.55)", fontFamily: "var(--font-cinzel)" }}
          >
            Cultos
          </p>
          <div className="flex justify-between" style={{ color: "rgba(245,242,235,0.75)" }}>
            <span>Quarta-feira</span>
            <span style={{ color: "#c9a227" }}>20h00</span>
          </div>
          <div className="flex justify-between" style={{ color: "rgba(245,242,235,0.75)" }}>
            <span>Domingo</span>
            <span style={{ color: "#c9a227" }}>10h00 e 18h00</span>
          </div>
          <p className="text-xs mt-2" style={{ color: "rgba(245,242,235,0.4)" }}>
            Av. Alagoas, 1163 — Jardim Paulista, Franca-SP
          </p>
        </div>

        {/* Links sociais */}
        <div className="flex justify-center gap-3">
          <Link
            href="https://www.instagram.com/casadeoracao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "rgba(201,168,76,0.85)",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.05em",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @casadeoracao
          </Link>
          <Link
            href="https://casadeoracao.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "rgba(201,168,76,0.85)",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.05em",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
            </svg>
            Site oficial
          </Link>
        </div>
      </div>

      {/* Versículo */}
      <div
        className="card p-5"
        style={{ borderColor: "rgba(201,168,76,0.15)", borderLeft: "3px solid rgba(201,168,76,0.4)" }}
      >
        <p className="text-sm italic leading-relaxed" style={{ color: "rgba(245,242,235,0.7)" }}>
          "Também os levarei ao meu santo monte, e os alegrarei na minha casa de oração; os seus holocaustos e os seus sacrifícios serão aceitos no meu altar; porque a minha casa será chamada casa de oração para todos os povos."
        </p>
        <p className="text-xs mt-2" style={{ color: "rgba(201,168,76,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Isaías 56:7
        </p>
      </div>

      {/* Pastores */}
      <div>
        <p
          className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "rgba(201,168,76,0.55)", fontFamily: "var(--font-cinzel)" }}
        >
          Nossa Liderança
        </p>
        <div className="space-y-4">
          {pastores.map((p) => (
            <div
              key={p.nome}
              className="card p-5 flex gap-4"
              style={{ borderColor: "rgba(201,168,76,0.12)" }}
            >
              {/* Foto */}
              <div className="shrink-0">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden"
                  style={{
                    border: "2px solid rgba(201,168,76,0.3)",
                    background: "rgba(201,168,76,0.08)",
                  }}
                >
                  <Image
                    src={p.foto}
                    alt={p.nome}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm"
                  style={{ color: "rgba(245,242,235,0.92)", fontFamily: "var(--font-cinzel)" }}
                >
                  {p.nome}
                </p>
                <p
                  className="text-xs mb-2"
                  style={{ color: "rgba(201,168,76,0.65)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.04em" }}
                >
                  {p.titulo}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,235,0.55)" }}>
                  {p.bio}
                </p>
                <Link
                  href={`https://www.instagram.com/${p.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs transition-opacity hover:opacity-80"
                  style={{ color: "rgba(201,168,76,0.7)", fontFamily: "var(--font-cinzel)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @{p.instagram}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marco Martins Arantes */}
      <div
        className="card p-5"
        style={{ borderColor: "rgba(201,168,76,0.15)" }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-3"
          style={{ color: "rgba(201,168,76,0.55)", fontFamily: "var(--font-cinzel)" }}
        >
          Também na Liderança
        </p>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(201,168,76,0.1)",
              border: "1.5px solid rgba(201,168,76,0.25)",
              color: "#c9a227",
              fontFamily: "var(--font-cinzel)",
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            MA
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "rgba(245,242,235,0.9)", fontFamily: "var(--font-cinzel)" }}>
              Pr. Marco Martins Arantes
            </p>
            <p className="text-xs" style={{ color: "rgba(201,168,76,0.6)", fontFamily: "var(--font-cinzel)" }}>
              Pastor — Casa de Oração Franca
            </p>
          </div>
        </div>
      </div>

      {/* Visão da Igreja */}
      <div className="card p-5 space-y-3" style={{ borderColor: "rgba(201,168,76,0.12)" }}>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(201,168,76,0.55)", fontFamily: "var(--font-cinzel)" }}
        >
          Nossa Visão
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,242,235,0.65)" }}>
          Fazer de Franca a "Cidade da Oração" — uma comunidade profética onde cada membro entende que pode ser a boca de Deus na Terra. Uma igreja avivada, que evangeliza, influencia e levanta famílias inteiras para Jesus Cristo.
        </p>
      </div>

    </div>
  );
}
