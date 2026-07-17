"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MenuModal from "./MenuModal";

/* ── Ícones SVG inline ─────────────────────────────────────────── */

function IconHome({ active }: { active: boolean }) {
  const c = active ? "#c9a227" : "var(--text-subtle)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function IconKairo({ active }: { active: boolean }) {
  const c = active ? "#f59e0b" : "var(--text-subtle)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function IconDevocionais({ active }: { active: boolean }) {
  const c = active ? "#c4b5fd" : "var(--text-subtle)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function IconMenu({ active }: { active: boolean }) {
  const c = active ? "#c9a227" : "var(--text-subtle)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6A.75.75 0 014.5 5.25h15a.75.75 0 010 1.5h-15A.75.75 0 013.75 6zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" />
    </svg>
  );
}

/* ── Componente principal ──────────────────────────────────────── */

export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    {
      href: "/home",
      label: "Início",
      Icon: IconHome,
      activeColor: "#c9a227",
    },
    {
      href: "/dr-edson",
      label: "Kairo IA",
      Icon: IconKairo,
      activeColor: "#f59e0b",
    },
    {
      href: "/devocional",
      label: "Devocionais",
      Icon: IconDevocionais,
      activeColor: "#c4b5fd",
    },
  ];

  return (
    <>
      {/* Barra flutuante */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-2 py-2 rounded-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid rgba(201,162,39,0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,162,39,0.08)",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {tabs.map(({ href, label, Icon, activeColor }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              style={{
                textDecoration: "none",
                background: active ? "rgba(201,162,39,0.08)" : "transparent",
              }}
            >
              <Icon active={active} />
              <span
                style={{
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-cinzel)",
                  letterSpacing: "0.04em",
                  color: active ? activeColor : "var(--text-subtle)",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Botão Menu — abre o menu geral do app */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: menuOpen ? "rgba(201,162,39,0.08)" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <IconMenu active={menuOpen} />
          <span
            style={{
              fontSize: "0.6rem",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.04em",
              color: menuOpen ? "#c9a227" : "var(--text-subtle)",
              lineHeight: 1,
            }}
          >
            Menu
          </span>
        </button>
      </nav>

      {/* Modal de menu */}
      <MenuModal open={menuOpen} onClose={() => setMenuOpen(false)} isAdmin={isAdmin} />
    </>
  );
}
