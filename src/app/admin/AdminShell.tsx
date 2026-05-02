"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    group: "Visão Geral",
    items: [
      { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
      { href: "/admin/usuarios", label: "Usuários", icon: "👥" },
      { href: "/admin/metricas", label: "Métricas", icon: "📈" },
    ],
  },
  {
    group: "Conteúdo",
    items: [
      { href: "/admin/conteudo", label: "Devocionais", icon: "📖" },
      { href: "/admin/eventos", label: "Eventos", icon: "📅" },
      { href: "/admin/legendarios", label: "Legendários", icon: "🔥" },
      { href: "/admin/igreja", label: "Igreja", icon: "⛪" },
    ],
  },
  {
    group: "Moderação",
    items: [
      { href: "/admin/oracoes", label: "Orações", icon: "🙏" },
      { href: "/admin/comunidade", label: "Comunidade", icon: "💬" },
      { href: "/admin/homenagens", label: "Homenagens", icon: "❤️" },
      { href: "/admin/aprovacoes", label: "Aprovações", icon: "✅" },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fechar menu ao navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#admin-sidebar") && !target.closest("#admin-hamburger")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const Sidebar = () => (
    <div
      id="admin-sidebar"
      className="flex flex-col h-full"
      style={{ background: "rgba(6,10,20,0.99)", borderRight: "1px solid rgba(201,162,39,0.12)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(201,162,39,0.12)" }}>
        <div>
          <Link href="/home" onClick={() => setOpen(false)}>
            <span style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", fontSize: "1.1rem", letterSpacing: "0.2em" }}>
              SELAH
            </span>
          </Link>
          <span className="block mt-1 text-xs px-2 py-0.5 rounded-full w-fit"
            style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "var(--font-cinzel)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
            ADMIN
          </span>
        </div>
        {/* Fechar no mobile */}
        <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-xs tracking-widest uppercase"
              style={{ color: "rgba(201,162,39,0.4)", fontFamily: "var(--font-cinzel)", fontSize: "0.6rem" }}>
              {section.group}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      background: active ? "rgba(201,162,39,0.12)" : "transparent",
                      color: active ? "#c9a227" : "rgba(255,255,255,0.55)",
                      borderLeft: active ? "2px solid #c9a227" : "2px solid transparent",
                      fontFamily: active ? "var(--font-cinzel)" : "inherit",
                      fontSize: "0.82rem",
                      letterSpacing: active ? "0.04em" : "normal",
                    }}>
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
        <Link href="/home"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Voltar ao App
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* ===== SIDEBAR DESKTOP (sempre visível) ===== */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      {/* ===== OVERLAY MOBILE ===== */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)} />
      )}

      {/* ===== SIDEBAR MOBILE (drawer) ===== */}
      <aside
        className="fixed top-0 left-0 h-full w-64 z-50 md:hidden flex flex-col transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}>
        <Sidebar />
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: "rgba(6,10,20,0.98)", borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
          <button id="admin-hamburger" onClick={() => setOpen(true)}
            className="p-2 rounded-lg"
            style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#c9a227" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", fontSize: "1rem", letterSpacing: "0.2em" }}>
            ADMIN
          </span>
          <Link href="/home" className="p-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
