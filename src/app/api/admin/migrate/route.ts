import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Rota protegida para executar migrações — apenas admin pode chamar
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const secret = process.env.CRON_SECRET ?? process.env.ADMIN_EMAIL ?? "";
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const migrations = [
    // Adicionar colunas extras ao profiles
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date date`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants_to_be_legendario boolean NOT NULL DEFAULT false`,

    // Criar tabela admin_alerts
    `CREATE TABLE IF NOT EXISTS admin_alerts (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      type        text NOT NULL DEFAULT 'new_user',
      title       text NOT NULL,
      body        text NOT NULL,
      user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
      data        jsonb,
      dismissed   boolean NOT NULL DEFAULT false,
      created_at  timestamptz NOT NULL DEFAULT now()
    )`,

    // Índices
    `CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_admin_alerts_dismissed ON admin_alerts(dismissed, created_at DESC)`,
  ];

  const results = [];
  for (const sql of migrations) {
    try {
      const { error } = await supabase.rpc("exec_sql", { query: sql }).single();
      results.push({ sql: sql.substring(0, 60), error: error?.message ?? null });
    } catch (e) {
      results.push({ sql: sql.substring(0, 60), error: String(e) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
