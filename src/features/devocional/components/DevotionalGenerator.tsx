"use client";

import { useState } from "react";
import { useGenerateDevotional } from "../hooks/useGenerateDevotional";
import type { DevotionalGenerated } from "../types";

function GeneratedView({ d }: { d: DevotionalGenerated }) {
  const [copiado, setCopiado] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const copiar = () => {
    const texto = `${d.titulo}\n\n"${d.versiculo}"\n— ${d.referencia}\n\nREFLEXÃO\n${d.reflexao}\n\nORAÇÃO\n${d.oracao}\n\n"${d.frase_destaque}"\n\nCompartilhado pelo App SELAH`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartilharWhatsApp = () => {
    const texto = encodeURIComponent(
      `✨ *${d.titulo}*\n\n_"${d.versiculo}"_\n— ${d.referencia}\n\n${d.reflexao.slice(0, 300)}...\n\n🙏 *"${d.frase_destaque}"*\n\nCompartilhado pelo App SELAH`,
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  const imprimir = () => {
    const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${d.titulo} — SELAH</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Lora',Georgia,serif;color:#1a1a2e;background:#fff;max-width:680px;margin:0 auto;padding:40px 36px;line-height:1.8}
      .header{text-align:center;margin-bottom:32px;border-bottom:2px solid #c9a227;padding-bottom:20px}
      .app-name{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.2em;color:#c9a227;text-transform:uppercase;margin-bottom:6px}
      .date{font-size:12px;color:#888;margin-bottom:12px}
      h1{font-family:'Cinzel',serif;font-size:22px;color:#1a1a2e;line-height:1.3;margin-bottom:4px}
      .topic{display:inline-block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#c9a227;font-family:'Cinzel',serif;margin-top:6px}
      blockquote{margin:24px 0;padding:16px 20px;background:#fdf8ed;border-left:3px solid #c9a227;border-radius:4px;font-style:italic;font-size:15px;color:#333}
      blockquote footer{margin-top:10px;font-style:normal;font-size:12px;color:#c9a227;font-family:'Cinzel',serif;letter-spacing:.06em}
      .section-label{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#c9a227;margin-bottom:10px;margin-top:24px}
      .reflection p{margin-bottom:14px;font-size:14px;color:#222}
      .prayer{background:#f9f7f2;border:1px solid #e8dfc0;border-radius:6px;padding:16px 20px;margin-top:8px;font-style:italic;font-size:14px;color:#444}
      .highlight{text-align:center;border:1px solid #c9a227;border-radius:6px;padding:16px 20px;margin-top:24px;background:#fffdf5}
      .highlight p{font-style:italic;font-size:15px;color:#c9a227;font-family:'Lora',serif}
      .footer{text-align:center;margin-top:36px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;font-family:'Cinzel',serif;letter-spacing:.08em}
      @media print{body{padding:20px}}
    </style></head><body>
      <div class="header">
        <div class="app-name">App SELAH · Casa de Oração</div>
        <div class="date">${data}</div>
        <h1>${d.titulo}</h1>
        ${d.topico ? `<span class="topic">${d.topico}</span>` : ""}
      </div>
      <blockquote>${d.versiculo}<footer>— ${d.referencia}</footer></blockquote>
      <div class="section-label">Reflexão</div>
      <div class="reflection">${d.reflexao.split("\n\n").map((p) => `<p>${p}</p>`).join("")}</div>
      <div class="section-label">Oração</div>
      <div class="prayer">${d.oracao}</div>
      <div class="highlight"><p>&ldquo;${d.frase_destaque}&rdquo;</p></div>
      <div class="footer">Compartilhado pelo App SELAH · selah.app</div>
    </body></html>`;

    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const falar = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const texto = `${d.titulo}. ${d.versiculo}. ${d.reflexao}. Oração: ${d.oracao}`;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 0.88;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="mt-4 space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={falar} className={`btn-secondary py-1.5 px-3 text-sm ${speaking ? "glow-gold" : ""}`}>
          {speaking ? "⏹ Parar" : "🔊 Ouvir"}
        </button>
        <button onClick={compartilharWhatsApp} className="btn-secondary py-1.5 px-3 text-sm" style={{ color: "#25D366" }}>
          ✉ WhatsApp
        </button>
        <button onClick={copiar} className="btn-secondary py-1.5 px-3 text-sm">
          {copiado ? "✓ Copiado!" : "⎘ Copiar"}
        </button>
        <button onClick={imprimir} className="btn-secondary py-1.5 px-3 text-sm">
          🖨 Imprimir
        </button>
        {d.topico && <span className="badge badge-gold ml-auto">{d.topico}</span>}
      </div>

      <h2 className="text-xl leading-snug" style={{ fontFamily: "var(--font-cinzel)" }}>
        {d.titulo}
      </h2>

      <blockquote
        className="scripture text-base leading-relaxed p-5 rounded-xl"
        style={{ background: "rgba(201,162,39,0.05)", borderLeft: "3px solid rgba(201,162,39,0.5)" }}
      >
        {d.versiculo}
        <footer
          className="mt-3 text-sm not-italic"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}
        >
          — {d.referencia}
        </footer>
      </blockquote>

      <div>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Reflexão
        </p>
        <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text)" }}>
          {d.reflexao.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      <div className="p-5 rounded-xl" style={{ background: "var(--bg-2)", border: "1px solid rgba(201,162,39,0.15)" }}>
        <p className="text-xs mb-3" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Oração
        </p>
        <p className="scripture text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {d.oracao}
        </p>
      </div>

      <div className="text-center py-4 px-6 rounded-xl" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
        <p className="scripture text-base leading-relaxed" style={{ color: "var(--gold)" }}>
          &ldquo;{d.frase_destaque}&rdquo;
        </p>
      </div>
    </div>
  );
}

export function DevotionalGenerator() {
  const [tema, setTema] = useState("");
  const { generate, result, loading, error } = useGenerateDevotional();
  const [tipoAtual, setTipoAtual] = useState<"tema" | "dia" | null>(null);

  const handleGenerate = (tipo: "tema" | "dia") => {
    setTipoAtual(tipo);
    generate({ tipo, tema: tipo === "tema" ? tema : undefined });
  };

  return (
    <div className="card p-6">
      <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
        Devocional com IA
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Ex: Fé, Amor, Perseverança, Cura, Gratidão..."
          className="input-field flex-1"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate("tema")}
        />
        <button
          onClick={() => handleGenerate("tema")}
          disabled={loading || !tema.trim()}
          className="btn-primary py-2 px-5 shrink-0"
        >
          {loading && tipoAtual === "tema" ? "Gerando..." : "✦ Gerar Tema"}
        </button>
        <button
          onClick={() => handleGenerate("dia")}
          disabled={loading}
          className="btn-secondary py-2 px-5 shrink-0"
        >
          {loading && tipoAtual === "dia" ? "Gerando..." : "☀ Palavra do Dia"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-3xl animate-pulse mb-3" style={{ color: "var(--gold)" }}>✦</div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Gerando devocional{tipoAtual === "dia" ? " do dia" : ` sobre "${tema}"`}...
          </p>
        </div>
      )}

      {error && !loading && (
        <p className="error-text text-center mt-4">{error}</p>
      )}

      {result && !loading && <GeneratedView d={result} />}
    </div>
  );
}
