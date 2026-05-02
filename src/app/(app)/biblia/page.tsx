"use client";
import { useState, useCallback, useRef } from "react";

const BOOKS = [
  "Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute",
  "1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras",
  "Neemias","Ester","Jó","Salmos","Provérbios","Eclesiastes","Cantares","Isaías",
  "Jeremias","Lamentações","Ezequiel","Daniel","Oséias","Joel","Amós","Obadias",
  "Jonas","Miquéias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias",
  "Mateus","Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios",
  "Gálatas","Efésios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses",
  "1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus","Tiago","1 Pedro","2 Pedro",
  "1 João","2 João","3 João","Judas","Apocalipse",
];

const VERSIONS = [
  { code: "NVI", label: "Nova Versão Internacional" },
  { code: "ACF", label: "Almeida Corrigida Fiel" },
  { code: "ARA", label: "Almeida Revista e Atualizada" },
  { code: "KJV", label: "King James Version" },
];

interface Verse { number: number; text: string; }
interface CrossRef { reference: string; text: string; connection: string; }
interface SearchResult { reference: string; text: string; relevance: string; }

export default function BibliaPage() {
  const [book, setBook] = useState("João");
  const [chapter, setChapter] = useState("3");
  const [version, setVersion] = useState("NVI");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [crossRefs, setCrossRefs] = useState<CrossRef[]>([]);
  const [crossRefsLoading, setCrossRefsLoading] = useState(false);
  const [showCrossRefs, setShowCrossRefs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadChapter = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedVerse(null);
    setShowCrossRefs(false);
    try {
      const res = await fetch(`/api/biblia/texto?book=${encodeURIComponent(book)}&chapter=${chapter}&version=${version}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVerses(data.verses || []);
    } catch {
      setError("Não foi possível carregar o capítulo. Tente novamente.");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [book, chapter, version]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const res = await fetch("/api/biblia/busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCrossRefs = async (verse: Verse) => {
    setSelectedVerse(verse);
    setShowCrossRefs(true);
    setCrossRefsLoading(true);
    setCrossRefs([]);
    try {
      const res = await fetch("/api/biblia/referencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse: verse.text, book, chapter, verseNumber: verse.number }),
      });
      const data = await res.json();
      setCrossRefs(data.references || []);
    } catch {
      setCrossRefs([]);
    } finally {
      setCrossRefsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = verses.map(v => `Versículo ${v.number}. ${v.text}`).join(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const prevChapter = () => {
    const n = parseInt(chapter);
    if (n > 1) setChapter(String(n - 1));
  };
  const nextChapter = () => setChapter(String(parseInt(chapter) + 1));

  const copyVerse = (verse: Verse) => {
    navigator.clipboard.writeText(`"${verse.text}" — ${book} ${chapter}:${verse.number} (${version})`);
  };

  const shareWhatsApp = (verse: Verse) => {
    const text = encodeURIComponent(`"${verse.text}" — ${book} ${chapter}:${verse.number} (${version})\n\nCompartilhado pelo App SELAH`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Barra de controles */}
      <div className="sticky top-0 z-10 px-4 py-3 flex flex-wrap items-center gap-2 border-b"
        style={{ background: "var(--bg-primary)", borderColor: "rgba(201,162,39,0.15)" }}>
        <select className="input-field py-1.5 text-sm"
          value={book} onChange={(e) => setBook(e.target.value)}>
          {BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <button onClick={prevChapter} className="btn-secondary px-2 py-1.5 text-sm">‹</button>
          <input type="number" min={1} className="input-field py-1.5 text-sm w-14 text-center"
            value={chapter} onChange={(e) => setChapter(e.target.value)} />
          <button onClick={nextChapter} className="btn-secondary px-2 py-1.5 text-sm">›</button>
        </div>
        <select className="input-field py-1.5 text-sm"
          value={version} onChange={(e) => setVersion(e.target.value)}>
          {VERSIONS.map((v) => <option key={v.code} value={v.code}>{v.label}</option>)}
        </select>
        <button onClick={loadChapter} disabled={loading} className="btn-primary py-1.5 px-4 text-sm">
          {loading ? "..." : "Ir"}
        </button>
        <button onClick={() => setShowSearch(!showSearch)}
          className={`btn-secondary py-1.5 px-3 text-sm ${showSearch ? "glow-gold" : ""}`} title="Pesquisar na Bíblia">
          🔍
        </button>
        {verses.length > 0 && (
          <button onClick={handleSpeak}
            className={`btn-secondary py-1.5 px-3 text-sm ${speaking ? "glow-gold" : ""}`}
            title={speaking ? "Parar" : "Ouvir capítulo"}>
            {speaking ? "⏹" : "🔊"}
          </button>
        )}
      </div>

      {/* Barra de busca */}
      {showSearch && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,162,39,0.1)", background: "rgba(201,162,39,0.02)" }}>
          <div className="flex gap-2 max-w-2xl">
            <input type="text" placeholder="Buscar por tema, palavra ou referência (ex: amor, João 3:16)..."
              className="input-field flex-1 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <button onClick={handleSearch} disabled={searchLoading} className="btn-primary py-2 px-4 text-sm">
              {searchLoading ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-w-2xl">
              {searchResults.map((r, i) => (
                <div key={i} className="card p-3">
                  <p className="text-xs mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>{r.reference}</p>
                  <p className="scripture text-sm leading-relaxed mb-1">{r.text}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{r.relevance}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1">
        {/* Conteúdo principal */}
        <div className="flex-1 p-6">
          {error && (
            <div className="card p-4 mb-4 max-w-2xl" style={{ borderColor: "rgba(255,80,80,0.3)" }}>
              <p className="text-sm" style={{ color: "rgba(255,100,100,0.9)" }}>{error}</p>
            </div>
          )}

          {verses.length === 0 && !loading && !error && (
            <div className="card p-8 text-center max-w-xl mx-auto mt-8">
              <div className="text-5xl mb-4">📖</div>
              <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-cinzel)" }}>Leia a Bíblia Sagrada</h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                Selecione um livro, capítulo e versão acima e clique em <strong>Ir</strong> para começar a leitura.
                Use a busca 🔍 para encontrar versículos por tema ou referência.
              </p>
              <button onClick={loadChapter} className="btn-primary py-2 px-6">
                Carregar João 3
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-3xl mb-3 animate-pulse" style={{ color: "var(--gold)" }}>✦</div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Carregando {book} {chapter}...</p>
              </div>
            </div>
          )}

          {verses.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl" style={{ fontFamily: "var(--font-cinzel)" }}>{book} {chapter}</h2>
                <span className="badge badge-gold">{version}</span>
              </div>
              <div className="space-y-0.5">
                {verses.map((verse) => (
                  <div key={verse.number}
                    className="group flex gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={selectedVerse?.number === verse.number
                      ? { background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }
                      : { border: "1px solid transparent" }}
                    onClick={() => setSelectedVerse(selectedVerse?.number === verse.number ? null : verse)}>
                    <span className="shrink-0 text-xs mt-1 w-5 text-right select-none"
                      style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
                      {verse.number}
                    </span>
                    <p className="scripture text-base leading-relaxed flex-1">{verse.text}</p>
                    <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                      <button onClick={(e) => { e.stopPropagation(); handleCrossRefs(verse); }}
                        className="text-xs px-2 py-0.5 rounded" title="Referências cruzadas"
                        style={{ background: "rgba(201,162,39,0.15)", color: "var(--gold)" }}>⇄</button>
                      <button onClick={(e) => { e.stopPropagation(); copyVerse(verse); }}
                        className="text-xs px-2 py-0.5 rounded" title="Copiar versículo"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>⎘</button>
                      <button onClick={(e) => { e.stopPropagation(); shareWhatsApp(verse); }}
                        className="text-xs px-2 py-0.5 rounded" title="Compartilhar no WhatsApp"
                        style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}>✉</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8 pt-4 border-t" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
                <button onClick={prevChapter} className="btn-secondary py-2 px-4 text-sm">← Anterior</button>
                <button onClick={nextChapter} className="btn-secondary py-2 px-4 text-sm">Próximo →</button>
              </div>
            </div>
          )}
        </div>

        {/* Painel de referências cruzadas */}
        {showCrossRefs && (
          <div className="w-80 border-l overflow-y-auto p-4 shrink-0"
            style={{ borderColor: "rgba(201,162,39,0.15)", background: "rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm" style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)" }}>
                Referências Cruzadas
              </h3>
              <button onClick={() => setShowCrossRefs(false)}
                className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>✕</button>
            </div>
            {selectedVerse && (
              <blockquote className="scripture text-xs leading-relaxed p-3 rounded-lg mb-4"
                style={{ background: "rgba(201,162,39,0.05)", borderLeft: "2px solid rgba(201,162,39,0.4)" }}>
                <span className="block mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                  {book} {chapter}:{selectedVerse.number}
                </span>
                {selectedVerse.text}
              </blockquote>
            )}
            {crossRefsLoading && (
              <div className="text-center py-8">
                <div className="text-xl animate-pulse" style={{ color: "var(--gold)" }}>✦</div>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Buscando referências com IA...</p>
              </div>
            )}
            {crossRefs.map((ref, i) => (
              <div key={i} className="card p-3 mb-3">
                <p className="text-xs mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>{ref.reference}</p>
                <p className="scripture text-xs leading-relaxed mb-2">{ref.text}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{ref.connection}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
