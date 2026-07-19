"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MenuModal from "./MenuModal";
import { useAppUpdate } from "@/shared/hooks/useAppUpdate";

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

/** Devocional — sol nascendo (luz do dia com Deus) */
function IconDevocional({ active }: { active: boolean }) {
  const c = active ? "#c9a227" : "var(--text-subtle)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function IconHomenagens({ active }: { active: boolean }) {
  const c = active ? "#c4b5fd" : "var(--text-subtle)";
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
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

/** Ícone de painel admin — chave/engrenagem */
function IconAdmin({ active }: { active: boolean }) {
  const c = active ? "#ef4444" : "var(--text-subtle)";
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
  const { updateAvailable } = useAppUpdate();

  const kairoActive = pathname === "/dr-edson" || pathname.startsWith("/dr-edson/");
  const adminActive = pathname.startsWith("/admin");

  const leftTabs = [
    { href: "/home", label: "Início", Icon: IconHome, activeColor: "#c9a227" },
    { href: "/devocional", label: "Devocional", Icon: IconDevocional, activeColor: "#c9a227" },
  ];

  // Para o admin, o 4º slot vira o painel Admin; Homenagens fica no Menu
  const rightTab = isAdmin
    ? { href: "/admin", label: "Admin", Icon: IconAdmin, activeColor: "#ef4444", dot: true }
    : { href: "/homenagens", label: "Homenagens", Icon: IconHomenagens, activeColor: "#c4b5fd", dot: false };

  function renderTab({ href, label, Icon, activeColor, dot = false }: {
    href: string; label: string; Icon: (p: { active: boolean }) => React.ReactNode;
    activeColor: string; dot?: boolean;
  }) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all relative"
        style={{
          textDecoration: "none",
          background: active ? "rgba(201,162,39,0.08)" : "transparent",
        }}
      >
        <Icon active={active} />
        {dot && (
          <span
            className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: "#ef4444" }}
          />
        )}
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
  }

  return (
    <>
      {/* Barra flutuante */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-end justify-around px-2 py-2 rounded-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--nav-border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "var(--nav-shadow)",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {leftTabs.map(renderTab)}

        {/* Kairo — botão central em destaque: IA para conversar nos momentos difíceis */}
        <Link
          href="/dr-edson"
          className="flex flex-col items-center transition-all"
          style={{ textDecoration: "none", marginTop: "-1.9rem" }}
          aria-label="Kairo — converse com a IA"
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #E2C464 0%, #C9A84C 45%, #A07830 100%)",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: kairoActive
                ? "0 0 0 3px rgba(226,196,100,0.35), 0 6px 26px rgba(201,168,76,0.6)"
                : "0 6px 20px rgba(201,168,76,0.4), 0 2px 8px rgba(0,0,0,0.45)",
              animation: kairoActive ? "none" : "kairo-breathe 3.5s ease-in-out infinite",
            }}
          >
            {/* Sparkles — presença, luz */}
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#0C1221" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.08em",
              color: kairoActive ? "#E2C464" : "var(--gold-label)",
              lineHeight: 1,
              marginTop: 5,
            }}
          >
            Kairo
          </span>
        </Link>

        {renderTab(rightTab)}

        {/* Botão Menu */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all relative"
          style={{
            background: menuOpen ? "rgba(201,162,39,0.08)" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {/* Ponto dourado — atualização disponível */}
          {updateAvailable && (
            <span
              className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, #E2C464, #A07830)",
                boxShadow: "0 0 6px rgba(201,168,76,0.8)",
                animation: "kairo-breathe 2.5s ease-in-out infinite",
              }}
            />
          )}
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
      <MenuModal open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
