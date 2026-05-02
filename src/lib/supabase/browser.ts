import { createBrowserClient } from "@supabase/ssr";

// Credenciais do projeto SELAH — hardcoded como fallback quando env vars não estão disponíveis no Vercel
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://urmhuxluepexyycptflr.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjY1OTksImV4cCI6MjA5MzIwMjU5OX0.xkJe3vAe8ofuDm5E81ZwksXBqz9N1TLrwf0KkalFYHo";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (typeof window === "undefined") {
    return null as unknown as ReturnType<typeof createBrowserClient>;
  }
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
