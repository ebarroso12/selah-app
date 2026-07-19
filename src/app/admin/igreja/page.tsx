"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/shared/services/supabase/supabase.browser";

interface ChurchInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  pastor: string;
  description: string;
  logo_url: string;
  photo_url: string;
  service_times: string;
}

const emptyChurch: ChurchInfo = {
  name: "",
  address: "",
  city: "",
  state: "",
  phone: "",
  pastor: "",
  description: "",
  logo_url: "",
  photo_url: "",
  service_times: "",
};

const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(184,115,51,0.2)", color: "var(--text)" };
const labelStyle = { color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", textTransform: "uppercase" as const, fontSize: "0.7rem" };

export default function AdminIgrejaPage() {
  const supabase = getBrowserClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"membros" | "info">("membros");
  const [church, setChurch] = useState<ChurchInfo>({ ...emptyChurch });
  const [savingChurch, setSavingChurch] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });
    setMembers(data ?? []);

    // Tentar carregar info da igreja
    const { data: churchData } = await supabase
      .from("church_info")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (churchData) {
      setChurch({
        id: churchData.id,
        name: churchData.name || "",
        address: churchData.address || "",
        city: churchData.city || "",
        state: churchData.state || "",
        phone: churchData.phone || "",
        pastor: churchData.pastor || "",
        description: churchData.description || "",
        logo_url: churchData.logo_url || "",
        photo_url: churchData.photo_url || "",
        service_times: churchData.service_times || "",
      });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleLeader(id: string, current: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_leader: !current })
      .eq("id", id);
    
    if (!error) {
      setMsg("✓ Status de liderança atualizado!");
      setTimeout(() => setMsg(""), 3000);
      load();
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setMsg("Enviando logo...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "igreja");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setChurch(c => ({ ...c, logo_url: json.url }));
        setMsg("✓ Logo enviado!");
      } else {
        setMsg("Erro: " + (json.error || "desconhecido"));
      }
    } catch (err: any) {
      setMsg("Erro: " + err.message);
    } finally {
      setUploadingLogo(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setMsg("Enviando foto...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "igreja");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setChurch(c => ({ ...c, photo_url: json.url }));
        setMsg("✓ Foto enviada!");
      } else {
        setMsg("Erro: " + (json.error || "desconhecido"));
      }
    } catch (err: any) {
      setMsg("Erro: " + err.message);
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function saveChurch() {
    setSavingChurch(true);
    const payload = {
      name: church.name,
      address: church.address,
      city: church.city,
      state: church.state,
      phone: church.phone,
      pastor: church.pastor,
      description: church.description,
      logo_url: church.logo_url,
      photo_url: church.photo_url,
      service_times: church.service_times,
    };

    let error;
    if (church.id) {
      ({ error } = await supabase.from("church_info").update(payload).eq("id", church.id));
    } else {
      const { error: insertError, data } = await supabase.from("church_info").insert(payload).select().single();
      error = insertError;
      if (data) setChurch(c => ({ ...c, id: data.id }));
    }

    setSavingChurch(false);
    if (error) {
      // Se a tabela não existe, apenas mostrar mensagem
      if (error.message.includes("does not exist") || error.message.includes("relation")) {
        setMsg("ℹ️ Tabela church_info não encontrada. Os dados de membros foram salvos.");
      } else {
        setMsg("Erro: " + error.message);
      }
    } else {
      setMsg("✓ Informações da igreja salvas!");
    }
    setTimeout(() => setMsg(""), 4000);
  }

  const filtered = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#B87333" }}>Igreja</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>Gestão da Casa de Oração</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button onClick={() => setActiveTab("membros")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeTab === "membros" ? "border-b-2 border-[#B87333] text-[#B87333]" : "text-white/40"}`}>
          Membros
        </button>
        <button onClick={() => setActiveTab("info")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${activeTab === "info" ? "border-b-2 border-[#B87333] text-[#B87333]" : "text-white/40"}`}>
          Informações
        </button>
      </div>

      {msg && <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: msg.startsWith("✓") ? "rgba(52,211,153,0.1)" : "rgba(184,115,51,0.08)", color: msg.startsWith("✓") ? "#34d399" : "#B87333" }}>{msg}</p>}

      {activeTab === "membros" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60" style={{ fontFamily: "var(--font-cinzel)" }}>Membros e Liderança</h2>
          </div>
          
          <input 
            className="input-field w-full" 
            placeholder="Buscar membro..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />

          {loading ? (
            <p className="text-center text-sm text-white/20">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(m => (
                <div key={m.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>{m.full_name}</p>
                    <p className="text-xs text-white/40">{m.email}</p>
                    {m.city && <p className="text-xs text-white/30">{m.city}{m.state ? `, ${m.state}` : ""}</p>}
                  </div>
                  <button 
                    onClick={() => toggleLeader(m.id, m.is_leader)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold ${m.is_leader ? "bg-gold/20 text-gold border border-gold/40" : "bg-white/5 text-white/40 border border-white/10"}`}
                  >
                    {m.is_leader ? "✓ Líder" : "+ Tornar Líder"}
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-white/30 py-8">Nenhum membro encontrado.</p>
              )}
            </div>
          )}

          <div className="card p-6 bg-gold/5 border-gold/20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gold mb-2" style={{ fontFamily: "var(--font-cinzel)" }}>Horários e Eventos</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Os horários de culto e eventos da igreja são gerenciados através da seção <strong>Eventos</strong> do painel administrativo. 
              Basta criar um novo evento e selecionar a categoria <strong>Culto</strong> ou <strong>Evento</strong>.
            </p>
            <div className="mt-4">
              <a href="/admin/eventos" className="btn-primary py-2 px-4 text-xs inline-block">Ir para Eventos</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Logo e Foto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo */}
            <div className="card p-4 space-y-3">
              <label className="block" style={labelStyle}>Logo da Igreja</label>
              {church.logo_url ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={church.logo_url} alt="Logo" className="h-24 w-auto rounded-lg object-contain border border-white/10" />
                  <button
                    onClick={() => setChurch(c => ({ ...c, logo_url: "" }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >×</button>
                </div>
              ) : (
                <div className="h-24 w-full rounded-lg flex items-center justify-center text-white/20 text-sm" style={{ background: "var(--bg-2)", border: "1px dashed var(--bg-2)" }}>
                  Sem logo
                </div>
              )}
              <button
                onClick={() => logoRef.current?.click()}
                disabled={uploadingLogo}
                className="w-full py-2 rounded-lg text-xs"
                style={{ background: "rgba(184,115,51,0.1)", border: "1px solid rgba(184,115,51,0.3)", color: "#B87333", opacity: uploadingLogo ? 0.5 : 1 }}
              >
                {uploadingLogo ? "Enviando..." : "📎 Enviar Logo"}
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            {/* Foto */}
            <div className="card p-4 space-y-3">
              <label className="block" style={labelStyle}>Foto da Igreja</label>
              {church.photo_url ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={church.photo_url} alt="Foto" className="h-24 w-auto rounded-lg object-cover border border-white/10" />
                  <button
                    onClick={() => setChurch(c => ({ ...c, photo_url: "" }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >×</button>
                </div>
              ) : (
                <div className="h-24 w-full rounded-lg flex items-center justify-center text-white/20 text-sm" style={{ background: "var(--bg-2)", border: "1px dashed var(--bg-2)" }}>
                  Sem foto
                </div>
              )}
              <button
                onClick={() => photoRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-full py-2 rounded-lg text-xs"
                style={{ background: "rgba(184,115,51,0.1)", border: "1px solid rgba(184,115,51,0.3)", color: "#B87333", opacity: uploadingPhoto ? 0.5 : 1 }}
              >
                {uploadingPhoto ? "Enviando..." : "📎 Enviar Foto"}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </div>

          {/* Informações */}
          <div className="card p-5 space-y-4">
            <p className="text-sm font-semibold" style={{ color: "#B87333", fontFamily: "var(--font-cinzel)" }}>Dados da Igreja</p>
            
            <div>
              <label className="block mb-1" style={labelStyle}>Nome da Igreja</label>
              <input className={inp} style={inpStyle} value={church.name} placeholder="Ex: Casa de Oração Franca"
                onChange={e => setChurch(c => ({ ...c, name: e.target.value }))} />
            </div>

            <div>
              <label className="block mb-1" style={labelStyle}>Pastor</label>
              <input className={inp} style={inpStyle} value={church.pastor} placeholder="Nome do pastor"
                onChange={e => setChurch(c => ({ ...c, pastor: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1" style={labelStyle}>Cidade</label>
                <input className={inp} style={inpStyle} value={church.city} placeholder="Franca"
                  onChange={e => setChurch(c => ({ ...c, city: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1" style={labelStyle}>Estado</label>
                <input className={inp} style={inpStyle} value={church.state} placeholder="SP"
                  onChange={e => setChurch(c => ({ ...c, state: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block mb-1" style={labelStyle}>Endereço</label>
              <input className={inp} style={inpStyle} value={church.address} placeholder="Rua, número, bairro"
                onChange={e => setChurch(c => ({ ...c, address: e.target.value }))} />
            </div>

            <div>
              <label className="block mb-1" style={labelStyle}>Telefone / WhatsApp</label>
              <input className={inp} style={inpStyle} value={church.phone} placeholder="(16) 99999-9999"
                onChange={e => setChurch(c => ({ ...c, phone: e.target.value }))} />
            </div>

            <div>
              <label className="block mb-1" style={labelStyle}>Horários de Culto</label>
              <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={church.service_times}
                placeholder="Ex: Domingo 9h e 19h, Quarta 19h30"
                onChange={e => setChurch(c => ({ ...c, service_times: e.target.value }))} />
            </div>

            <div>
              <label className="block mb-1" style={labelStyle}>Descrição / Visão</label>
              <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={4} value={church.description}
                placeholder="Missão e visão da igreja..."
                onChange={e => setChurch(c => ({ ...c, description: e.target.value }))} />
            </div>

            <button
              onClick={saveChurch}
              disabled={savingChurch}
              className="w-full py-2 rounded-lg text-sm font-semibold tracking-widest uppercase"
              style={{ background: "rgba(184,115,51,0.2)", border: "1px solid rgba(184,115,51,0.5)", color: "#B87333", opacity: savingChurch ? 0.6 : 1 }}
            >
              {savingChurch ? "Salvando..." : "Salvar Informações"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
