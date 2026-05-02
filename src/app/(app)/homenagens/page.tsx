"use client";
import Link from "next/link";
import Image from "next/image";

const homenagens = [
  {
    id: 1,
    homenageante: {
      nome: "Dr. Edson Barroso",
      instagram: "dredsonbarroso",
      legendario: true,
      numero: 203460,
    },
    homenageada: {
      nome: "Lisley Barroso",
      parentesco: "Esposa",
      instagram: "lisleybarroso",
      legendario: false,
    },
    fotoCapa: "/homenagem-lisley-1.jpg",
    fotos: ["/homenagem-lisley-1.jpg", "/homenagem-lisley-2.jpg"],
    texto: `Há famílias que nascem…
e há famílias que são construídas com fé, renúncia e permanência.

Esta é uma história assim.

Lisley Barroso é dessas mulheres que não se definem apenas por palavras, mas por atitudes silenciosas que sustentam um lar inteiro.

Mulher guerreira, amorosa, companheira e amiga. Daquelas que não perguntam "vai dar certo?", mas caminham mesmo sem todas as respostas.

Nos momentos mais difíceis, ela permaneceu. Quando o cenário era incerto, ela não recuou. Nunca se importou com onde, nem com como, nem com quando — apenas com quem estava ao seu lado: sua família.

E é nesse lugar que ela vive… não para si, mas para os seus.

Maria Clara, com sua doçura que ilumina o ambiente, e João Vitor, com sua força que cresce e aponta para o futuro, carregam em si o reflexo de um lar construído com amor verdadeiro.

Há um tempo em que se pensa que amar é dar a vida por alguém. Mas existe um entendimento mais profundo: amar é viver todos os dias ao lado, com presença, entrega e propósito.

E essa família escolheu algo ainda maior: decidiu servir a Deus juntos. Não apenas em palavras, mas em atitudes, em decisões, em direção de vida.

Porque compreenderam que tudo o que têm vem dEle.

O lar, a união, os filhos, o amor — tudo sustentado pela graça e pela fidelidade de Deus.

Lisley não é apenas uma esposa. É alicerce. É presença firme. É resposta de oração em forma de vida diária.

Uma mulher que edifica, que cuida, que sustenta, e que caminha lado a lado na transformação de um homem, de uma família, de um propósito.

Esta não é apenas uma homenagem. É o reconhecimento de uma história viva, que continua sendo escrita todos os dias sob a direção de Deus.`,
    data: "02 de maio de 2026",
  },
];

export default function HomenagensPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h1 className="text-2xl tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            Homenagens
          </h1>
        </div>
        <p className="text-sm" style={{ color: "rgba(245,242,235,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Famílias dos Legendários
        </p>
        <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: "rgba(245,242,235,0.45)" }}>
          Um espaço para honrar as famílias que sustentam, apoiam e caminham ao lado dos Legendários.
        </p>
      </div>

      {/* Botão nova homenagem */}
      <div className="flex justify-center">
        <Link href="/homenagens/nova">
          <button
            className="px-6 py-2 rounded-full text-xs tracking-widest uppercase font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #c9a227 0%, #f0c040 100%)",
              color: "#0a0a0a",
              fontFamily: "var(--font-cinzel)",
              boxShadow: "0 0 18px rgba(201,162,39,0.35)",
            }}
          >
            + Nova Homenagem
          </button>
        </Link>
      </div>

      {/* Lista de homenagens */}
      {homenagens.map((h) => (
        <div
          key={h.id}
          className="card overflow-hidden"
          style={{ border: "1px solid rgba(201,162,39,0.25)", background: "linear-gradient(160deg, rgba(30,20,5,0.85) 0%, rgba(10,10,10,0.95) 100%)" }}
        >
          {/* Foto de capa */}
          <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: 320, overflow: "hidden" }}>
            <img
              src={h.fotoCapa}
              alt={h.homenageada.nome}
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", background: "#0a0a0a" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.92) 100%)" }} />
            {/* Nome da homenageada sobre a foto */}
            <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
              <p className="text-xl font-bold" style={{ color: "#f0c040", fontFamily: "var(--font-cinzel)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                {h.homenageada.nome}
              </p>
              <p className="text-xs" style={{ color: "rgba(245,242,235,0.7)", fontFamily: "var(--font-cinzel)" }}>
                {h.homenageada.parentesco}
                {h.homenageada.instagram && (
                  <span style={{ color: "rgba(201,162,39,0.8)", marginLeft: 8 }}>@{h.homenageada.instagram}</span>
                )}
              </p>
            </div>
          </div>

          {/* Corpo */}
          <div className="p-5 space-y-4">
            {/* Quem homenageia */}
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(201,162,39,0.15)" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span className="text-xs" style={{ color: "rgba(245,242,235,0.5)" }}>Homenagem de</span>
              <span className="text-xs font-semibold" style={{ color: "#c9a227" }}>{h.homenageante.nome}</span>
              {h.homenageante.instagram && (
                <a
                  href={`https://instagram.com/${h.homenageante.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs ml-1"
                  style={{ color: "rgba(201,162,39,0.65)" }}
                >
                  @{h.homenageante.instagram}
                </a>
              )}
              {h.homenageante.legendario && h.homenageante.numero && (
                <span className="text-xs ml-auto px-2 py-0.5 rounded-full" style={{ background: "rgba(201,162,39,0.15)", color: "#f0c040", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
                  Legendário #{h.homenageante.numero}
                </span>
              )}
            </div>

            {/* Texto da homenagem */}
            <div
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{ color: "rgba(245,242,235,0.8)", fontStyle: "italic", lineHeight: 1.8 }}
            >
              {h.texto}
            </div>

            {/* Instagram da homenageada */}
            {h.homenageada.instagram && (
              <div className="pt-2">
                <a
                  href={`https://instagram.com/${h.homenageada.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{ background: "rgba(201,162,39,0.12)", color: "#f0c040", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  @{h.homenageada.instagram}
                </a>
              </div>
            )}

            {/* Segunda foto (família) */}
            {h.fotos.length > 1 && (
              <div className="pt-2">
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
                  <img
                    src={h.fotos[1]}
                    alt="Família"
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", background: "#0a0a0a" }}
                  />
                </div>
              </div>
            )}

            {/* Data */}
            <p className="text-xs text-right" style={{ color: "rgba(245,242,235,0.3)", fontFamily: "var(--font-cinzel)" }}>
              {h.data}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
