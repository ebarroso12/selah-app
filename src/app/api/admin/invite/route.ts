import { NextResponse } from "next/server";
import { createClient } from "@/shared/services/supabase/supabase.server";
import { adminService } from "@/features/admin/services/admin.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json();
  const { email, full_name } = body as { email: string; full_name?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  try {
    const result = await adminService.inviteUser(email, full_name ?? "");
    return NextResponse.json({
      success: true,
      message: result.alreadyExisted
        ? `Usuário ${email} já existia — perfil aprovado.`
        : `Acesso liberado! ${email} pode entrar com a senha: Mudar123`,
      user_id: result.userId,
      already_existed: result.alreadyExisted,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao convidar usuário.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
