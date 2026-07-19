"use client";

/**
 * Página Dr. Edson Barroso — refatorada na Task 5.3
 * Chat Kairo via <KairoChat />, tab "Sobre & Contato" mantida.
 */
import { useState } from "react";
import Image from "next/image";
import { KairoChat } from "@/features/kairo";

export default function DrEdsonPage() {
  const [tab, setTab] = useState<"kairo" | "sobre">("kairo");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--wine-bg) 0%, var(--bg-card) 60%, var(--heal-bg) 100%)",
          borderBottom: "1px solid var(--wine-border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full shrink-0 overflow-hidden glow-wine"
              style={{ border: "2px solid rgba(201,168,76,0.4)" }}
            >
              <Image
                src="/minhaimgredonda.png"
                alt="Dr. Edson Barroso"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1
                  className="text-2xl md:text-3xl"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
                >
                  Dr. Edson Barroso
                </h1>
                <span className="badge badge-wine">Médico</span>
                <span className="badge badge-heal">Saúde Mental</span>
              </div>
              <p
                className="text-sm mb-3"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-lora)",
                  fontStyle: "italic",
                }}
              >
                Médico especialista em saúde mental · Membro da Casa de Oração · Franca/SP
              </p>
              <p
                className="text-sm leading-relaxed max-w-2xl"
                style={{ color: "var(--text)" }}
              >
                Com fé e ciência caminhando juntas, o Dr. Edson Barroso dedica sua vida a
                ajudar pessoas a vencerem o medo, a ansiedade e os bloqueios emocionais —
                sempre com base bíblica, cuidado pastoral e responsabilidade médica.
              </p>

              {/* Contatos */}
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="https://www.instagram.com/dredsonbarroso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ padding: "0.45rem 1rem", fontSize: "0.75rem" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @dredsonbarroso
                </a>
                <a
                  href="https://www.youtube.com/@dr.edsonbarroso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{
                    padding: "0.45rem 1rem",
                    fontSize: "0.75rem",
                    color: "var(--heal)",
                    borderColor: "var(--heal)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
                <a
                  href="https://wa.me/5516993120938"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-heal"
                  style={{ padding: "0.45rem 1rem", fontSize: "0.75rem" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="https://www.dredsonbarroso.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ padding: "0.45rem 1rem", fontSize: "0.75rem" }}
                >
                  🌐 Site Oficial
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6">
        <div
          className="flex gap-1 mt-6 mb-6 p-1 rounded-lg"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            width: "fit-content",
          }}
        >
          <button
            onClick={() => setTab("kairo")}
            className="px-5 py-2 rounded-md text-sm transition-all"
            style={{
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.08em",
              background: tab === "kairo" ? "var(--wine-bg)" : "transparent",
              color: tab === "kairo" ? "var(--wine-light)" : "var(--text-muted)",
              border: tab === "kairo" ? "1px solid var(--wine-border)" : "1px solid transparent",
            }}
          >
            ✦ Converse com Kairo
          </button>
          <button
            onClick={() => setTab("sobre")}
            className="px-5 py-2 rounded-md text-sm transition-all"
            style={{
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.08em",
              background: tab === "sobre" ? "var(--gold-bg)" : "transparent",
              color: tab === "sobre" ? "var(--gold)" : "var(--text-muted)",
              border: tab === "sobre" ? "1px solid rgba(201,168,76,0.3)" : "1px solid transparent",
            }}
          >
            Sobre & Contato
          </button>
        </div>

        {/* Tab: Kairo Chat */}
        {tab === "kairo" && <KairoChat />}

        {/* Tab: Sobre */}
        {tab === "sobre" && (
          <div className="pb-8 space-y-6">
            <div className="card-wine p-6">
              <h2
                className="text-lg mb-4"
                style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
              >
                Sobre o Dr. Edson Barroso
              </h2>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                <p>
                  O Dr. Edson Barroso é médico especialista em saúde mental, com uma visão única
                  que integra ciência e fé. Membro ativo da Casa de Oração de Franca/SP, ele
                  acredita que o cuidado com a mente é também um ato de honrar o templo do
                  Espírito Santo.
                </p>
                <p>
                  Sua abordagem combina o rigor da medicina com a profundidade da Palavra de Deus,
                  ajudando pacientes a vencerem o medo, a ansiedade, bloqueios emocionais e
                  crenças limitantes que impedem o pleno florescimento da vida em Cristo.
                </p>
                <p>
                  Autor do livro{" "}
                  <strong style={{ color: "var(--gold)" }}>"Dominando o Medo"</strong>,
                  o Dr. Edson compartilha ferramentas práticas e bíblicas para transformar a mente
                  e viver com coragem e propósito.
                </p>
              </div>
            </div>

            <div className="card p-6">
              <h3
                className="text-base mb-4"
                style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
              >
                Consultório
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span style={{ color: "var(--wine-light)", fontSize: "1.1rem" }}>📍</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Edifício Santa Maria — Sala 403
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      R. Paulo César Pachêco, 470 — São José
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Franca — SP, 14401-283
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--heal-light)", fontSize: "1.1rem" }}>📱</span>
                  <a href="tel:+5516993120938" className="text-sm" style={{ color: "var(--text)" }}>
                    (16) 99312-0938
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--gold)", fontSize: "1.1rem" }}>🌐</span>
                  <a
                    href="https://www.dredsonbarroso.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: "var(--gold)" }}
                  >
                    www.dredsonbarroso.com.br
                  </a>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3
                className="text-base mb-4"
                style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
              >
                Redes Sociais
              </h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/dredsonbarroso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wine"
                  style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem" }}
                >
                  Instagram
                </a>
                <a
                  href="https://www.youtube.com/@dr.edsonbarroso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem" }}
                >
                  YouTube
                </a>
                <a
                  href="https://wa.me/5516993120938"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-heal"
                  style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem" }}
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(123,31,58,0.12) 100%)",
                border: "1px solid rgba(201,168,76,0.25)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontSize: "2rem" }}>📖</span>
                <div>
                  <h3
                    className="text-base"
                    style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}
                  >
                    Dominando o Medo
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Dr. Edson Barroso
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                Um guia prático e bíblico para identificar, enfrentar e vencer os medos que
                aprisionam a mente e impedem o pleno florescimento da vida em Cristo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
