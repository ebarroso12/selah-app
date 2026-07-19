/**
 * GET /convite/[token]
 *
 * Valida o token de convite, armazena em cookie (`invite_token`) e redireciona:
 *   - Token inválido → /login?invite_error=invalid|expired|used
 *   - Logado         → /home (cookie já consumido se tinha pra consumir)
 *   - Deslogado      → /register?invite=1
 */
import { NextRequest, NextResponse } from "next/server";
import { getInvitation } from "@/shared/services/auth/invitations.server";
import { createClient } from "@/shared/services/supabase/supabase.server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const origin = new URL(request.url).origin;

  const check = await getInvitation(token);
  if (!check.valid) {
    const reason = check.reason ?? "invalid";
    return NextResponse.redirect(`${origin}/login?invite_error=${reason}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const target = user ? `${origin}/home` : `${origin}/register?invite=1`;
  const response = NextResponse.redirect(target);
  response.cookies.set("invite_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
