import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        return NextResponse.redirect(`${origin}/register`);
      }

      if (profile.status === "pending") {
        return NextResponse.redirect(`${origin}/pending-approval`);
      }

      if (profile.status === "approved") {
        return NextResponse.redirect(`${origin}/home`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
