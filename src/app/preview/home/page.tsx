export default function PreviewHome() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen"
        style={{ background: "rgba(8,13,26,0.98)", borderRight: "1px solid rgba(201,162,39,0.12)" }}>
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <span className="selah-wordmark" style={{ fontSize: "1.25rem" }}>SELAH</span>
          <p className="mt-0.5 text-xs" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em" }}>
            Pause · Ore · Cresça
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {["Inicio","Biblia","Devocional","Oracao","Comunidade","Eventos"].map((label, i) => (
            <a key={label} href="#"
              className={`sidebar-link ${i === 0 ? "active" : ""}`}>
              <span className="w-4 h-4 rounded-sm inline-block shrink-0"
                style={{ background: i === 0 ? "rgba(201,162,39,0.3)" : "var(--bg-2)" }} />
              {label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <div className="sidebar-link">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
              EB
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text)" }}>Dr. Edson</p>
              <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Casa de Oracao</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
              Quinta-feira, 1 de maio de 2025
            </p>
            <h1 className="text-2xl">Bem-vindo ao SELAH</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
                  Devocional do Dia
                </p>
                <span className="badge badge-gold">IA</span>
              </div>
              <h2 className="text-lg mb-4">O Sopro que Sustenta</h2>
              <blockquote className="scripture text-sm leading-relaxed p-4 rounded-lg mb-4"
                style={{ background: "rgba(201,162,39,0.05)", borderLeft: "2px solid rgba(201,162,39,0.4)" }}>
                &quot;Porque nEle vivemos, nos movemos e existimos.&quot;
                <footer className="mt-2 text-xs not-italic"
                  style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
                  Atos 17:28
                </footer>
              </blockquote>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Paulo, diante dos filósofos de Atenas, não recuou diante da complexidade do ambiente.
                Ele encontrou o ponto de contato entre a busca humana e a revelação divina, e declarou
                uma verdade que ressoa até hoje: nossa existência inteira repousa nEle.
              </p>
            </div>

            <div className="space-y-5">
              <div className="card p-5">
                <p className="text-xs tracking-widest uppercase mb-4"
                  style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
                  Proximos Eventos
                </p>
                {[
                  { day: "04", month: "MAI", title: "Culto de Domingo", local: "Casa de Oracao" },
                  { day: "06", month: "MAI", title: "RPM Legendarios", local: "Sede Franca" },
                  { day: "09", month: "MAI", title: "Reuniao de Celula", local: "Online" },
                ].map((e) => (
                  <div key={e.title} className="flex gap-3 items-start mb-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                      style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
                      <span className="text-xs font-bold leading-none" style={{ color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>{e.day}</span>
                      <span className="text-xs leading-none mt-0.5" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>{e.month}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{e.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{e.local}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <p className="text-xs tracking-widest uppercase mb-4"
                  style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}>
                  Pedidos de Oracao
                </p>
                {[
                  { text: "Saude da minha mae, cirurgia na proxima semana.", nome: "Carlos M. · Franca" },
                  { text: "Renovacao do emprego e direcao de Deus.", nome: "Rodrigo S. · Ribeirao" },
                ].map((p, i) => (
                  <div key={i}>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>{p.text}</p>
                    <p className="text-xs mt-1 mb-3" style={{ color: "var(--text-subtle)" }}>{p.nome}</p>
                    {i === 0 && <hr className="divider mb-3" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
