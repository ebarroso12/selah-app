import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "todos";
    
    console.log(`[API_ADMIN_USERS] Iniciando busca. Filtro: ${filter}`);
    
    const supabase = await createServiceClient();
    
    // Log para verificar se as variáveis de ambiente estão presentes (sem mostrar o valor da chave)
    console.log(`[API_ADMIN_USERS] Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING"}`);
    console.log(`[API_ADMIN_USERS] Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING"}`);

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (filter !== "todos") {
      query = query.eq("status", filter);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error("[API_ADMIN_USERS] Erro na query Supabase:", error);
      throw error;
    }
    
    console.log(`[API_ADMIN_USERS] Busca concluída. Usuários encontrados: ${data?.length || 0}`);
    
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
    console.error("[API_ADMIN_USERS] Erro fatal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
