import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/shared/services/supabase/supabase.server";
import { emailService } from "@/shared/services/email/email.service";
import { consumeInvitationToken } from "@/shared/services/auth/invitations.server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const user = data.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split("@")[0] : "Usuário");

    const cookieStore = await cookies();
    const inviteToken = cookieStore.get("invite_token")?.value ?? null;
    const invitePerms = await consumeInvitationToken(inviteToken, user.id);

    const service = await createServiceClient();
    const { error: profileError } = await service.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      status: "approved",
      gender: "male",
      church_name: "",
      city: "",
      state: "",
      permissions: invitePerms,
    });

    if (profileError) {
      console.error("[auth/callback] Erro ao criar perfil:", profileError.message);
    }

    if (inviteToken) cookieStore.delete("invite_token");

    emailService
      .send({
        template: "newUser",
        to: user.email ?? "",
        data: {
          full_name: fullName,
          email: user.email ?? "",
          church_name: "",
          city: "",
          state: "",
          gender: "male",
          is_legendario: false,
          is_legendario_spouse: false,
        },
      })
      .catch(() => {});

    return NextResponse.redirect(`${origin}/home`);
  }

  if (profile.status === "rejected" || profile.status === "banned") {
    return NextResponse.redirect(`${origin}/login?error=${profile.status}`);
  }

  return NextResponse.redirect(`${origin}/home`);
}
