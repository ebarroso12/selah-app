const navItems = [
  { href: "#", label: "Inicio", active: false },
  { href: "#", label: "Biblia", active: false },
  { href: "#", label: "Devocional", active: true },
  { href: "#", label: "Oracao", active: false },
  { href: "#", label: "Comunidade", active: false },
  { href: "#", label: "Eventos", active: false },
];

export default function PreviewPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen"
        style={{ background: "rgba(8,13,26,0.98)", borderRight: "1px solid rgba(201,162,39,0.12)" }}>
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <span className="selah-wordmark" style={{ fontSize: "1.25rem" }}>SELAH</span>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(201,162,39,0.45)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em" }}>
            Pause · Ore · Cresça
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}
              className={`sidebar-link ${item.active ? "active" : ""}`}>
              <span className="w-4 h-4 rounded-sm inline-block shrink-0"
                style={{ background: item.active ? "rgba(201,162,39,0.3)" : "rgba(255,255,255,0.1)" }} />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <div className="sidebar-link">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227", fontFamily: "var(--font-cinzel)" }}>
              EB
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Dr. Edson</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Casa de Oracao</p>
            </div>
          </div>
          <a href="#" className="sidebar-link mt-1">
            <span className="w-4 h-4 inline-block shrink-0" />
            Sair
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs tracking-widest uppercase mb-1"
              style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
              Quinta-feira, 1 de maio de 2025
            </p>
            <h1 className="text-2xl">Devocional do Dia</h1>
          </div>

          {/* Devocional card */}
          <div className="card p-8 glow-gold">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl leading-snug">O Sopro que Sustenta</h2>
              </div>
              <span className="badge badge-gold shrink-0">Gerado por IA</span>
            </div>

            <blockquote className="scripture text-base leading-relaxed p-5 rounded-xl mb-6"
              style={{ background: "rgba(201,162,39,0.05)", borderLeft: "3px solid rgba(201,162,39,0.5)" }}>
              &quot;Porque nEle vivemos, nos movemos e existimos.&quot;
              <footer className="mt-3 text-sm not-italic"
                style={{ color: "rgba(201,162,39,0.7)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
                Atos 17:28
              </footer>
            </blockquote>

            <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
              <p>
                Paulo, diante dos filósofos de Atenas, não recuou diante da complexidade do ambiente.
                Ele encontrou o ponto de contato entre a busca humana e a revelação divina, e declarou
                uma verdade que ressoa até hoje: nossa existência inteira repousa nEle.
              </p>
              <p>
                No ritmo acelerado do dia, é fácil esquecer que cada respiração é sustentada por Deus.
                Não somos autossuficientes — somos dependentes, e isso não é fraqueza. É a postura
                correta diante do Criador. A família que você cuida, o trabalho que você exerce,
                as decisões que você toma — tudo acontece dentro da esfera do governo de Deus.
              </p>
              <p>
                Para os Legendarios: a força que o mundo admira em voces nao vem de voces.
                Vem dAquele em quem voces vivem e se movem. Isso liberta da pressão de ser
                perfeito e convida à dependência genuína — a marca do verdadeiro herói.
              </p>
            </div>

            <div className="mt-8 p-5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.15)" }}>
              <p className="text-xs mb-3"
                style={{ color: "rgba(201,162,39,0.65)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Oracao
              </p>
              <p className="scripture text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Senhor, reconhecemos que fora de Ti nada somos. Que este dia seja vivido
                na consciência de que em Ti nos movemos. Que cada escolha reflita essa dependência
                e que nossas familias experimentem o peso da Tua presença sobre nos.
              </p>
            </div>
          </div>

          {/* Archive strip */}
          <div>
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>
              Arquivo
            </p>
            <div className="grid gap-3">
              {[
                { date: "30 de abril de 2025", title: "A Paz que Transcende", ref: "Filipenses 4:7" },
                { date: "29 de abril de 2025", title: "Raizes que Sustentam", ref: "Jeremias 17:8" },
                { date: "28 de abril de 2025", title: "O Heroi que Falha e Recomeça", ref: "Miqueias 7:8" },
              ].map((d) => (
                <div key={d.date} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs mb-0.5"
                      style={{ color: "rgba(201,162,39,0.55)", fontFamily: "var(--font-cinzel)" }}>{d.date}</p>
                    <p className="font-semibold text-sm" style={{ color: "#fff", fontFamily: "var(--font-cinzel)" }}>{d.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{d.ref}</p>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                    stroke="rgba(201,162,39,0.4)" strokeWidth={1.5} className="shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
