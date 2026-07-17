"use client";

/**
 * Task 5.3 — KairoHeader
 * Card de identidade do assistente KAIRO exibido no topo do chat.
 */

export function KairoHeader() {
  return (
    <div className="card-wine p-5 mb-4 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--wine) 0%, var(--gold) 100%)",
          boxShadow: "0 0 20px rgba(123,31,58,0.5)",
        }}
      >
        <span style={{ fontSize: "1.3rem" }}>✦</span>
      </div>
      <div>
        <h2
          className="text-lg"
          style={{
            color: "var(--gold)",
            fontFamily: "var(--font-cinzel)",
            marginBottom: "0.1rem",
          }}
        >
          KAIRO
        </h2>
        <p
          className="text-xs"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-lora)",
            fontStyle: "italic",
          }}
        >
          O assistente que enfrenta tudo · Pastoral · Bíblico · Acolhedor
        </p>
      </div>
      <div className="ml-auto">
        <span className="badge badge-heal">Online</span>
      </div>
    </div>
  );
}
