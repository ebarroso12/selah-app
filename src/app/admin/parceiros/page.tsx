"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";
import { AiContentPanel } from "@/features/admin-cms/components/AiContentPanel";

const GOLD = "#B87333";

interface Address { label: string; line: string; mapsUrl: string }
interface Social { label: string; url: string }
interface Contacts {
  phones: string[];
  whatsapp: { label: string; url: string };
  email?: string;
  addresses: Address[];
  hours: string;
  social: Social[];
}
interface PartnerRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  website_url: string;
  summary: string[];
  areas: string[];
  google_review_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  video_caption: string | null;
  contacts: Contacts;
  sort_order: number;
}

interface FormState {
  id: string | null;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  website_url: string;
  summaryText: string;
  areasText: string;
  google_review_url: string;
  video_url: string;
  video_thumbnail_url: string;
  video_caption: string;
  phonesText: string;
  whatsappLabel: string;
  whatsappUrl: string;
  email: string;
  hours: string;
  addresses: Address[];
  social: Social[];
}

const EMPTY_FORM: FormState = {
  id: null, slug: "", name: "", tagline: "", logo_url: "", website_url: "",
  summaryText: "", areasText: "", google_review_url: "",
  video_url: "", video_thumbnail_url: "", video_caption: "",
  phonesText: "", whatsappLabel: "", whatsappUrl: "", email: "", hours: "",
  addresses: [], social: [],
};

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function rowToForm(r: PartnerRow): FormState {
  const c = r.contacts ?? ({} as Contacts);
  return {
    id: r.id, slug: r.slug, name: r.name, tagline: r.tagline,
    logo_url: r.logo_url, website_url: r.website_url,
    summaryText: (r.summary ?? []).join("\n\n"),
    areasText: (r.areas ?? []).join("\n"),
    google_review_url: r.google_review_url ?? "",
    video_url: r.video_url ?? "", video_thumbnail_url: r.video_thumbnail_url ?? "",
    video_caption: r.video_caption ?? "",
    phonesText: (c.phones ?? []).join("\n"),
    whatsappLabel: c.whatsapp?.label ?? "", whatsappUrl: c.whatsapp?.url ?? "",
    email: c.email ?? "", hours: c.hours ?? "",
    addresses: c.addresses ?? [], social: c.social ?? [],
  };
}

export default function AdminParceirosPage() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 3500); };
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("partners").select("*").order("sort_order", { ascending: true });
    setRows((data ?? []) as PartnerRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "parceiros");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) { set("logo_url", json.url); flash("✓ Logo enviado!"); }
      else flash("Erro no upload: " + (json.error || "desconhecido"));
    } finally { setUploading(false); }
  }

  async function reorder(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index], b = rows[target];
    await Promise.all([
      supabase.from("partners").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("partners").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este parceiro?")) return;
    const { error } = await supabase.from("partners").delete().eq("id", id);
    flash(error ? "Erro: " + error.message : "✓ Parceiro excluído.");
    load();
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim()) { flash("Nome é obrigatório."); return; }
    const slug = (form.slug.trim() || slugify(form.name));
    setSaving(true);
    const contacts: Contacts = {
      phones: form.phonesText.split("\n").map((s) => s.trim()).filter(Boolean),
      whatsapp: { label: form.whatsappLabel.trim(), url: form.whatsappUrl.trim() },
      addresses: form.addresses.filter((a) => a.line.trim() || a.label.trim()),
      hours: form.hours.trim(),
      social: form.social.filter((s) => s.url.trim()),
    };
    if (form.email.trim()) contacts.email = form.email.trim();

    const maxOrder = rows.reduce((m, r) => Math.max(m, r.sort_order), -1);
    const payload = {
      slug,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      logo_url: form.logo_url.trim(),
      website_url: form.website_url.trim(),
      summary: form.summaryText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
      areas: form.areasText.split("\n").map((s) => s.trim()).filter(Boolean),
      google_review_url: form.google_review_url.trim() || null,
      video_url: form.video_url.trim() || null,
      video_thumbnail_url: form.video_thumbnail_url.trim() || null,
      video_caption: form.video_caption.trim() || null,
      contacts,
      updated_at: new Date().toISOString(),
    };

    const { error } = form.id
      ? await supabase.from("partners").update(payload).eq("id", form.id)
      : await supabase.from("partners").insert({ ...payload, sort_order: maxOrder + 1 });

    setSaving(false);
    if (error) { flash("Erro: " + error.message); return; }
    flash("✓ Parceiro salvo!");
    setForm(null);
    load();
  }

  const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(184,115,51,0.2)", color: "var(--text)" };
  const lbl = "block mb-1 text-[10px] uppercase tracking-widest";
  const lblStyle = { color: "rgba(184,115,51,0.7)" };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: GOLD }}>Parceiros</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>Cadastro, ordenação e apresentação dos parceiros do app.</p>
        </div>
        {!form && (
          <button onClick={() => setForm({ ...EMPTY_FORM })} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "rgba(184,115,51,0.18)", border: "1px solid rgba(184,115,51,0.45)", color: GOLD }}>
            + Novo Parceiro
          </button>
        )}
      </div>

      {msg && <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: msg.startsWith("✓") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}

      {form ? (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-bold" style={{ color: GOLD, fontFamily: "var(--font-cinzel)" }}>
            {form.id ? `Editar: ${form.name}` : "Novo Parceiro"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl} style={lblStyle}>Nome *</label>
              <input className={inp} style={inpStyle} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={lbl} style={lblStyle}>Tagline</label>
              <input className={inp} style={inpStyle} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl} style={lblStyle}>Slug {form.id && "(fixo)"}</label>
              <input className={inp} style={inpStyle} value={form.slug} disabled={!!form.id}
                placeholder={slugify(form.name) || "gerado-do-nome"} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div>
              <label className={lbl} style={lblStyle}>Site oficial</label>
              <input className={inp} style={inpStyle} value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className={lbl} style={lblStyle}>Logo</label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="logo" className="h-16 w-16 object-contain rounded-lg" style={{ background: "#F7F5F1" }} />
              )}
              <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading}
                className="px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(184,115,51,0.12)", border: "1px solid rgba(184,115,51,0.3)", color: GOLD }}>
                {uploading ? "Enviando..." : "📎 Enviar logo"}
              </button>
              <input className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inpStyle} value={form.logo_url}
                placeholder="ou cole uma URL / caminho (/parceiros/...)" onChange={(e) => set("logo_url", e.target.value)} />
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          {/* Apresentação + IA */}
          <div>
            <label className={lbl} style={lblStyle}>Apresentação (parágrafos separados por linha em branco)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={8} value={form.summaryText} onChange={(e) => set("summaryText", e.target.value)} />
            <AiContentPanel
              kind="partner"
              name={form.name}
              url={form.website_url}
              acceptLabel="Usar como apresentação"
              onAccept={(paragraphs) => set("summaryText", paragraphs.join("\n\n"))}
            />
          </div>

          <div>
            <label className={lbl} style={lblStyle}>Áreas de atuação (uma por linha)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={4} value={form.areasText} onChange={(e) => set("areasText", e.target.value)} />
          </div>

          <div>
            <label className={lbl} style={lblStyle}>URL de avaliação no Google (opcional)</label>
            <input className={inp} style={inpStyle} value={form.google_review_url} onChange={(e) => set("google_review_url", e.target.value)} placeholder="https://g.page/..." />
          </div>

          {/* Vídeo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={lbl} style={lblStyle}>Vídeo — URL</label>
              <input className={inp} style={inpStyle} value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://instagram.com/reel/..." />
            </div>
            <div>
              <label className={lbl} style={lblStyle}>Vídeo — thumbnail</label>
              <input className={inp} style={inpStyle} value={form.video_thumbnail_url} onChange={(e) => set("video_thumbnail_url", e.target.value)} />
            </div>
            <div>
              <label className={lbl} style={lblStyle}>Vídeo — legenda</label>
              <input className={inp} style={inpStyle} value={form.video_caption} onChange={(e) => set("video_caption", e.target.value)} />
            </div>
          </div>

          {/* Contatos */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: GOLD, fontFamily: "var(--font-cinzel)" }}>Contatos</p>
            <div>
              <label className={lbl} style={lblStyle}>Telefones (um por linha)</label>
              <textarea className={inp + " resize-y"} style={inpStyle} rows={3} value={form.phonesText} onChange={(e) => set("phonesText", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={lblStyle}>WhatsApp — rótulo do botão</label>
                <input className={inp} style={inpStyle} value={form.whatsappLabel} onChange={(e) => set("whatsappLabel", e.target.value)} />
              </div>
              <div>
                <label className={lbl} style={lblStyle}>WhatsApp — URL</label>
                <input className={inp} style={inpStyle} value={form.whatsappUrl} onChange={(e) => set("whatsappUrl", e.target.value)} placeholder="https://wa.me/..." />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={lblStyle}>E-mail</label>
                <input className={inp} style={inpStyle} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className={lbl} style={lblStyle}>Horário de atendimento</label>
                <input className={inp} style={inpStyle} value={form.hours} onChange={(e) => set("hours", e.target.value)} />
              </div>
            </div>

            {/* Endereços */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={lbl} style={lblStyle}>Endereços</label>
                <button type="button" className="text-[11px]" style={{ color: GOLD }}
                  onClick={() => set("addresses", [...form.addresses, { label: "", line: "", mapsUrl: "" }])}>+ Adicionar</button>
              </div>
              {form.addresses.map((a, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <input className={inp} style={inpStyle} placeholder="Rótulo" value={a.label}
                    onChange={(e) => set("addresses", form.addresses.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <input className={inp} style={inpStyle} placeholder="Endereço" value={a.line}
                    onChange={(e) => set("addresses", form.addresses.map((x, j) => j === i ? { ...x, line: e.target.value } : x))} />
                  <div className="flex gap-1">
                    <input className={inp} style={inpStyle} placeholder="URL Maps" value={a.mapsUrl}
                      onChange={(e) => set("addresses", form.addresses.map((x, j) => j === i ? { ...x, mapsUrl: e.target.value } : x))} />
                    <button type="button" className="px-2 text-red-500" onClick={() => set("addresses", form.addresses.filter((_, j) => j !== i))}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Redes sociais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={lbl} style={lblStyle}>Redes sociais</label>
                <button type="button" className="text-[11px]" style={{ color: GOLD }}
                  onClick={() => set("social", [...form.social, { label: "", url: "" }])}>+ Adicionar</button>
              </div>
              {form.social.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className={inp} style={inpStyle} placeholder="Rótulo (ex: Instagram)" value={s.label}
                    onChange={(e) => set("social", form.social.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <div className="flex gap-1">
                    <input className={inp} style={inpStyle} placeholder="URL" value={s.url}
                      onChange={(e) => set("social", form.social.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                    <button type="button" className="px-2 text-red-500" onClick={() => set("social", form.social.filter((_, j) => j !== i))}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-bold"
              style={{ background: GOLD, color: "#fff", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : "Salvar Parceiro"}
            </button>
            <button onClick={() => setForm(null)} className="flex-1 py-2 rounded-lg text-sm"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : loading ? (
        <p className="text-center text-sm" style={{ color: "var(--text-subtle)" }}>Carregando...</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.id} className="card p-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={() => reorder(i, -1)} disabled={i === 0} className="text-xs" style={{ color: i === 0 ? "var(--text-subtle)" : GOLD }}>▲</button>
                <button onClick={() => reorder(i, 1)} disabled={i === rows.length - 1} className="text-xs" style={{ color: i === rows.length - 1 ? "var(--text-subtle)" : GOLD }}>▼</button>
              </div>
              {r.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.logo_url} alt={r.name} className="h-12 w-12 object-contain rounded-lg shrink-0" style={{ background: "#F7F5F1" }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{r.name}</p>
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{r.tagline}</p>
              </div>
              <button onClick={() => setForm(rowToForm(r))} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(184,115,51,0.12)", border: "1px solid rgba(184,115,51,0.3)", color: GOLD }}>Editar</button>
              <button onClick={() => remove(r.id)} className="text-red-500/60 hover:text-red-500 p-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-center text-sm py-8" style={{ color: "var(--text-subtle)" }}>Nenhum parceiro cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
