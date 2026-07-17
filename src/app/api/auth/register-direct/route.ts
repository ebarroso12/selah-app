import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { emailService } from "@/shared/services/email/email.service";
import { consumeInvitationToken } from "@/shared/services/auth/invitations.server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const user = authData.user;

    const cookieStore = await cookies();
    const inviteToken = cookieStore.get("invite_token")?.value ?? null;
    const invitePerms = await consumeInvitationToken(inviteToken, user.id);

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      full_name,
      status: "approved",
      gender: "male",
      church_name: "",
      city: "",
      state: "",
      permissions: invitePerms,
    });

    if (profileError) {
      console.error("[register-direct] Erro ao criar perfil:", profileError);
    }

    if (inviteToken) cookieStore.delete("invite_token");

    emailService
      .send({
        template: "newUser",
        to: email,
        data: {
          full_name,
          email,
          church_name: "",
          city: "",
          state: "",
          gender: "male",
          is_legendario: false,
          is_legendario_spouse: false,
        },
      })
      .catch(() => {});

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: unknown) {
    console.error("[register-direct] Erro fatal:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
