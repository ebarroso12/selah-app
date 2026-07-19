"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Permission } from "@/shared/services/auth/permissions";

type NavItem = { href: string; label: string; icon: string; exact?: boolean; perm: Permission | null };

const NAV_SECTIONS: { group: string; items: NavItem[] }[] = [
  {
    group: "Visão Geral",
    items: [
      { href: "/admin", label: "Dashboard", icon: "📊", exact: true, perm: null },
      { href: "/admin/usuarios", label: "Usuários", icon: "👥", perm: "manage_users" },
      { href: "/admin/ai-budget", label: "IA & Orçamento", icon: "💸", perm: "manage_users" },
      { href: "/admin/metricas", label: "Métricas", icon: "📈", perm: "view_metrics" },
      { href: "/admin/healthcheck", label: "Auto-Reparo IA", icon: "🤖", perm: null },
    ],
  },
  {
    group: "Conteúdo",
    items: [
      { href: "/admin/conteudo", label: "Devocionais", icon: "📖", perm: "manage_devocional" },
      { href: "/admin/eventos", label: "Eventos", icon: "📅", perm: "manage_events" },
      { href: "/admin/legendarios", label: "Legendários", icon: "🔥", perm: "manage_legendarios" },
      { href: "/admin/igreja", label: "Igreja", icon: "⛪", perm: "manage_igreja" },
      { href: "/admin/kairo-prompt", label: "Prompt Kairo", icon: "🤖", perm: "manage_kairo" },
      { href: "/admin/lojinha", label: "Lojinha", icon: "🛒", perm: "manage_lojinha" },
    ],
  },
  {
    group: "Moderação",
    items: [
      { href: "/admin/oracoes", label: "Orações", icon: "🙏", perm: "manage_oracoes" },
      { href: "/admin/comunidade", label: "Comunidade", icon: "💬", perm: "manage_comunidade" },
      { href: "/admin/homenagens", label: "Homenagens", icon: "❤️", perm: "manage_homenagens" },
    ],
  },
];

const OPENCLAW_URL = "https://openclaw.n8ndredson.com/chat?session=agent%3Amain%3Amain";

interface AdminShellProps {
  children: React.ReactNode;
  role: "admin" | "user";
  permissions: string[];
}

export default function AdminShell({ children, role, permissions }: AdminShellProps) {
  const isAdmin = role === "admin";
  const can = (perm: Permission | null) => perm === null || isAdmin || permissions.includes(perm);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fechar menu ao navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <div
      id="admin-sidebar"
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)", borderRight: "1px solid rgba(201,162,39,0.12)" }}
    >
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
        <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded"
          style={{ color: "var(--text-subtle)" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(it => can(it.perm));
          if (visibleItems.length === 0) return null;
          return (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-xs tracking-widest uppercase"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", fontSize: "0.6rem" }}>
              {section.group}
            </p>
            <div className="space-y-0.5">
              {visibleItems.map(item => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      background: active ? "rgba(201,162,39,0.12)" : "transparent",
                      color: active ? "#c9a227" : "var(--text-muted)",
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
          );
        })}
      </nav>

      <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
        {/* Botão OpenClaw */}
        <a
          href={OPENCLAW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full"
          style={{
            background: "rgba(37,211,102,0.08)",
            border: "1px solid rgba(37,211,102,0.2)",
            color: "#25D366",
            fontSize: "0.82rem",
            textDecoration: "none",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          OpenClaw IA
        </a>
        <Link href="/home"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: "var(--text-subtle)", fontSize: "0.82rem" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Voltar ao App
        </Link>
      </div>
    </div>
  );

  return (
    <div className="light flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)} />
      )}

      <aside
        className="fixed top-0 left-0 h-full w-64 z-50 md:hidden flex flex-col transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: "var(--bg-sidebar)", borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
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
            style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c9a227]"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
