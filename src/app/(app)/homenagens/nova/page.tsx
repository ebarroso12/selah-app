"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const LIMITE = 2000;

export default function NovaHomenagem() {
  const router = useRouter();

  // Quem homenageia
  const [nomeHomenageante, setNomeHomenageante] = useState("");
  const [igHomenageante, setIgHomenageante] = useState("");

  // Homenageado(a)
  const [nomeHomenageado, setNomeHomenageado] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [igHomenageado, setIgHomenageado] = useState("");
  const [ehLegendario, setEhLegendario] = useState<"sim" | "nao" | "">("");
  const [numeroLegendario, setNumeroLegendario] = useState("");

  // Texto
  const [texto, setTexto] = useState("");
  const [reescrevendo, setReescrevendo] = useState(false);
  const [erroIA, setErroIA] = useState("");

  // Fotos
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotoCapa, setFotoCapa] = useState<0 | 1>(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputFoto = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const caracteres = texto.length;
  const ultrapassou = caracteres > LIMITE;

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 2);
    const validas = files.filter((f) => f.size <= 2 * 1024 * 1024);
    if (validas.length < files.length) {
      setErro("Cada foto deve ter no máximo 2MB.");
    }
    setFotos(validas);
    setPreviews(validas.map((f) => URL.createObjectURL(f)));
    setFotoCapa(0);
  }

  async function handleReescrever() {
    if (!texto.trim()) return;
    setReescrevendo(true);
    setErroIA("");
    try {
      const res = await fetch("/api/homenagens/reescrever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      if (data.texto) {
        setTexto(data.texto);
      } else {
        setErroIA("Não foi possível reescrever. Tente novamente.");
      }
    } catch {
      setErroIA("Erro de conexão com a IA.");
    } finally {
      setReescrevendo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nomeHomenageante || !igHomenageante || !nomeHomenageado || !parentesco || !texto) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (ultrapassou) {
      setErro("O texto ultrapassa 2.000 caracteres. Use a IA para reduzir.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nomeHomenageante", nomeHomenageante);
      formData.append("igHomenageante", igHomenageante);
      formData.append("nomeHomenageado", nomeHomenageado);
      formData.append("parentesco", parentesco);
      formData.append("igHomenageado", igHomenageado);
      formData.append("ehLegendario", ehLegendario);
      formData.append("numeroLegendario", numeroLegendario);
      formData.append("texto", texto);
      formData.append("fotoCapa", String(fotoCapa));
      fotos.forEach((f, i) => formData.append(`foto${i}`, f));

      const res = await fetch("/api/homenagens", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Erro ao salvar homenagem.");

      router.push("/homenagens");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-xl tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
          Nova Homenagem
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(245,242,235,0.4)", fontFamily: "var(--font-cinzel)" }}>
          Famílias dos Legendários
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quem homenageia */}
        <div className="card p-5 space-y-4" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
          <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            Quem homenageia
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>Nome completo *</label>
              <input
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--cream)" }}
                value={nomeHomenageante}
                onChange={(e) => setNomeHomenageante(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>Instagram *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(201,162,39,0.6)" }}>@</span>
                <input
                  className="w-full pl-7 pr-4 py-2 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--cream)" }}
                  value={igHomenageante}
                  onChange={(e) => setIgHomenageante(e.target.value.replace("@", ""))}
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
              <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>Nome completo *</label>
              <input
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--cream)" }}
                value={nomeHomenageado}
                onChange={(e) => setNomeHomenageado(e.target.value)}
                placeholder="Nome da pessoa homenageada"
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>Parentesco / Relação *</label>
              <input
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--cream)" }}
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                placeholder="Ex: Esposa, Mãe, Filho, Pai..."
                required
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>Instagram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(201,162,39,0.6)" }}>@</span>
                <input
                  className="w-full pl-7 pr-4 py-2 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--cream)" }}
                  value={igHomenageado}
                  onChange={(e) => setIgHomenageado(e.target.value.replace("@", ""))}
                  placeholder="instagram da pessoa (opcional)"
                />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>É Legendário?</label>
              <div className="flex gap-3">
                {(["sim", "nao"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setEhLegendario(op)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: ehLegendario === op ? "rgba(217,119,6,0.3)" : "rgba(255,255,255,0.04)",
                      border: ehLegendario === op ? "1px solid rgba(245,158,11,0.6)" : "1px solid rgba(255,255,255,0.1)",
                      color: ehLegendario === op ? "#f59e0b" : "rgba(245,242,235,0.5)",
                      fontFamily: "var(--font-cinzel)",
                    }}
                  >
                    {op === "sim" ? "Sim" : "Não"}
                  </button>
                ))}
              </div>
            </div>
            {ehLegendario === "sim" && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: "rgba(245,242,235,0.5)" }}>Número do Legendário</label>
                <input
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--cream)" }}
                  value={numeroLegendario}
                  onChange={(e) => setNumeroLegendario(e.target.value)}
                  placeholder="Ex: 00001"
                  type="number"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Fotos */}
        <div className="card p-5 space-y-4" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
          <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
            Fotos <span style={{ color: "rgba(245,242,235,0.35)", fontFamily: "sans-serif", fontSize: "0.65rem", textTransform: "none" }}>(máx. 2 fotos · 2MB cada · proporção 16:9 ideal)</span>
          </p>
          <input ref={inputFoto} type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
          <button
            type="button"
            onClick={() => inputFoto.current?.click()}
            className="w-full py-3 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(201,162,39,0.3)", color: "rgba(245,242,235,0.5)", fontFamily: "var(--font-cinzel)" }}
          >
            Clique para selecionar fotos
          </button>
          {previews.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "rgba(245,242,235,0.4)" }}>Selecione a foto de capa (destaque):</p>
              <div className="grid grid-cols-2 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setFotoCapa(i as 0 | 1)}
                    className="relative cursor-pointer rounded-xl overflow-hidden"
                    style={{
                      border: fotoCapa === i ? "2px solid #f0c040" : "2px solid rgba(255,255,255,0.1)",
                      aspectRatio: "16/9",
                    }}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {fotoCapa === i && (
                      <div
                        className="absolute top-1 right-1 rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ background: "#f0c040", color: "#0a0a0a", fontSize: "0.6rem", fontFamily: "var(--font-cinzel)" }}
                      >
                        CAPA
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Texto da homenagem */}
        <div className="card p-5 space-y-3" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
              Texto da homenagem *
            </p>
            <span
              className="text-xs font-semibold"
              style={{ color: ultrapassou ? "#ef4444" : "rgba(245,242,235,0.4)" }}
            >
              {caracteres}/{LIMITE}
            </span>
          </div>
          <textarea
            className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: ultrapassou ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(201,162,39,0.2)",
              color: "var(--cream)",
              minHeight: 220,
            }}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva sua homenagem aqui..."
            required
          />

          {/* Botão IA — aparece quando ultrapassa 2000 */}
          {ultrapassou && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs" style={{ color: "rgba(239,68,68,0.9)" }}>
                  Texto com <strong>{caracteres - LIMITE}</strong> caracteres acima do limite. Use a IA para reduzir.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReescrever}
                disabled={reescrevendo}
                className="w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: reescrevendo ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#a78bfa",
                  fontFamily: "var(--font-cinzel)",
                  letterSpacing: "0.05em",
                }}
              >
                {reescrevendo ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reescrevendo com IA...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Reescrever com IA (máx. 2.000 caracteres)
                  </>
                )}
              </button>
              {erroIA && <p className="text-xs text-center" style={{ color: "#ef4444" }}>{erroIA}</p>}
            </div>
          )}
        </div>

        {erro && (
          <p className="text-xs text-center px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            {erro}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(245,242,235,0.5)", fontFamily: "var(--font-cinzel)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || ultrapassou}
            className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: loading || ultrapassou ? "rgba(201,162,39,0.2)" : "linear-gradient(135deg, #c9a227 0%, #f0c040 100%)",
              color: loading || ultrapassou ? "rgba(201,162,39,0.5)" : "#0a0a0a",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "Publicando..." : "Publicar Homenagem"}
          </button>
        </div>
      </form>
    </div>
  );
}
