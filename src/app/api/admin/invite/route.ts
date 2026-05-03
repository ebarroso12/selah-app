import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "edson.barroso@gmail.com";
const DEFAULT_PASSWORD = "Mudar123";

// Credenciais hardcoded como fallback — garantem funcionamento mesmo sem env vars no Vercel
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://urmhuxluepexyycptflr.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA";

export async function POST(request: Request) {
  // Verificar se o solicitante é admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json();
  const { email, full_name } = body as { email: string; full_name?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  // Usar service role para criar o usuário
  const adminClient = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificar se o usuário já existe
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const alreadyExists = existingUsers?.users?.some((u) => u.email === email);
  if (alreadyExists) {
    // Se já existe, apenas garantir que o perfil está aprovado
    const existingUser = existingUsers.users.find((u) => u.email === email)!;
    await adminClient.from("profiles").upsert({
      id: existingUser.id,
      email,
      full_name: full_name || existingUser.user_metadata?.full_name || email.split("@")[0],
      status: "approved",
      gender: "male",
      church_name: "",
      city: "",
      state: "",
    }, { onConflict: "id" });

    return NextResponse.json({
      success: true,
      message: `Usuário ${email} já existia — perfil aprovado.`,
      already_existed: true,
    });
  }

  // Criar novo usuário com senha padrão
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true, // já confirmar o email
    user_metadata: { full_name: full_name || email.split("@")[0] },
  });

  if (createError || !newUser?.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Erro ao criar usuário." },
      { status: 500 }
    );
  }

  // Criar perfil aprovado
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: newUser.user.id,
    email,
    full_name: full_name || email.split("@")[0],
    status: "approved",
    gender: "male",
    church_name: "",
    city: "",
    state: "",
  });

  if (profileError) {
    console.error("[invite] profileError:", profileError.message);
  }

  return NextResponse.json({
    success: true,
    message: `Acesso liberado! ${email} pode entrar com a senha: ${DEFAULT_PASSWORD}`,
    user_id: newUser.user.id,
  });
}
