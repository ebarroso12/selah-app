import { createServiceClient } from "@/shared/services/supabase/supabase.server";
import { requireAdminOrForbidden } from "@/shared/services/auth/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "todos";

    const supabase = await createServiceClient();

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "todos") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API_ADMIN_USERS] Erro Supabase:", error);
      return NextResponse.json({ users: [], error: error.message });
    }

    return NextResponse.json({ users: data || [] });
  } catch (error: any) {
    console.error("[API_ADMIN_USERS] Erro Fatal:", error);
    return NextResponse.json({ users: [], error: error.message });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminOrForbidden();
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, action } = await request.json();
    const supabase = await createServiceClient();

    if (action === "delete") {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    const newStatus = action === "ban" ? "banned" : "approved";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
