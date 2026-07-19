"use client";

import { useState } from "react";

export default function InviteUser() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);

    const resp = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), full_name: name.trim() || undefined }),
    });
    const data = await resp.json();

    if (resp.ok && data.success) {
      setResult({ ok: true, msg: data.message });
      setEmail("");
      setName("");
    } else {
      setResult({ ok: false, msg: data.error ?? "Erro ao enviar convite." });
    }
    setLoading(false);
  }

  return (
    <div className="card p-5" style={{ border: "1px solid rgba(201,162,39,0.25)" }}>
      <div className="flex items-center gap-2 mb-4">
        {/* Ícone envelope */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.25)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", letterSpacing: "0.05em" }}>
            Convidar Usuário
          </h2>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            Acesso imediato com senha padrão: <span style={{ color: "var(--gold-label)" }}>Mudar123</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleInvite} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label text-xs" htmlFor="invite-name">Nome (opcional)</label>
            <input
              id="invite-name"
              type="text"
              className="input-field text-sm py-2"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs" htmlFor="invite-email">Email *</label>
            <input
              id="invite-email"
              type="email"
              className="input-field text-sm py-2"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {result && (
          <p className="text-xs px-3 py-2 rounded-lg"
            style={{
              background: result.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${result.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              color: result.ok ? "#4ade80" : "#f87171",
            }}>
            {result.ok ? "✓ " : "✗ "}{result.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="btn-primary text-sm py-2 px-6"
          style={{ opacity: loading || !email.trim() ? 0.6 : 1 }}
        >
          {loading ? "Criando acesso..." : "Liberar Acesso"}
        </button>
      </form>
    </div>
  );
}
