"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface DevocionalGerado {
  titulo: string;
  versiculo: string;
  referencia: string;
  reflexao: string;
  oracao: string;
  frase_destaque: string;
  topico: string;
}

interface DevocionalSalvo {
  id: string;
  title: string;
  date: string;
  bible_passage: string;
  bible_book: string;
  bible_chapter: number;
  bible_verse_start: number;
  bible_verse_end?: number;
  reflection_text: string;
  prayer_text?: string;
  generated_by_ai: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function DevocionalPage() {
  const [tema, setTema] = useState("");
  const [devocionalGerado, setDevocionalGerado] = useState<DevocionalGerado | null>(null);
  const [gerando, setGerando] = useState(false);
  const [tipoGeracao, setTipoGeracao] = useState<"tema" | "dia" | null>(null);
  const [devocionaisSalvos, setDevocionaisSalvos] = useState<DevocionalSalvo[]>([]);
  const [loadingSalvos, setLoadingSalvos] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const loadDevocionais = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("devotionals")
        .select("*")
        .order("date", { ascending: false })
        .limit(20);
      setDevocionaisSalvos((data as DevocionalSalvo[]) ?? []);
      setLoadingSalvos(false);
    };
    loadDevocionais();
  }, []);

  const gerarDevocional = async (tipo: "tema" | "dia") => {
    if (tipo === "tema" && !tema.trim()) return;
    setGerando(true);
    setTipoGeracao(tipo);
    setDevocionalGerado(null);
    try {
      const res = await fetch("/api/devocional/interativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, tema: tipo === "tema" ? tema : undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDevocionalGerado(data);
    } catch {
      alert("Não foi possível gerar o devocional. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const copiar = () => {
    if (!devocionalGerado) return;
    const texto = `${devocionalGerado.titulo}\n\n"${devocionalGerado.versiculo}"\n— ${devocionalGerado.referencia}\n\nREFLEXÃO\n${devocionalGerado.reflexao}\n\nORAÇÃO\n${devocionalGerado.oracao}\n\n"${devocionalGerado.frase_destaque}"\n\nCompartilhado pelo App SELAH`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartilharWhatsApp = () => {
    if (!devocionalGerado) return;
    const texto = encodeURIComponent(
      `✨ *${devocionalGerado.titulo}*\n\n_"${devocionalGerado.versiculo}"_\n— ${devocionalGerado.referencia}\n\n${devocionalGerado.reflexao.slice(0, 300)}...\n\n🙏 *"${devocionalGerado.frase_destaque}"*\n\nCompartilhado pelo App SELAH`
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  const falarDevocional = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!devocionalGerado) return;
    const texto = `${devocionalGerado.titulo}. ${devocionalGerado.versiculo}. ${devocionalGerado.reflexao}. Oração: ${devocionalGerado.oracao}`;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 0.88;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayDevocional = devocionaisSalvos.find((d) => d.date === today);
  const archive = devocionaisSalvos.filter((d) => d.date !== today);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Devocional
        </p>
        <h1 className="text-2xl">Pause e Reflita</h1>
      </div>

      {/* Gerador interativo com IA */}
      <div className="card p-6">
        <p className="text-xs tracking-widest uppercase mb-4"
          style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
          Devocional com IA
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Ex: Fé, Amor, Perseverança, Cura, Gratidão..."
            className="input-field flex-1"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gerarDevocional("tema")}
          />
          <button
            onClick={() => gerarDevocional("tema")}
            disabled={gerando || !tema.trim()}
            className="btn-primary py-2 px-5 shrink-0">
            {gerando && tipoGeracao === "tema" ? "Gerando..." : "✦ Gerar Tema"}
          </button>
          <button
            onClick={() => gerarDevocional("dia")}
            disabled={gerando}
            className="btn-secondary py-2 px-5 shrink-0">
            {gerando && tipoGeracao === "dia" ? "Gerando..." : "☀ Palavra do Dia"}
          </button>
        </div>

        {gerando && (
          <div className="text-center py-12">
            <div className="text-3xl animate-pulse mb-3" style={{ color: "var(--gold)" }}>✦</div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Gerando devocional{tipoGeracao === "dia" ? " do dia" : ` sobre "${tema}"`}...
            </p>
          </div>
        )}

        {devocionalGerado && !gerando && (
          <div className="mt-4 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={falarDevocional}
                className={`btn-secondary py-1.5 px-3 text-sm ${speaking ? "glow-gold" : ""}`}>
                {speaking ? "⏹ Parar" : "🔊 Ouvir"}
              </button>
              <button onClick={compartilharWhatsApp}
                className="btn-secondary py-1.5 px-3 text-sm" style={{ color: "#25D366" }}>
                ✉ WhatsApp
              </button>
              <button onClick={copiar} className="btn-secondary py-1.5 px-3 text-sm">
                {copiado ? "✓ Copiado!" : "⎘ Copiar"}
              </button>
              {devocionalGerado.topico && (
                <span className="badge badge-gold ml-auto">{devocionalGerado.topico}</span>
              )}
            </div>

            <h2 className="text-xl leading-snug" style={{ fontFamily: "var(--font-cinzel)" }}>
              {devocionalGerado.titulo}
            </h2>

            <blockquote className="scripture text-base leading-relaxed p-5 rounded-xl"
              style={{ background: "rgba(201,162,39,0.05)", borderLeft: "3px solid rgba(201,162,39,0.5)" }}>
              {devocionalGerado.versiculo}
              <footer className="mt-3 text-sm not-italic"
                style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
                — {devocionalGerado.referencia}
              </footer>
            </blockquote>

            <div>
              <p className="text-xs tracking-widest uppercase mb-3"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                Reflexão
              </p>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                {devocionalGerado.reflexao.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            <div className="p-5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.15)" }}>
              <p className="text-xs mb-3"
                style={{ color: "rgba(201,162,39,0.65)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Oração
              </p>
              <p className="scripture text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                {devocionalGerado.oracao}
              </p>
            </div>

            <div className="text-center py-4 px-6 rounded-xl"
              style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
              <p className="scripture text-base leading-relaxed" style={{ color: "var(--gold)" }}>
                &ldquo;{devocionalGerado.frase_destaque}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Devocional do dia (banco de dados) */}
      {!loadingSalvos && todayDevocional && (
        <div className="card p-8 glow-gold">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xs tracking-widest uppercase mb-1"
                style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                {formatDate(todayDevocional.date)}
              </p>
              <h2 className="text-xl leading-snug">{todayDevocional.title}</h2>
            </div>
            {todayDevocional.generated_by_ai && (
              <span className="badge badge-gold shrink-0">Gerado por IA</span>
            )}
          </div>
          <blockquote className="scripture text-base leading-relaxed p-5 rounded-xl mb-6"
            style={{ background: "rgba(201,162,39,0.05)", borderLeft: "3px solid rgba(201,162,39,0.5)" }}>
            {todayDevocional.bible_passage}
            <footer className="mt-3 text-sm not-italic"
              style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
              {todayDevocional.bible_book} {todayDevocional.bible_chapter}:{todayDevocional.bible_verse_start}
              {todayDevocional.bible_verse_end ? `–${todayDevocional.bible_verse_end}` : ""}
            </footer>
          </blockquote>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            {todayDevocional.reflection_text.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {todayDevocional.prayer_text && (
            <div className="mt-8 p-5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.15)" }}>
              <p className="text-xs mb-3"
                style={{ color: "rgba(201,162,39,0.65)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Oração
              </p>
              <p className="scripture text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                {todayDevocional.prayer_text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Arquivo */}
      {archive.length > 0 && (
        <div>
          <p className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "rgba(201,162,39,0.45)", fontFamily: "var(--font-cinzel)" }}>
            Arquivo
          </p>
          <div className="space-y-3">
            {archive.map((d) => (
              <div key={d.id} className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
                      {formatDate(d.date)}
                    </p>
                    <h3 className="text-base">{d.title}</h3>
                    <p className="text-sm mt-1" style={{ color: "rgba(201,162,39,0.7)" }}>
                      {d.bible_book} {d.bible_chapter}:{d.bible_verse_start}
                    </p>
                  </div>
                  {d.generated_by_ai && <span className="badge badge-gold shrink-0 text-xs">IA</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingSalvos && devocionaisSalvos.length === 0 && (
        <div className="card p-6 text-center">
          <p className="scripture text-lg mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            &quot;A sua palavra é lâmpada que ilumina o meu caminho.&quot;
          </p>
          <p className="text-xs mb-4" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
            Salmos 119:105
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Use o gerador de IA acima para criar seu primeiro devocional!
          </p>
        </div>
      )}
    </div>
  );
}
