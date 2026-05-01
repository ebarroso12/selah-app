"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/home",
    label: "Início",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
        stroke={active ? "#c9a227" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
      </svg>
    ),
  },
  {
    href: "/devocional",
    label: "Devocional",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
        stroke={active ? "#c9a227" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    href: "/dr-edson",
    label: "Kairo",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
        stroke={active ? "#E8A0B0" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    href: "/oracao",
    label: "Oração",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
        stroke={active ? "#c9a227" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    href: "/comunidade",
    label: "Comunidade",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
        stroke={active ? "#c9a227" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
        stroke={active ? "#c9a227" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        background: "rgba(8,13,26,0.97)",
        borderTop: "1px solid rgba(201,162,39,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all"
            style={{ minWidth: 40, textDecoration: "none" }}
          >
            {item.icon(active)}
            <span
              className="text-center leading-none"
              style={{
                fontSize: "0.55rem",
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.05em",
                color: active
                  ? (item.href === "/dr-edson" ? "#E8A0B0" : "#c9a227")
                  : "rgba(255,255,255,0.35)",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
