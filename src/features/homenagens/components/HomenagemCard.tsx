import type { Homenagem } from "../types";

interface HomenagemCardProps {
  homenagem: Homenagem;
}

export function HomenagemCard({ homenagem: h }: HomenagemCardProps) {
  const fotoCapa = h.fotos[h.foto_capa_index] ?? h.fotos[0] ?? null;
  const fotoSecundaria = h.fotos.find((_, i) => i !== h.foto_capa_index) ?? null;

  return (
    <div
      className="card overflow-hidden"
      style={{ border: "1px solid rgba(201,162,39,0.25)", background: "linear-gradient(160deg, var(--gold-bg) 0%, var(--bg-card) 100%)" }}
    >
      {fotoCapa && (
        <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: 320, overflow: "hidden" }}>
          <img
            src={fotoCapa}
            alt={h.homenageado_nome}
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", background: "#0a0a0a" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.92) 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
            <p className="text-xl font-bold" style={{ color: "#f0c040", fontFamily: "var(--font-cinzel)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {h.homenageado_nome}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)" }}>
              {h.homenageado_parentesco}
              {h.homenageado_instagram && (
                <span style={{ color: "var(--gold-label)", marginLeft: 8 }}>@{h.homenageado_instagram}</span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="pb-3 space-y-2" style={{ borderBottom: "1px solid rgba(201,162,39,0.15)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-xs" style={{ color: "var(--text-subtle)" }}>Homenagem de</span>
            <span className="text-xs font-semibold" style={{ color: "#c9a227" }}>{h.autor_nome}</span>
            {h.autor_instagram && (
              <a
                href={`https://instagram.com/${h.autor_instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                style={{ color: "var(--gold-label)" }}
              >
                @{h.autor_instagram}
              </a>
            )}
          </div>
          {h.autor_legendario_numero && (
            <div className="flex justify-center">
              <span
                className="text-xs px-4 py-1 rounded-full"
                style={{ background: "var(--gold-bg)", color: "var(--gold)", border: "1px solid var(--gold-glow)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}
              >
                Legendário #{h.autor_legendario_numero}
              </span>
            </div>
          )}
        </div>

        <div
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: "var(--text)", fontStyle: "italic", lineHeight: 1.8 }}
        >
          {h.texto}
        </div>

        {h.homenageado_instagram && (
          <div className="pt-2">
            <a
              href={`https://instagram.com/${h.homenageado_instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: "rgba(201,162,39,0.12)", color: "#f0c040", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}
            >
              @{h.homenageado_instagram}
            </a>
          </div>
        )}

        {fotoSecundaria && (
          <div className="pt-2">
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
              <img
                src={fotoSecundaria}
                alt="Família"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", background: "#0a0a0a" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
