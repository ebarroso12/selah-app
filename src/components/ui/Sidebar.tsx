"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { getInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent?: "gold" | "wine" | "heal";
}

const navItems: NavItem[] = [
  {
    href: "/home",
    label: "Início",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/biblia",
    label: "Bíblia",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: "/devocional",
    label: "Devocional",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    href: "/oracao",
    label: "Oração",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    href: "/comunidade",
    label: "Comunidade",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    href: "/eventos",
    label: "Eventos",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
];

// Itens especiais com cores temáticas
const specialItems: NavItem[] = [
  {
    href: "/dr-edson",
    label: "Dr. Edson",
    accent: "wine",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    href: "/legendarios",
    label: "Legendários",
    accent: "heal",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  profile: Profile;
  isAdmin: boolean;
}

export default function Sidebar({ profile, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function getAccentStyle(accent?: string, active?: boolean) {
    if (!active) return {};
    if (accent === "wine") return {
      background: "rgba(123,31,58,0.18)",
      color: "#E8A0B0",
      borderLeftColor: "var(--wine)",
    };
    if (accent === "heal") return {
      background: "rgba(42,122,75,0.18)",
      color: "#7ECFA0",
      borderLeftColor: "var(--heal)",
    };
    return {};
  }

  function getAccentHoverStyle(accent?: string) {
    if (accent === "wine") return "rgba(123,31,58,0.1)";
    if (accent === "heal") return "rgba(42,122,75,0.1)";
    return "rgba(201,168,76,0.08)";
  }

  return (
    <aside className="sidebar hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/home">
          <span className="selah-wordmark" style={{ fontSize: "1.2rem" }}>SELAH</span>
        </Link>
        <p className="mt-1 text-xs sidebar-text-label" style={{
          fontFamily: "var(--font-cinzel)",
          letterSpacing: "0.12em",
          color: "rgba(201,168,76,0.55)"
        }}>
          Pause · Ore · Cresça
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active ? "active" : ""}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Seção especial: Casa de Oração */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-xs" style={{
            color: "rgba(201,168,76,0.45)",
            fontFamily: "var(--font-cinzel)",
            letterSpacing: "0.12em"
          }}>
            Casa de Oração
          </p>
        </div>

        {specialItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-link"
              style={active ? getAccentStyle(item.accent, true) : {}}
            >
              <span style={{
                color: active
                  ? (item.accent === "wine" ? "#E8A0B0" : item.accent === "heal" ? "#7ECFA0" : "var(--gold)")
                  : "rgba(245,242,235,0.6)"
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.accent === "wine" && (
                <span className="ml-auto badge badge-wine" style={{ fontSize: "0.5rem", padding: "0.1rem 0.4rem" }}>
                  IA
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs" style={{
                color: "rgba(201,168,76,0.45)",
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.12em"
              }}>
                Admin
              </p>
            </div>
            {[
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/aprovacoes", label: "Aprovações" },
              { href: "/admin/usuarios", label: "Usuários" },
              { href: "/admin/metricas", label: "Métricas" },
              { href: "/admin/conteudo", label: "Conteúdo" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                style={{ fontSize: "0.8125rem" }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Perfil + Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <Link href="/perfil" className={`sidebar-link ${pathname === "/perfil" ? "active" : ""}`}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden"
            style={{ background: "rgba(201,168,76,0.18)", color: "#C9A84C", fontFamily: "var(--font-cinzel)" }}>
            {profile.photo_url
              ? <Image src={profile.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
              : getInitials(profile.full_name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "rgba(245,242,235,0.9)" }}>
              {profile.full_name.split(" ")[0]}
            </p>
            <p className="text-xs truncate" style={{ color: "rgba(245,242,235,0.4)" }}>
              {profile.church_name}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 mt-1 px-1">
          <button onClick={handleSignOut} className="sidebar-link flex-1 text-left">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
