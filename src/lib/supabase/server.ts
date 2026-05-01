import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createServerClient<any>>;

async function buildClient(key: string): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
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
            // Called from Server Component — cookies set by proxy
          }
        },
      },
    }
  );
}

export async function createClient() {
  return buildClient(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function createServiceClient() {
  return buildClient(process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
