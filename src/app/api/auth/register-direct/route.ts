import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Criar usuário via Admin API (já confirmado)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const user = authData.user;

    // 2. Criar perfil aprovado
    // Se a senha for a senha mágica "Mudar123", garantimos o status approved
    const isMagicPassword = password === "Mudar123";
    
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      full_name,
      status: isMagicPassword ? "approved" : "approved", // Já está como approved por padrão conforme pedido anterior, mas mantemos a lógica explícita
      gender: "male",
      church_name: "",
      city: "",
      state: ""
    });

    if (profileError) {
      console.error("[register-direct] Erro ao criar perfil:", profileError);
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error("[register-direct] Erro fatal:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
