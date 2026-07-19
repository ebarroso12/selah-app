"use client";

/**
 * Task 6.2 — Página da Bíblia refatorada usando feature biblia
 */
import { useState, useEffect, useRef } from "react";
import {
  BibleReader,
  BibleSearch,
  VersionSelector,
  CrossReferences,
  useBibleChapter,
  useCrossReferences,
  BIBLE_BOOKS,
} from "@/features/biblia";
import type { BibleVersion, BibleVerse } from "@/features/biblia";

const DEFAULT_BOOK = "João";
const DEFAULT_CHAPTER = 3;
const DEFAULT_VERSION: BibleVersion = "ARC";

export default function BibliaPage() {
  const [book, setBook] = useState(DEFAULT_BOOK);
  const [chapter, setChapter] = useState(DEFAULT_CHAPTER);
  const [version, setVersion] = useState<BibleVersion>(DEFAULT_VERSION);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [tab, setTab] = useState<"reader" | "search">("reader");
  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { data, loading, error, load } = useBibleChapter();
  const crossRefs = useCrossReferences();

  // Carrega ao montar e ao mudar livro/capítulo/versão
  useEffect(() => {
    load(version, book, chapter);
    setSelectedVerse(null);
    crossRefs.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, version]);

  // Cross-refs ao selecionar versículo
  useEffect(() => {
    if (!selectedVerse) {
      crossRefs.clear();
      return;
    }
    crossRefs.fetch({
      book,
      chapter,
      verseNumber: selectedVerse.verse,
      text: selectedVerse.text,
      version,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVerse]);

  // Speech synthesis
  function handleSpeak() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!data?.verses.length) return;
    const text = data.verses.map((v) => `Versículo ${v.verse}. ${v.text}`).join(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  function prevChapter() {
    if (chapter > 1) setChapter((c) => c - 1);
  }
  function nextChapter() {
    if (!data || chapter < data.totalChapters) setChapter((c) => c + 1);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Barra de controles */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex flex-wrap items-center gap-2 border-b"
        style={{ background: "var(--bg-primary)", borderColor: "rgba(201,162,39,0.15)" }}
      >
        {/* Livro */}
        <select
          className="text-sm rounded-md px-3 py-1.5"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          value={book}
          onChange={(e) => { setBook(e.target.value); setChapter(1); }}
        >
          {BIBLE_BOOKS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Capítulo */}
        <input
          type="number"
          min={1}
          max={data?.totalChapters ?? 999}
          value={chapter}
          onChange={(e) => setChapter(Math.max(1, Number(e.target.value)))}
          className="w-16 text-sm text-center rounded-md px-2 py-1.5"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />

        {/* Versão */}
        <VersionSelector value={version} onChange={setVersion} />

        {/* Navegação */}
        <div className="flex gap-1 ml-auto">
          <button onClick={prevChapter} disabled={chapter <= 1} className="btn-ghost px-3 py-1.5 text-sm">
            ‹ Ant
          </button>
          <button
            onClick={nextChapter}
            disabled={!!data && chapter >= data.totalChapters}
            className="btn-ghost px-3 py-1.5 text-sm"
          >
            Próx ›
          </button>
          <button onClick={handleSpeak} className="btn-ghost px-3 py-1.5 text-sm" title="Ouvir capítulo">
            {speaking ? "⏹" : "🔊"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div
          className="flex gap-1 p-1 mb-4 rounded-lg w-fit"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
        >
          {(["reader", "search"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-md text-sm transition-all"
              style={{
                fontFamily: "var(--font-cinzel)",
                background: tab === t ? "var(--gold-bg)" : "transparent",
                color: tab === t ? "var(--gold)" : "var(--text-muted)",
                border: tab === t ? "1px solid rgba(201,168,76,0.3)" : "1px solid transparent",
              }}
            >
              {t === "reader" ? "Leitura" : "Busca"}
            </button>
          ))}
        </div>

        {/* Tab: Leitura */}
        {tab === "reader" && (
          <div className="pb-8">
            <BibleReader
              data={data}
              loading={loading}
              error={error}
              selectedVerse={selectedVerse}
              onSelectVerse={setSelectedVerse}
            />

            {/* Cross-refs do versículo selecionado */}
            {selectedVerse && (
              <div className="mt-3">
                <div
                  className="card p-3 mb-2 flex items-center gap-2"
                  style={{ background: "rgba(201,168,76,0.06)" }}
                >
                  <span className="text-xs" style={{ color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>
                    {book} {chapter}:{selectedVerse.verse}
                  </span>
                  <span className="text-sm flex-1" style={{ color: "var(--text)", fontFamily: "var(--font-lora)" }}>
                    {selectedVerse.text}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `"${selectedVerse.text}" — ${book} ${chapter}:${selectedVerse.verse} (${version})`,
                        )
                      }
                      className="text-xs btn-ghost px-2 py-1"
                      title="Copiar"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => setSelectedVerse(null)}
                      className="text-xs btn-ghost px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <CrossReferences
                  references={crossRefs.data?.references ?? []}
                  loading={crossRefs.loading}
                  onClose={() => setSelectedVerse(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab: Busca */}
        {tab === "search" && (
          <div className="pb-8">
            <BibleSearch version={version} />
          </div>
        )}
      </div>
    </div>
  );
}
