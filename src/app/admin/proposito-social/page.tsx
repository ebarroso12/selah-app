"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";
import { AiContentPanel } from "@/features/admin-cms/components/AiContentPanel";

const VIOLET = "#8b5cf6";

interface Social { label: string; url: string }
interface Action { label: string; url: string }
interface Contacts {
  phones: string[];
  whatsapp: { label: string; url: string };
  email: string;
  address?: { line: string; mapsUrl: string };
  social: Social[];
  actions: Action[];
}
interface CauseRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  logo_bg: string;
  website_url: string;
  hook: string;
  founder_story: string[];
  mission: string[];
  services: string[];
  urgency: string[];
  special_note: string | null;
  contacts: Contacts;
  sort_order: number;
}

interface FormState {
  id: string | null;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  logo_bg: string;
  website_url: string;
  hook: string;
  founderText: string;
  missionText: string;
  servicesText: string;
  urgencyText: string;
  special_note: string;
  phonesText: string;
  whatsappLabel: string;
  whatsappUrl: string;
  email: string;
  addressLine: string;
  addressMapsUrl: string;
  social: Social[];
  actions: Action[];
}

const EMPTY_FORM: FormState = {
  id: null, slug: "", name: "", tagline: "", logo_url: "", logo_bg: "#3B1E52", website_url: "",
  hook: "", founderText: "", missionText: "", servicesText: "", urgencyText: "", special_note: "",
  phonesText: "", whatsappLabel: "", whatsappUrl: "", email: "", addressLine: "", addressMapsUrl: "",
  social: [], actions: [],
};

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function rowToForm(r: CauseRow): FormState {
  const c = r.contacts ?? ({} as Contacts);
  return {
    id: r.id, slug: r.slug, name: r.name, tagline: r.tagline,
    logo_url: r.logo_url, logo_bg: r.logo_bg || "#3B1E52", website_url: r.website_url,
    hook: r.hook,
    founderText: (r.founder_story ?? []).join("\n\n"),
    missionText: (r.mission ?? []).join("\n\n"),
    servicesText: (r.services ?? []).join("\n"),
    urgencyText: (r.urgency ?? []).join("\n\n"),
    special_note: r.special_note ?? "",
    phonesText: (c.phones ?? []).join("\n"),
    whatsappLabel: c.whatsapp?.label ?? "", whatsappUrl: c.whatsapp?.url ?? "",
    email: c.email ?? "", addressLine: c.address?.line ?? "", addressMapsUrl: c.address?.mapsUrl ?? "",
    social: c.social ?? [], actions: c.actions ?? [],
  };
}

export default function AdminPropositoSocialPage() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<CauseRow[]>([]);
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
    const { data } = await supabase.from("social_causes").select("*").order("sort_order", { ascending: true });
    setRows((data ?? []) as CauseRow[]);
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
      fd.append("folder", "proposito-social");
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
      supabase.from("social_causes").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("social_causes").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta causa?")) return;
    const { error } = await supabase.from("social_causes").delete().eq("id", id);
    flash(error ? "Erro: " + error.message : "✓ Causa excluída.");
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
      email: form.email.trim(),
      social: form.social.filter((s) => s.url.trim()),
      actions: form.actions.filter((a) => a.url.trim()),
    };
    if (form.addressLine.trim() || form.addressMapsUrl.trim()) {
      contacts.address = { line: form.addressLine.trim(), mapsUrl: form.addressMapsUrl.trim() };
    }

    const maxOrder = rows.reduce((m, r) => Math.max(m, r.sort_order), -1);
    const payload = {
      slug,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      logo_url: form.logo_url.trim(),
      logo_bg: form.logo_bg.trim() || "#3B1E52",
      website_url: form.website_url.trim(),
      hook: form.hook.trim(),
      founder_story: form.founderText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
      mission: form.missionText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
      services: form.servicesText.split("\n").map((s) => s.trim()).filter(Boolean),
      urgency: form.urgencyText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
      special_note: form.special_note.trim() || null,
      contacts,
      updated_at: new Date().toISOString(),
    };

    const { error } = form.id
      ? await supabase.from("social_causes").update(payload).eq("id", form.id)
      : await supabase.from("social_causes").insert({ ...payload, sort_order: maxOrder + 1 });

    setSaving(false);
    if (error) { flash("Erro: " + error.message); return; }
    flash("✓ Causa salva!");
    setForm(null);
    load();
  }

  const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(139,92,246,0.2)", color: "var(--text)" };
  const lbl = "block mb-1 text-[10px] uppercase tracking-widest";
  const lblStyle = { color: "rgba(139,92,246,0.7)" };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: VIOLET }}>Propósito Social</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>Cadastro e ordenação das causas sociais do app.</p>
        </div>
        {!form && (
          <button onClick={() => setForm({ ...EMPTY_FORM })} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.45)", color: VIOLET }}>
            + Nova Causa
          </button>
        )}
      </div>

      {msg && <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: msg.startsWith("✓") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", color: msg.startsWith("✓") ? "#34d399" : "#ef4444" }}>{msg}</p>}

      {form ? (
        <div className="card p-5 space-y-4">
          <p className="text-sm font-bold" style={{ color: VIOLET, fontFamily: "var(--font-cinzel)" }}>
            {form.id ? `Editar: ${form.name}` : "Nova Causa"}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={lbl} style={lblStyle}>Slug {form.id && "(fixo)"}</label>
              <input className={inp} style={inpStyle} value={form.slug} disabled={!!form.id}
                placeholder={slugify(form.name) || "gerado-do-nome"} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div>
              <label className={lbl} style={lblStyle}>Site oficial</label>
              <input className={inp} style={inpStyle} value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={lbl} style={lblStyle}>Cor de fundo do logo</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.logo_bg} onChange={(e) => set("logo_bg", e.target.value)} className="h-9 w-12 rounded" />
                <input className={inp} style={inpStyle} value={form.logo_bg} onChange={(e) => set("logo_bg", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className={lbl} style={lblStyle}>Logo</label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="logo" className="h-16 w-16 object-contain rounded-lg" style={{ background: form.logo_bg }} />
              )}
              <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading}
                className="px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: VIOLET }}>
                {uploading ? "Enviando..." : "📎 Enviar logo"}
              </button>
              <input className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inpStyle} value={form.logo_url}
                placeholder="ou cole uma URL / caminho (/proposito-social/...)" onChange={(e) => set("logo_url", e.target.value)} />
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          <div>
            <label className={lbl} style={lblStyle}>Chamada emocional (hook)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={3} value={form.hook} onChange={(e) => set("hook", e.target.value)} />
          </div>

          {/* A História + IA */}
          <div>
            <label className={lbl} style={lblStyle}>A História (parágrafos separados por linha em branco)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={6} value={form.founderText} onChange={(e) => set("founderText", e.target.value)} />
            <AiContentPanel
              kind="cause"
              name={form.name}
              url={form.website_url}
              acceptLabel="Usar como história"
              onAccept={(paragraphs) => set("founderText", paragraphs.join("\n\n"))}
            />
          </div>

          <div>
            <label className={lbl} style={lblStyle}>A Missão (parágrafos separados por linha em branco)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={4} value={form.missionText} onChange={(e) => set("missionText", e.target.value)} />
          </div>

          <div>
            <label className={lbl} style={lblStyle}>Serviços (um por linha)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={4} value={form.servicesText} onChange={(e) => set("servicesText", e.target.value)} />
          </div>

          <div>
            <label className={lbl} style={lblStyle}>Urgência — por que não pode esperar (parágrafos separados por linha em branco)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={4} value={form.urgencyText} onChange={(e) => set("urgencyText", e.target.value)} />
          </div>

          <div>
            <label className={lbl} style={lblStyle}>Nota especial (opcional)</label>
            <textarea className={inp + " resize-y"} style={inpStyle} rows={3} value={form.special_note} onChange={(e) => set("special_note", e.target.value)} />
          </div>

          {/* Contatos */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: VIOLET, fontFamily: "var(--font-cinzel)" }}>Contatos</p>
            <div>
              <label className={lbl} style={lblStyle}>Telefones (um por linha)</label>
              <textarea className={inp + " resize-y"} style={inpStyle} rows={2} value={form.phonesText} onChange={(e) => set("phonesText", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={lblStyle}>WhatsApp — rótulo</label>
                <input className={inp} style={inpStyle} value={form.whatsappLabel} onChange={(e) => set("whatsappLabel", e.target.value)} />
              </div>
              <div>
                <label className={lbl} style={lblStyle}>WhatsApp — URL</label>
                <input className={inp} style={inpStyle} value={form.whatsappUrl} onChange={(e) => set("whatsappUrl", e.target.value)} placeholder="https://wa.me/..." />
              </div>
            </div>
            <div>
              <label className={lbl} style={lblStyle}>E-mail</label>
              <input className={inp} style={inpStyle} value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={lblStyle}>Endereço</label>
                <input className={inp} style={inpStyle} value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} />
              </div>
              <div>
                <label className={lbl} style={lblStyle}>URL Maps do endereço</label>
                <input className={inp} style={inpStyle} value={form.addressMapsUrl} onChange={(e) => set("addressMapsUrl", e.target.value)} />
              </div>
            </div>

            {/* Redes sociais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={lbl} style={lblStyle}>Redes sociais</label>
                <button type="button" className="text-[11px]" style={{ color: VIOLET }}
                  onClick={() => set("social", [...form.social, { label: "", url: "" }])}>+ Adicionar</button>
              </div>
              {form.social.map((s, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className={inp} style={inpStyle} placeholder="Rótulo" value={s.label}
                    onChange={(e) => set("social", form.social.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <div className="flex gap-1">
                    <input className={inp} style={inpStyle} placeholder="URL" value={s.url}
                      onChange={(e) => set("social", form.social.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                    <button type="button" className="px-2 text-red-500" onClick={() => set("social", form.social.filter((_, j) => j !== i))}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ações (CTAs) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={lbl} style={lblStyle}>Ações / CTAs</label>
                <button type="button" className="text-[11px]" style={{ color: VIOLET }}
                  onClick={() => set("actions", [...form.actions, { label: "", url: "" }])}>+ Adicionar</button>
              </div>
              {form.actions.map((a, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input className={inp} style={inpStyle} placeholder="Rótulo do botão" value={a.label}
                    onChange={(e) => set("actions", form.actions.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <div className="flex gap-1">
                    <input className={inp} style={inpStyle} placeholder="URL" value={a.url}
                      onChange={(e) => set("actions", form.actions.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                    <button type="button" className="px-2 text-red-500" onClick={() => set("actions", form.actions.filter((_, j) => j !== i))}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-bold"
              style={{ background: VIOLET, color: "#fff", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : "Salvar Causa"}
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
                <button onClick={() => reorder(i, -1)} disabled={i === 0} className="text-xs" style={{ color: i === 0 ? "var(--text-subtle)" : VIOLET }}>▲</button>
                <button onClick={() => reorder(i, 1)} disabled={i === rows.length - 1} className="text-xs" style={{ color: i === rows.length - 1 ? "var(--text-subtle)" : VIOLET }}>▼</button>
              </div>
              {r.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.logo_url} alt={r.name} className="h-12 w-12 object-contain rounded-lg shrink-0" style={{ background: r.logo_bg }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{r.name}</p>
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{r.tagline}</p>
              </div>
              <button onClick={() => setForm(rowToForm(r))} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: VIOLET }}>Editar</button>
              <button onClick={() => remove(r.id)} className="text-red-500/60 hover:text-red-500 p-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-center text-sm py-8" style={{ color: "var(--text-subtle)" }}>Nenhuma causa cadastrada.</p>}
        </div>
      )}
    </div>
  );
}
