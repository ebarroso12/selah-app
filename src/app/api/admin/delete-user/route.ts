import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Credenciais hardcoded como fallback
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://urmhuxluepexyycptflr.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório." }, { status: 400 });
    }

    const adminClient = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Deletar perfil primeiro
    await adminClient.from("profiles").delete().eq("id", userId);

    // Deletar usuário do auth
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error("[delete-user] Erro ao deletar auth user:", error.message);
      // Mesmo que falhe no auth, o perfil foi deletado
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[delete-user] Exceção:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
