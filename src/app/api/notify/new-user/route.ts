import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewUserNotificationToAdmin } from "@/lib/email/client";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, whatsapp, church_name, city, state, gender, is_legendario, is_legendario_spouse")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    await sendNewUserNotificationToAdmin(profile as {
      full_name: string;
      email: string;
      whatsapp?: string | null;
      church_name: string;
      city: string;
      state: string;
      gender: string;
      is_legendario: boolean;
      is_legendario_spouse: boolean;
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
