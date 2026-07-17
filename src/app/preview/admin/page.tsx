export default function PreviewAdmin() {
  const stats = [
    { label: "Usuarios Ativos", value: 247, color: "#c9a227" },
    { label: "Aguardando Aprovacao", value: 8, color: "#fbbf24", urgent: true },
    { label: "Devocionais Publicados", value: 31, color: "#34d399" },
    { label: "Pedidos de Oracao Abertos", value: 19, color: "#60a5fa" },
  ];

  const pendingUsers = [
    { name: "Marcos Antonio Silva", email: "marcos@email.com", church: "Casa de Oracao Franca", city: "Franca / SP", gender: "Homem", legendario: true, date: "01/05/2025" },
    { name: "Ana Paula Costa", email: "ana@email.com", church: "Igreja Batista Central", city: "Ribeirao Preto / SP", gender: "Mulher", legendario: false, spouse: true, date: "01/05/2025" },
    { name: "Roberto Mendes", email: "roberto@email.com", church: "AD Franca", city: "Franca / SP", gender: "Homem", legendario: false, date: "30/04/2025" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex flex-col w-52 shrink-0 h-screen"
        style={{ background: "rgba(8,13,26,0.98)", borderRight: "1px solid rgba(201,162,39,0.12)" }}>
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <span className="selah-wordmark" style={{ fontSize: "1.1rem" }}>SELAH</span>
          <span className="badge badge-gold mt-2 block w-fit">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {["Dashboard","Aprovacoes","Usuarios","Metricas","Conteudo"].map((label, i) => (
            <a key={label} href="#" className={`sidebar-link ${i === 0 ? "active" : ""}`}
              style={{ fontSize: "0.8125rem" }}>
              {label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <p className="text-xs px-3" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
            Dr. Edson Barroso
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl mb-1">Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
              Visao geral do SELAH · Dr. Edson Barroso
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`card p-5 ${s.urgent ? "glow-gold" : ""}`}>
                <p className="text-3xl font-bold" style={{ color: s.color, fontFamily: "var(--font-cinzel)" }}>{s.value}</p>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>{s.label}</p>
                {s.urgent && <p className="text-xs mt-1" style={{ color: "#fbbf24", textDecoration: "underline" }}>Revisar agora</p>}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg mb-4">Aprovacoes Pendentes</h2>
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div key={u.email} className="card p-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold" style={{ color: "#fff", fontFamily: "var(--font-cinzel)", fontSize: "0.9rem" }}>{u.name}</p>
                      {u.legendario && <span className="badge badge-gold">Legendario</span>}
                      {u.spouse && <span className="badge badge-gold">Esposa Legendario</span>}
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                    <div className="flex gap-3 text-xs" style={{ color: "var(--text-subtle)" }}>
                      <span>{u.gender}</span><span>·</span>
                      <span>{u.church}</span><span>·</span>
                      <span>{u.city}</span><span>·</span>
                      <span>Cadastro: {u.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-ghost text-sm px-4 py-2"
                      style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                      Rejeitar
                    </button>
                    <button className="btn-primary text-sm px-4 py-2">
                      Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
