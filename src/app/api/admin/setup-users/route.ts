import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Rota temporária de setup - será removida após uso
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // Proteção básica
  if (secret !== "selah-setup-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // 1. Verificar se o perfil do Geovane já existe
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "geovaneluiz53@gmail.com")
      .maybeSingle();

    let geovaneResult = "already exists";
    
    if (!existingProfile) {
      // Criar perfil do Geovane
      const { error: profileError } = await supabase.from("profiles").insert({
        id: "5b25a986-d975-429b-b1b9-e7c4d5ace194",
        email: "geovaneluiz53@gmail.com",
        full_name: "Geovane Luiz",
        status: "approved",
        gender: "male",
        church_name: "Casa de Oração",
        city: "São Paulo",
        state: "SP"
      });
      geovaneResult = profileError ? `error: ${profileError.message}` : "created successfully";
    }

    // 2. Aprovar todos os usuários com status pending
    const { data: updatedUsers, error: updateError } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .in("status", ["pending"])
      .select("id, email, status");

    return NextResponse.json({
      success: true,
      geovane: geovaneResult,
      approvedUsers: updatedUsers?.length ?? 0,
      updateError: updateError?.message ?? null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
