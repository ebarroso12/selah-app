"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";


export default function AdminIgrejaPage() {
  const supabase = getBrowserClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });
    setMembers(data ?? []);
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

  const filtered = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227" }}>Igreja</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Gestão de membros e liderança da Casa de Oração</p>
      </div>

      {msg && <p className="text-xs text-center text-gold">{msg}</p>}

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
                </div>
                <button 
                  onClick={() => toggleLeader(m.id, m.is_leader)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold ${m.is_leader ? "bg-gold/20 text-gold border border-gold/40" : "bg-white/5 text-white/40 border border-white/10"}`}
                >
                  {m.is_leader ? "Líder" : "+ Tornar Líder"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
  );
}
