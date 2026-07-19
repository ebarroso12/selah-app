"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { SelahLogo } from "@/shared/components/brand/SelahLogo";
import { ClockWeather } from "@/shared/components/brand/ClockWeather";

export function BemVindoClient() {
  const router = useRouter();

  function handleEnter() {
    localStorage.setItem("selah_welcomed", "1");
    router.replace("/home");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Topo decorativo ─────────────────────────────────────────────── */}
      <div
        className="w-full h-1 shrink-0"
        style={{ background: "linear-gradient(90deg, var(--wine) 0%, var(--gold) 50%, var(--heal) 100%)" }}
      />

      <div className="flex-1 flex flex-col items-center justify-start px-5 py-10 max-w-2xl mx-auto w-full">

        {/* ── Wordmark ────────────────────────────────────────────────────── */}
        <SelahLogo size={84} className="mb-4" />
        <p
          className="selah-wordmark mb-1 text-center"
          style={{ fontSize: "2rem", letterSpacing: "0.35em" }}
        >
          SELAH
        </p>
        <p
          className="text-xs tracking-widest uppercase mb-2 text-center"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
        >
          Pause · Ore · Cresça
        </p>
        <ClockWeather className="mb-8" />

        {/* ── Foto ────────────────────────────────────────────────────────── */}
        <div
          className="relative mb-8"
          style={{
            borderRadius: "1.25rem",
            overflow: "hidden",
            border: "1px solid rgba(201,168,76,0.3)",
            boxShadow: "0 8px 40px rgba(123,31,58,0.18), 0 2px 12px rgba(0,0,0,0.12)",
            maxWidth: 380,
            width: "100%",
          }}
        >
          <Image
            src="/minhabio.jpg"
            alt="Dr. Edson Barroso"
            width={760}
            height={960}
            className="w-full h-auto block"
            priority
            style={{ objectFit: "cover" }}
          />
          {/* Gradiente suave na base da foto */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{ background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)" }}
          />
        </div>

        {/* ── Título da dedicatória ────────────────────────────────────────── */}
        <div className="text-center mb-6 space-y-2">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
          >
            Uma dedicatória
          </p>
          <h1
            className="text-2xl leading-snug"
            style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" }}
          >
            Dr. Edson Barroso
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-lora)", fontStyle: "italic" }}
          >
            O Médico que Descobriu o que a Medicina Não Ensina
          </p>
        </div>

        {/* ── Texto da dedicatória ─────────────────────────────────────────── */}
        <div
          className="card p-6 space-y-5 mb-8 w-full"
          style={{ borderColor: "rgba(201,168,76,0.2)" }}
        >
          {/* Bloco 1 */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-lora)", lineHeight: 1.95 }}
          >
            Há uma pergunta que todo médico aprende a responder com diagnósticos,
            exames e receituários. Mas existe uma outra, aquela que os pacientes
            trazem nos olhos antes mesmo de falar, que nenhuma faculdade do mundo
            ensina a responder.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-lora)", lineHeight: 1.95 }}
          >
            O Dr. Edson Barroso aprendeu essa segunda linguagem da forma mais profunda
            que existe: <strong style={{ color: "var(--gold)" }}>vivendo-a</strong>.
            Pós-graduado em Saúde Mental e Medicina Integrativa, especialista em TDAH,
            TEA, Saúde Mental Infantil e uso medicinal de Canabidiol, ele acumulou anos
            de formação técnica impecável. Mas foi ao lado de homens de joelhos, na
            oração, na Palavra e na irmandade, que entendeu o que{" "}
            <strong style={{ color: "var(--gold)" }}>completa</strong> a cura.
          </p>

          <hr style={{ borderColor: "rgba(201,168,76,0.15)" }} />

          {/* Bloco 2 — Legendários */}
          <div
            className="border-l-2 pl-4 py-1"
            style={{ borderColor: "rgba(201,168,76,0.4)" }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-lora)", fontStyle: "italic", lineHeight: 1.9 }}
            >
              Membro ativo da{" "}
              <span style={{ color: "var(--gold-label)" }}>Casa de Oração de Franca/SP</span>{" "}
              e <span style={{ color: "var(--gold-label)" }}>Legendário</span>, integrante
              de um movimento de mais de 150 mil homens no Brasil e no mundo, ele
              descobriu que o homem íntegro não separa o que crê do que vive.
            </p>
            <p
              className="text-sm leading-relaxed mt-3"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-lora)", fontStyle: "italic", lineHeight: 1.9 }}
            >
              O pai presente, o marido fiel, o profissional ético e o cristão genuíno
              não são personas diferentes. São{" "}
              <strong style={{ color: "var(--text)" }}>um só homem</strong>, construído
              com escolha, com dor e com propósito. Dia a dia.
            </p>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-lora)", lineHeight: 1.95 }}
          >
            Foi nesse chão, entre consultas e cultos, entre laudos e orações, entre
            ciência e revelação, que nasceu o <strong style={{ color: "var(--gold)" }}>SELAH</strong>.
          </p>

          <hr style={{ borderColor: "rgba(201,168,76,0.15)" }} />

          {/* Bloco 3 — Visão */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-lora)", lineHeight: 1.95 }}
          >
            Não é apenas um aplicativo. É uma convicção.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-lora)", lineHeight: 1.95 }}
          >
            A convicção de que fé e saúde mental não competem: se completam. Que um
            devocional diário transforma a química do seu cérebro tanto quanto qualquer
            prescrição. Que a oração não é fuga da realidade; é o enfrentamento mais
            corajoso dela. Que você foi criado para ser íntegro:{" "}
            <strong style={{ color: "var(--gold)" }}>corpo, mente e espírito</strong>.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-lora)", lineHeight: 1.95 }}
          >
            O SELAH existe para esse homem. Para essa família. Para esse discípulo que
            recusa viver pela metade.
          </p>

          {/* Citação final */}
          <div
            className="rounded-xl p-5 text-center mt-2"
            style={{ background: "var(--wine-bg)", border: "1px solid var(--wine-border)" }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text)", fontFamily: "var(--font-lora)", fontStyle: "italic", lineHeight: 1.9 }}
            >
              "Construí o SELAH para o homem que quer ser saudável de verdade, por
              dentro e por fora. Para a família que quer crescer junta. Para o discípulo
              que sabe que Deus é suficiente e quer usar cada ferramenta que Ele colocou
              à sua disposição."
            </p>
            <p
              className="text-xs mt-4 font-semibold"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}
            >
              Dr. Edson Barroso
            </p>
          </div>
        </div>

        {/* ── Badges ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            "Saúde Mental",
            "Medicina Integrativa",
            "TDAH & TEA",
            "Casa de Oração",
            "Legendários",
            "Canabidiol Medicinal",
          ].map((b) => (
            <span
              key={b}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "var(--gold-bg)",
                color: "var(--gold-label)",
                border: "1px solid rgba(201,168,76,0.25)",
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.05em",
              }}
            >
              {b}
            </span>
          ))}
        </div>

        {/* ── Botão entrar ─────────────────────────────────────────────────── */}
        <button
          onClick={handleEnter}
          className="btn-primary w-full max-w-xs text-sm py-3"
          style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em" }}
        >
          ✦ ENTRAR NO SELAH
        </button>

        <p
          className="text-xs mt-4 text-center"
          style={{ color: "var(--text-subtle)", fontFamily: "var(--font-lora)", fontStyle: "italic" }}
        >
          "Pause, reflita e ouça. Há algo maior agindo."
        </p>

        {/* ── Rodapé ──────────────────────────────────────────────────────── */}
        <p
          className="text-xs mt-8 text-center"
          style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}
        >
          CASA DE ORAÇÃO · FRANCA/SP
        </p>
      </div>

      {/* ── Barra inferior decorativa ───────────────────────────────────── */}
      <div
        className="w-full h-1 shrink-0"
        style={{ background: "linear-gradient(90deg, var(--heal) 0%, var(--gold) 50%, var(--wine) 100%)" }}
      />
    </div>
  );
}
