"use client";

import { useState } from "react";

const BIBLE_VERSIONS = [
  { code: "NVI", label: "Nova Versão Internacional" },
  { code: "ARA", label: "Almeida Revista e Atualizada" },
  { code: "ACF", label: "Almeida Corrigida Fiel" },
  { code: "NAA", label: "Nova Almeida Atualizada" },
  { code: "KJA", label: "King James Atualizada" },
  { code: "NTLH", label: "Linguagem de Hoje" },
  { code: "NVT", label: "Nova Versão Transformadora" },
  { code: "KJV", label: "King James Version (EN)" },
  { code: "ESV", label: "English Standard Version" },
];

const BIBLE_BOOKS = [
  "Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute",
  "1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras",
  "Neemias","Ester","Jó","Salmos","Provérbios","Eclesiastes","Cânticos","Isaías",
  "Jeremias","Lamentações","Ezequiel","Daniel","Oseias","Joel","Amós","Obadias",
  "Jonas","Miqueias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias",
  "Mateus","Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios",
  "Gálatas","Efésios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses",
  "1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus","Tiago","1 Pedro","2 Pedro",
  "1 João","2 João","3 João","Judas","Apocalipse",
];

export default function BibliaPage() {
  const [book, setBook] = useState("João");
  const [chapter, setChapter] = useState("3");
  const [version, setVersion] = useState("NVI");

  const iframeUrl = `https://eden-de-volta-ao-principio.vercel.app/?book=${encodeURIComponent(book)}&chapter=${chapter}&version=${version}`;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b flex flex-wrap gap-3 items-center"
        style={{ borderColor: "rgba(201,162,39,0.12)", background: "rgba(8,13,26,0.8)" }}>

        <div className="flex items-center gap-2">
          <label className="label" htmlFor="book" style={{ marginBottom: 0 }}>Livro</label>
          <select id="book" className="input-field py-1.5 text-sm w-36"
            value={book} onChange={(e) => setBook(e.target.value)}>
            {BIBLE_BOOKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="label" htmlFor="chapter" style={{ marginBottom: 0 }}>Cap.</label>
          <input id="chapter" type="number" min={1} max={150}
            className="input-field py-1.5 text-sm w-16 text-center"
            value={chapter} onChange={(e) => setChapter(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <label className="label" htmlFor="version" style={{ marginBottom: 0 }}>Versão</label>
          <select id="version" className="input-field py-1.5 text-sm w-44"
            value={version} onChange={(e) => setVersion(e.target.value)}>
            {BIBLE_VERSIONS.map((v) => (
              <option key={v.code} value={v.code}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bible content placeholder — será conectado à API bíblica */}
      <div className="flex-1 p-6 max-w-3xl w-full mx-auto">
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">{book} {chapter}</h2>
            <span className="badge badge-gold">{version}</span>
          </div>

          <div className="space-y-1 rounded-lg p-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,162,39,0.08)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Conecte a API bíblica nas variáveis de ambiente para carregar o conteúdo.
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "var(--font-cinzel)" }}>
              Configure BIBLE_API_KEY no .env.local
            </p>
          </div>

          <div className="mt-8 p-5 rounded-xl"
            style={{ background: "rgba(201,162,39,0.04)", border: "1px solid rgba(201,162,39,0.12)" }}>
            <p className="text-xs mb-2"
              style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Recurso
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              A leitura bíblica completa com interlinear, exegese e mapas estará disponível
              após a integração com a API bíblica na Fase 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
