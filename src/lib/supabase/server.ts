import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Credenciais do projeto SELAH — hardcoded como fallback quando env vars não estão disponíveis no Vercel
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://urmhuxluepexyycptflr.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjY1OTksImV4cCI6MjA5MzIwMjU5OX0.xkJe3vAe8ofuDm5E81ZwksXBqz9N1TLrwf0KkalFYHo";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createServerClient<any>>;

async function buildClient(key: string): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(SUPABASE_URL, key, {
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
  return buildClient(SUPABASE_ANON_KEY);
}

export async function createServiceClient() {
  return buildClient(SUPABASE_SERVICE_KEY);
}
