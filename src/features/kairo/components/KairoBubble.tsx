"use client";

/**
 * Task 5.3 — KairoBubble
 * Bolha de mensagem individual do chat (user ou assistant).
 */

interface KairoBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function KairoBubble({ role, content }: KairoBubbleProps) {
  return (
    <div
      className={role === "user" ? "kairo-bubble-user" : "kairo-bubble-ai"}
      style={{ whiteSpace: "pre-wrap" }}
    >
      {role === "assistant" && (
        <div className="flex items-center gap-2 mb-2" style={{ opacity: 0.6 }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.1em",
              color: "var(--gold)",
            }}
          >
            ✦ KAIRO
          </span>
        </div>
      )}
      {content}
    </div>
  );
}

export function KairoTypingIndicator() {
  return (
    <div className="kairo-bubble-ai">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
                display: "inline-block",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Kairo está respondendo...
        </span>
      </div>
    </div>
  );
}
