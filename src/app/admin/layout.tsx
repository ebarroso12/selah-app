export const dynamic = "force-dynamic";
import AdminShell from "./AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // O layout agora é apenas um invólucro. 
  // A verificação de admin e o carregamento de dados acontecem dentro do AdminShell (client-side)
  // ou nas páginas individuais, para evitar que o servidor quebre ao tentar carregar tudo de uma vez.
  return <AdminShell>{children}</AdminShell>;
}
