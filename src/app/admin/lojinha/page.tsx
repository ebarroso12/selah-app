"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import type { LojinhaProduct } from "@/features/lojinha/products";

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text)",
};
const labelStyle = {
  color: "var(--gold-label)",
  fontFamily: "var(--font-cinzel)",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  fontSize: "0.7rem",
};

const emptyProduct: LojinhaProduct = {
  name: "",
  price: "",
  discount: "",
  sold: "",
  image: "",
  link: "",
};

export default function AdminLojinhaPage() {
  const [products, setProducts] = useState<LojinhaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/lojinha");
      const json = await res.json();
      if (json.products) {
        setProducts(json.products);
        setIsCustom(json.is_custom);
      }
    } catch {
      setMsg("Erro ao carregar produtos");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  }

  function update(i: number, field: keyof LojinhaProduct, value: string) {
    setProducts((ps) => ps.map((p, j) => (j === i ? { ...p, [field]: value } : p)));
  }

  function move(i: number, dir: -1 | 1) {
    setProducts((ps) => {
      const next = [...ps];
      const j = i + dir;
      if (j < 0 || j >= next.length) return ps;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(i: number) {
    setProducts((ps) => ps.filter((_, j) => j !== i));
  }

  function add() {
    setProducts((ps) => (ps.length >= 12 ? ps : [...ps, { ...emptyProduct }]));
  }

  async function save() {
    for (const [i, p] of products.entries()) {
      if (!p.name.trim()) return flash(`Produto ${i + 1}: informe o nome`);
      if (!p.image.startsWith("http")) return flash(`Produto ${i + 1}: informe a URL da imagem (https://...)`);
    }
    if (products.length === 0) return flash("Adicione pelo menos 1 produto");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/lojinha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const json = await res.json();
      if (json.ok) {
        setIsCustom(true);
        flash("Destaques salvos! Já estão no ar na Lojinha.");
      } else {
        flash("Erro: " + (json.error || "desconhecido"));
      }
    } catch {
      flash("Erro ao salvar");
    }
    setSaving(false);
  }

  async function restoreDefaults() {
    if (!confirm("Restaurar os produtos padrão? Suas edições serão perdidas.")) return;
    setSaving(true);
    try {
      await fetch("/api/admin/lojinha", { method: "DELETE" });
      await load();
      flash("Produtos padrão restaurados.");
    } catch {
      flash("Erro ao restaurar");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <p className="text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
          Admin
        </p>
        <h1 className="text-2xl">Destaques da Lojinha</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Edite os livros que aparecem na vitrine da Lojinha. Nome e imagem são
          obrigatórios; os demais campos são opcionais. Máximo de 12 produtos.
          {isCustom ? " (personalizado)" : " (usando padrão)"}
        </p>
      </div>

      {msg && (
        <div className="card p-3">
          <p className="text-sm" style={{ color: "var(--gold)" }}>{msg}</p>
        </div>
      )}

      <div className="space-y-4">
        {products.map((p, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)" }}>
                Produto {i + 1}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => move(i, -1)} disabled={i === 0} title="Mover para cima"
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", opacity: i === 0 ? 0.4 : 1 }}>
                  Subir
                </button>
                <button onClick={() => move(i, 1)} disabled={i === products.length - 1} title="Mover para baixo"
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", opacity: i === products.length - 1 ? 0.4 : 1 }}>
                  Descer
                </button>
                <button onClick={() => remove(i)} title="Remover produto"
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", cursor: "pointer" }}>
                  Remover
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              {/* Preview da imagem */}
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0"
                style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                {p.image.startsWith("http") && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.image} alt={p.name || "produto"} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Nome *</label>
                  <input className={inp} style={inpStyle} value={p.name}
                    placeholder="Ex: Bíblia do Homem"
                    onChange={(e) => update(i, "name", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Preço</label>
                  <input className={inp} style={inpStyle} value={p.price}
                    placeholder="Ex: R$ 59,90"
                    onChange={(e) => update(i, "price", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Desconto</label>
                  <input className={inp} style={inpStyle} value={p.discount}
                    placeholder="Ex: -11% (opcional)"
                    onChange={(e) => update(i, "discount", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Vendidos</label>
                  <input className={inp} style={inpStyle} value={p.sold}
                    placeholder="Ex: 120 vendidos (opcional)"
                    onChange={(e) => update(i, "sold", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Link do produto</label>
                  <input className={inp} style={inpStyle} value={p.link}
                    placeholder="Vazio = lojinha completa"
                    onChange={(e) => update(i, "link", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>URL da imagem *</label>
                  <input className={inp} style={inpStyle} value={p.image}
                    placeholder="https://... (botão direito na foto do produto > copiar endereço da imagem)"
                    onChange={(e) => update(i, "image", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={add} disabled={products.length >= 12}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}>
          Adicionar produto
        </button>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? "Salvando..." : "Salvar destaques"}
        </button>
        <button onClick={restoreDefaults} disabled={saving}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}>
          Restaurar padrão
        </button>
      </div>

      <div className="card p-4">
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Dica: para adicionar um livro da sua lojinha Collshp/Shopee (ex: Bíblia do
          Homem, Bíblia da Mulher, Bíblia Plenitude), abra o produto na loja, copie o
          endereço da imagem da capa (botão direito na foto) e cole aqui junto com nome,
          preço e o link do produto. As mudanças aparecem na hora para todos os usuários.
        </p>
      </div>
    </div>
  );
}
