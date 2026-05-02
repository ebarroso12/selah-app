"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MenuModal from "./MenuModal";

/* ── Ícones SVG inline ─────────────────────────────────────────── */

function IconHome({ active }: { active: boolean }) {
  const c = active ? "#c9a227" : "rgba(255,255,255,0.45)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function IconLegendarios({ active }: { active: boolean }) {
  const c = active ? "#f59e0b" : "rgba(255,255,255,0.45)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function IconHomenagens({ active }: { active: boolean }) {
  const c = active ? "#c4b5fd" : "rgba(255,255,255,0.45)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function IconMenu({ active }: { active: boolean }) {
  const c = active ? "#c9a227" : "rgba(255,255,255,0.45)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6A.75.75 0 014.5 5.25h15a.75.75 0 010 1.5h-15A.75.75 0 013.75 6zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" />
    </svg>
  );
}

/** Ícone de painel admin — chave/engrenagem */
function IconAdmin({ active }: { active: boolean }) {
  const c = active ? "#ef4444" : "rgba(255,255,255,0.45)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      href: "/legendarios",
      label: "Legendários",
      Icon: IconLegendarios,
      activeColor: "#f59e0b",
    },
    {
      href: "/homenagens",
      label: "Homenagens",
      Icon: IconHomenagens,
      activeColor: "#c4b5fd",
    },
  ];

  const adminActive = pathname.startsWith("/admin");

  return (
    <>
      {/* Barra flutuante */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-2 py-2 rounded-2xl"
        style={{
          background: "rgba(8,13,26,0.96)",
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
                  color: active ? activeColor : "rgba(255,255,255,0.35)",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Botão Admin — exclusivo para o administrador */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative"
            style={{
              textDecoration: "none",
              background: adminActive ? "rgba(239,68,68,0.10)" : "transparent",
            }}
          >
            <IconAdmin active={adminActive} />
            {/* Ponto vermelho indicador */}
            <span
              className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: "#ef4444" }}
            />
            <span
              style={{
                fontSize: "0.6rem",
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.04em",
                color: adminActive ? "#ef4444" : "rgba(255,255,255,0.35)",
                lineHeight: 1,
              }}
            >
              Admin
            </span>
          </Link>
        )}

        {/* Botão Menu */}
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
              color: menuOpen ? "#c9a227" : "rgba(255,255,255,0.35)",
              lineHeight: 1,
            }}
          >
            Menu
          </span>
        </button>
      </nav>

      {/* Modal de menu */}
      <MenuModal open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
