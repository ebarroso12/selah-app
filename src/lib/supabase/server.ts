import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createServerClient<any>>;

async function buildClient(key: string, label: string): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL não configurada. " +
        "Verifique as variáveis de ambiente do Vercel."
    );
  }
  if (!key) {
    throw new Error(
      `[Supabase] ${label} não configurada. ` +
        "Verifique as variáveis de ambiente do Vercel."
    );
  }

  const cookieStore = await cookies();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado de Server Component — cookies definidos pelo middleware
        }
      },
    },
  });
}

export async function createClient() {
  return buildClient(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export async function createServiceClient() {
  return buildClient(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    "SUPABASE_SERVICE_ROLE_KEY"
  );
}
