export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Email do administrador — sempre lido da variável de ambiente
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/aprovacoes", label: "Aprovações" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/metricas", label: "Métricas" },
  { href: "/admin/conteudo", label: "Conteúdo" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
    redirect("/home");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 h-screen sticky top-0"
        style={{
          background: "rgba(8,13,26,0.98)",
          borderRight: "1px solid rgba(201,162,39,0.12)",
        }}
      >
        <div
          className="px-5 py-6 border-b"
          style={{ borderColor: "rgba(201,162,39,0.12)" }}
        >
          <Link href="/home">
            <span
              className="selah-wordmark"
              style={{ fontSize: "1.1rem" }}
            >
              SELAH
            </span>
          </Link>
          <span className="badge badge-gold mt-2 block w-fit">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div
          className="px-3 py-4 border-t"
          style={{ borderColor: "rgba(201,162,39,0.12)" }}
        >
          <Link href="/home" className="sidebar-link">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            Voltar ao App
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
