/**
 * Fixtures de teste para operações de admin.
 *
 * Usa a service_role key do Supabase para manipular dados diretamente,
 * sem passar pelo RLS. Útil para E2E que precisam de estado pré-configurado
 * (ex: aprovar usuário antes do teste de autenticação).
 *
 * ATENÇÃO: use apenas em ambiente de teste (CI ou banco de desenvolvimento).
 */
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[test/fixtures/admin] NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Aprova um usuário pelo email (define status = 'approved').
 * Utilizado em testes E2E que precisam de usuário aprovado.
 */
export async function approveUserByEmail(email: string): Promise<void> {
  const admin = getAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "approved" })
    .eq("email", email);

  if (error) throw new Error(`[approveUserByEmail] ${error.message}`);
}

/**
 * Promove um usuário a admin pelo email.
 */
export async function makeAdmin(email: string): Promise<void> {
  const admin = getAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: "admin", status: "approved" })
    .eq("email", email);

  if (error) throw new Error(`[makeAdmin] ${error.message}`);
}

/**
 * Cria um usuário de teste via Auth e retorna { id, email }.
 */
export async function createTestUser(email: string, password: string) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(`[createTestUser] ${error.message}`);
  return { id: data.user!.id, email };
}

/**
 * Remove um usuário de teste pelo email (limpa auth + profile).
 */
export async function deleteTestUser(email: string): Promise<void> {
  const admin = getAdminClient();

  // Busca o ID pelo email
  const { data } = await admin.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === email);
  if (!user) return;

  await admin.from("profiles").delete().eq("id", user.id);
  await admin.auth.admin.deleteUser(user.id);
}
