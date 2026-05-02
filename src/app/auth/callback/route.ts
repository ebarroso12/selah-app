import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Verificar se já existe perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, status")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        // Usuário novo via Google — criar perfil automaticamente com dados do OAuth
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split("@")[0] : "Usuário");

        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email ?? "",
          full_name: fullName,
          status: "approved",
          gender: "male",
          church_name: "",
          city: "",
          state: "",
        });

        if (profileError) {
          console.error("[auth/callback] Erro ao criar perfil:", profileError.message);
        }

        // Notificar admin sobre novo usuário (fire-and-forget)
        fetch(`${origin}/api/notify/new-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }).catch(() => {});

        return NextResponse.redirect(`${origin}/home`);
      }

      // Perfil existente — verificar status
      if (profile.status === "rejected" || profile.status === "banned") {
        return NextResponse.redirect(`${origin}/login?error=blocked`);
      }

      return NextResponse.redirect(`${origin}/home`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
