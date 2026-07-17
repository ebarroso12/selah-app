"use client";

import { useState } from "react";

const PIX_KEY = "61.401.825/0001-02";

export default function DoacaoPage() {
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto flex flex-col items-center justify-start pt-10 space-y-8">
      {/* Título */}
      <div className="text-center space-y-2">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Apoie o Ministério
        </p>
        <h1
          className="text-2xl"
          style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}
        >
          Contribua com o SELAH
        </h1>
      </div>

      {/* Mensagem */}
      <div
        className="w-full rounded-2xl p-6 text-center space-y-3"
        style={{
          background: "rgba(201,162,39,0.05)",
          border: "1px solid rgba(201,162,39,0.18)",
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          O aplicativo SELAH foi desenvolvido de forma autônoma, com dedicação e amor ao
          ministério — <strong style={{ color: "#c9a227" }}>sem cobrar nada</strong> dos
          usuários. Ele é e sempre será gratuito para toda a comunidade da Casa de Oração.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Se o SELAH tem abençoado sua vida e você quiser contribuir para manter os servidores,
          a inteligência artificial e as atualizações em funcionamento, qualquer doação é
          recebida com gratidão e oração.
        </p>
        <p className="text-xs italic" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          "Cada um dê conforme decidiu em seu coração, não com tristeza nem por obrigação,
          pois Deus ama quem dá com alegria." — 2 Coríntios 9:7
        </p>
      </div>

      {/* QR Code PIX */}
      <div
        className="w-full rounded-2xl p-6 flex flex-col items-center space-y-5"
        style={{
          background: "var(--bg-2)",
          border: "1px solid rgba(201,162,39,0.2)",
        }}
      >
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Doação via PIX
        </p>

        {/* QR Code gerado inline com SVG de padrão PIX */}
        <div
          className="rounded-xl p-3 flex items-center justify-center"
          style={{ background: "#ffffff", width: 200, height: 200 }}
        >
          {/* QR Code visual usando a chave PIX — renderizado via API de QR Code público */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`00020126360014BR.GOV.BCB.PIX011461.401.825/0001-025204000053039865802BR5913SELAH App6006Franca62070503***6304`)}`}
            alt="QR Code PIX para doação"
            width={174}
            height={174}
            style={{ borderRadius: 8 }}
          />
        </div>

        <p className="text-xs text-center" style={{ color: "var(--text-subtle)" }}>
          Escaneie o QR Code acima com o app do seu banco
        </p>

        {/* Chave PIX */}
        <div className="w-full space-y-2">
          <p className="text-xs text-center" style={{ color: "var(--text-subtle)" }}>
            ou copie a chave CNPJ abaixo:
          </p>

          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(201,162,39,0.08)",
              border: "1px solid rgba(201,162,39,0.25)",
            }}
          >
            <span
              className="flex-1 text-center font-mono text-sm"
              style={{ color: "#c9a227", letterSpacing: "0.05em" }}
            >
              {PIX_KEY}
            </span>
            <button
              onClick={copyKey}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: copied ? "rgba(52,211,153,0.15)" : "rgba(201,162,39,0.15)",
                border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(201,162,39,0.4)"}`,
                color: copied ? "#34d399" : "#c9a227",
              }}
            >
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      </div>

      {/* Agradecimento */}
      <div className="text-center space-y-2 pb-8">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Que Deus abençoe cada um que contribui. 🙏
        </p>
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          Casa de Oração de Franca · Ministério Legendários Brasil
        </p>
      </div>
    </div>
  );
}
