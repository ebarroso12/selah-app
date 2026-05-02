import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
    
    if (error) throw error;
    
    return NextResponse.json({ users: data });
  } catch (error: any) {
    console.error("[API_ADMIN_USERS]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
