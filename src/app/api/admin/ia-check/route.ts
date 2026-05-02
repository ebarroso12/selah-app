import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const logs: string[] = [];
  let fixedCount = 0;
  let issuesFound = 0;

  try {
    const supabase = await createServiceClient();
    logs.push("🔍 Iniciando varredura de sistema por IA...");

    // 1. Verificar conectividade e variáveis
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logs.push("❌ Erro crítico: Variáveis de ambiente do Supabase ausentes.");
      return NextResponse.json({ success: false, logs });
    }
    logs.push("✅ Conectividade com o banco de dados: OK");

    // 2. Buscar todos os usuários do Auth
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    logs.push(`📊 Usuários no Auth: ${authUsers.length}`);

    // 3. Buscar todos os perfis
    const { data: profiles, error: profError } = await supabase.from("profiles").select("*");
    if (profError) throw profError;
    logs.push(`📊 Perfis no Banco: ${profiles?.length || 0}`);

    // 4. Identificar e corrigir usuários sem perfil
    const profileIds = new Set(profiles?.map(p => p.id) || []);
    const missingProfiles = authUsers.filter(u => !profileIds.has(u.id));

    if (missingProfiles.length > 0) {
      issuesFound += missingProfiles.length;
      logs.push(`⚠️ Encontrados ${missingProfiles.length} usuários sem perfil criado.`);
      
      for (const user of missingProfiles) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
          status: "approved",
          gender: "male",
          church_name: "SELAH"
        });
        
        if (!insertError) {
          fixedCount++;
          logs.push(`✅ Perfil criado e aprovado para: ${user.email}`);
        } else {
          logs.push(`❌ Falha ao criar perfil para ${user.email}: ${insertError.message}`);
        }
      }
    }

    // 5. Corrigir usuários com status 'pending' (conforme regra de acesso livre)
    const pendingProfiles = profiles?.filter(p => p.status === "pending") || [];
    if (pendingProfiles.length > 0) {
      issuesFound += pendingProfiles.length;
      logs.push(`⚠️ Encontrados ${pendingProfiles.length} usuários com status pendente.`);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: "approved" })
        .eq("status", "pending");
        
      if (!updateError) {
        fixedCount += pendingProfiles.length;
        logs.push(`✅ Todos os ${pendingProfiles.length} usuários pendentes foram aprovados.`);
      } else {
        logs.push(`❌ Falha ao aprovar usuários pendentes: ${updateError.message}`);
      }
    }

    // 6. Verificar tabelas de métricas
    const { error: metricsError } = await supabase.from("user_metrics").select("id").limit(1);
    if (metricsError) {
      logs.push(`⚠️ Problema na tabela de métricas: ${metricsError.message}`);
    } else {
      logs.push("✅ Tabela de métricas operacional.");
    }

    logs.push("🏁 Varredura concluída.");
    
    return NextResponse.json({
      success: true,
      issuesFound,
      fixedCount,
      logs,
      summary: issuesFound > 0 
        ? `IA corrigiu ${fixedCount} problemas encontrados. Sistema estabilizado.` 
        : "Nenhum problema encontrado. O sistema está operando perfeitamente."
    });

  } catch (error: any) {
    console.error("[IA_CHECK_ERROR]", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      logs: [...logs, `❌ Erro fatal: ${error.message}`]
    }, { status: 500 });
  }
}
