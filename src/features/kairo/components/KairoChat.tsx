"use client";

/**
 * Task 5.3 — KairoChat
 * Componente completo do chat: header + mensagens + input.
 */
import { useRef, useEffect } from "react";
import { KairoHeader } from "./KairoHeader";
import { KairoBubble, KairoTypingIndicator } from "./KairoBubble";
import { useKairoChat } from "../hooks/useKairoChat";

export function KairoChat() {
  const { messages, loading, error, send } = useKairoChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = inputRef.current?.value ?? "";
    if (!text.trim() || loading) return;
    send(text);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="pb-8">
      <KairoHeader />

      {/* Mensagens de erro de rate-limit */}
      {error && (
        <div
          className="mb-3 p-3 rounded-lg text-sm"
          style={{
            background: "rgba(123,31,58,0.15)",
            border: "1px solid rgba(123,31,58,0.3)",
            color: "var(--wine-light)",
          }}
        >
          {error}
        </div>
      )}

      {/* Área de mensagens */}
      <div
        className="card p-4 mb-4 overflow-y-auto flex flex-col gap-4"
        style={{ minHeight: "380px", maxHeight: "480px" }}
      >
        {messages.map((msg, i) => (
          <KairoBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && <KairoTypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="card p-3 flex gap-3 items-end"
        style={{ border: "1px solid rgba(123,31,58,0.3)" }}
      >
        <textarea
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder="Compartilhe o que está sentindo... Kairo está aqui para ouvir."
          rows={2}
          disabled={loading}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: "var(--text)",
            fontFamily: "var(--font-inter)",
            fontSize: "0.9rem",
            lineHeight: "1.5",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-wine shrink-0"
          style={{ padding: "0.6rem 1.2rem", fontSize: "0.75rem" }}
        >
          Enviar
        </button>
      </div>

      <p
        className="text-xs mt-2 text-center"
        style={{ color: "var(--text-subtle)" }}
      >
        Kairo é um assistente de apoio espiritual. Em crises graves, procure ajuda profissional imediatamente.
      </p>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
