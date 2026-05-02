export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./AdminShell";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
    redirect("/home");
  }

  return <AdminShell>{children}</AdminShell>;
}
