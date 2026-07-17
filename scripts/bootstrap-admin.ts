/**
 * Bootstrap: cria o primeiro usuário admin no banco novo.
 *
 * Uso:
 *   INITIAL_ADMIN_EMAIL=admin@selah.app npm run seed:admin
 *
 * Requer:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   INITIAL_ADMIN_EMAIL
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL   = process.env.INITIAL_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
const TEMP_PASSWORD = `Selah@${new Date().getFullYear()}!`;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!ADMIN_EMAIL) {
  console.error("❌ Defina INITIAL_ADMIN_EMAIL=email@dominio.com");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🔐 Bootstrap Admin — ${ADMIN_EMAIL}\n`);

  // 1. Verifica se auth user já existe
  const { data: { users } } = await supabase.auth.admin.listUsers();
  let authUser = users.find((u) => u.email === ADMIN_EMAIL);

  if (!authUser) {
    console.log("  → Criando usuário no Supabase Auth...");
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: TEMP_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`Auth create: ${error.message}`);
    authUser = data.user!;
    console.log(`  ✓ Usuário criado: ${authUser.id}`);
  } else {
    console.log(`  ✓ Usuário já existe: ${authUser.id}`);
  }

  // 2. Upsert profile com role=admin, status=approved
  const { error: profileError } = await supabase.from("profiles").upsert({
    id:        authUser.id,
    email:     ADMIN_EMAIL!,
    full_name: "Admin",
    role:      "admin",
    status:    "approved",
  }, { onConflict: "id" });

  if (profileError) throw new Error(`Profile upsert: ${profileError.message}`);
  console.log("  ✓ Profile admin criado/atualizado\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Senha    : ${TEMP_PASSWORD}`);
  console.log("  ⚠  Troque a senha no primeiro acesso!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✅ Admin configurado com sucesso.");
}

main().catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
