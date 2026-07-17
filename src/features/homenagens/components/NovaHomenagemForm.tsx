"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNewHomenagem } from "../hooks/useNewHomenagem";
import { useRewriteText } from "../hooks/useRewriteText";

const LIMITE = 2000;

export function NovaHomenagemForm() {
  const router = useRouter();
  const { submit, loading, error: submitError } = useNewHomenagem();
  const { rewrite, loading: reescrevendo, error: erroIA } = useRewriteText();

  const [autorNome, setAutorNome] = useState("");
  const [autorInstagram, setAutorInstagram] = useState("");
  const [homenageadoNome, setHomenageadoNome] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [homenageadoInstagram, setHomenageadoInstagram] = useState("");
  const [ehLegendario, setEhLegendario] = useState<"sim" | "nao" | "">("");
  const [numeroLegendario, setNumeroLegendario] = useState("");
  const [texto, setTexto] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotoCapa, setFotoCapa] = useState<0 | 1>(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");
  const inputFoto = useRef<HTMLInputElement>(null);

  const caracteres = texto.length;
  const ultrapassou = caracteres > LIMITE;

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 2);
    const validas = files.filter((f) => f.size <= 2 * 1024 * 1024);
    if (validas.length < files.length) setValidationError("Cada foto deve ter no máximo 2MB.");
    setFotos(validas);
    setPreviews(validas.map((f) => URL.createObjectURL(f)));
    setFotoCapa(0);
  }

  async function handleReescrever() {
    if (!texto.trim()) return;
    const reescrito = await rewrite(texto);
    if (reescrito) setTexto(reescrito);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");
    if (!autorNome || !autorInstagram || !homenageadoNome || !parentesco || !texto) {
      setValidationError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (ultrapassou) {
      setValidationError("O texto ultrapassa 2.000 caracteres. Use a IA para reduzir.");
      return;
    }

    const ok = await submit({
      autorNome,
      autorInstagram,
      autorLendarioNumero: numeroLegendario,
      homenageadoNome,
      homenageadoParentesco: parentesco,
      homenageadoInstagram,
      homenageadoLegendario: ehLegendario === "sim",
      texto,
      fotos,
      fotoCapa,
    });

    if (ok) router.push("/homenagens");
  }

  const displayError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quem homenageia */}
      <div className="card p-5 space-y-4" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
        <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
          Quem homenageia
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>Nome completo *</label>
            <input
              className="input-field"
              value={autorNome}
              onChange={(e) => setAutorNome(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>Instagram *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--gold-label)" }}>@</span>
              <input
                className="input-field pl-7"
                value={autorInstagram}
                onChange={(e) => setAutorInstagram(e.target.value.replace("@", ""))}
                placeholder="seuinstagram"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Homenageado(a) */}
      <div className="card p-5 space-y-4" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
        <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
          Quem é homenageado(a)
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>Nome completo *</label>
            <input className="input-field" value={homenageadoNome} onChange={(e) => setHomenageadoNome(e.target.value)} placeholder="Nome da pessoa homenageada" required />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>Parentesco / Relação *</label>
            <input className="input-field" value={parentesco} onChange={(e) => setParentesco(e.target.value)} placeholder="Ex: Esposa, Mãe, Filho..." required />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>Instagram (opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--gold-label)" }}>@</span>
              <input className="input-field pl-7" value={homenageadoInstagram} onChange={(e) => setHomenageadoInstagram(e.target.value.replace("@", ""))} placeholder="instagram (opcional)" />
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>É Legendário?</label>
            <div className="flex gap-3">
              {(["sim", "nao"] as const).map((op) => (
                <button key={op} type="button" onClick={() => setEhLegendario(op)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: ehLegendario === op ? "rgba(217,119,6,0.3)" : "var(--bg-2)",
                    border: ehLegendario === op ? "1px solid rgba(245,158,11,0.6)" : "1px solid var(--bg-2)",
                    color: ehLegendario === op ? "#f59e0b" : "var(--text-subtle)",
                    fontFamily: "var(--font-cinzel)",
                  }}>
                  {op === "sim" ? "Sim" : "Não"}
                </button>
              ))}
            </div>
          </div>
          {ehLegendario === "sim" && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>Número do Legendário</label>
              <input className="input-field" value={numeroLegendario} onChange={(e) => setNumeroLegendario(e.target.value)} placeholder="Ex: 00001" type="number" min="1" />
            </div>
          )}
        </div>
      </div>

      {/* Fotos */}
      <div className="card p-5 space-y-4" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
        <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
          Fotos <span style={{ color: "var(--text-subtle)", fontFamily: "sans-serif", fontSize: "0.65rem", textTransform: "none" }}>(máx. 2 · 2MB cada)</span>
        </p>
        <input ref={inputFoto} type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
        <button type="button" onClick={() => inputFoto.current?.click()}
          className="w-full py-3 rounded-xl text-xs font-semibold"
          style={{ background: "var(--bg-2)", border: "1px dashed rgba(201,162,39,0.3)", color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
          Clique para selecionar fotos
        </button>
        {previews.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Selecione a foto de capa:</p>
            <div className="grid grid-cols-2 gap-3">
              {previews.map((src, i) => (
                <div key={i} onClick={() => setFotoCapa(i as 0 | 1)}
                  className="relative cursor-pointer rounded-xl overflow-hidden"
                  style={{ border: fotoCapa === i ? "2px solid #f0c040" : "2px solid var(--bg-2)", aspectRatio: "16/9" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {fotoCapa === i && (
                    <div className="absolute top-1 right-1 rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ background: "#f0c040", color: "#0a0a0a", fontSize: "0.6rem", fontFamily: "var(--font-cinzel)" }}>
                      CAPA
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="card p-5 space-y-3" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            Texto da homenagem *
          </p>
          <span className="text-xs font-semibold" style={{ color: ultrapassou ? "#ef4444" : "var(--text-subtle)" }}>
            {caracteres}/{LIMITE}
          </span>
        </div>
        <textarea
          className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
          style={{ background: "var(--bg-2)", border: ultrapassou ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(201,162,39,0.2)", color: "var(--cream)", minHeight: 220 }}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva sua homenagem aqui..."
          required
        />
        {ultrapassou && (
          <div className="space-y-2">
            <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.9)" }}>
              Texto com <strong>{caracteres - LIMITE}</strong> caracteres acima do limite.
            </p>
            <button type="button" onClick={handleReescrever} disabled={reescrevendo}
              className="w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)", border: "1px solid rgba(139,92,246,0.4)", color: "#a78bfa", fontFamily: "var(--font-cinzel)" }}>
              {reescrevendo ? "Reescrevendo..." : "Reescrever com IA (máx. 2.000 caracteres)"}
            </button>
            {erroIA && <p className="text-xs text-center" style={{ color: "#ef4444" }}>{erroIA}</p>}
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-xs text-center px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
          {displayError}
        </p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl text-xs font-semibold"
          style={{ background: "var(--bg-2)", border: "1px solid var(--bg-2)", color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading || ultrapassou}
          className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: loading || ultrapassou ? "rgba(201,162,39,0.2)" : "linear-gradient(135deg, #c9a227 0%, #f0c040 100%)",
            color: loading || ultrapassou ? "var(--gold-label)" : "#0a0a0a",
            fontFamily: "var(--font-cinzel)",
          }}>
          {loading ? "Publicando..." : "Publicar Homenagem"}
        </button>
      </div>
    </form>
  );
}
