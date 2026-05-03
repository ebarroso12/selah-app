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
    
    if (error) {
      console.error("[API_ADMIN_USERS] Erro Supabase:", error);
      return NextResponse.json({ 
        users: [], 
        error: error.message,
        debug: {
          env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          env_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
    }
    
    return NextResponse.json({ 
      users: data || [],
      debug: {
        count: data?.length || 0,
        filter,
        env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        env_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (error: any) {
    console.error("[API_ADMIN_USERS] Erro Fatal:", error);
    return NextResponse.json({ 
      users: [], 
      error: error.message,
      debug: {
        env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        env_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, action } = await request.json();
    const supabase = await createServiceClient();
    
    let newStatus = "approved";
    if (action === "ban") newStatus = "banned";
    else if (action === "approve") newStatus = "approved";
    else if (action === "delete") {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
