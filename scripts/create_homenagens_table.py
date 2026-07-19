#!/usr/bin/env python3
"""
Cria a tabela homenagens no Supabase via API REST (service role key).
"""
import requests
import json

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

SQL = """
CREATE TABLE IF NOT EXISTS public.homenagens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  autor_nome text NOT NULL,
  autor_instagram text,
  autor_legendario_numero text,
  homenageado_nome text NOT NULL,
  homenageado_parentesco text NOT NULL,
  homenageado_instagram text,
  homenageado_legendario boolean DEFAULT false,
  texto text NOT NULL,
  foto_capa_url text,
  foto2_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.homenagens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'homenagens' AND policyname = 'homenagens_select_all'
  ) THEN
    CREATE POLICY homenagens_select_all ON public.homenagens FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'homenagens' AND policyname = 'homenagens_insert_auth'
  ) THEN
    CREATE POLICY homenagens_insert_auth ON public.homenagens FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;
"""

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# Usar endpoint de SQL do Supabase (Management API)
resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"query": SQL},
    timeout=30,
)

print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:500]}")

if resp.status_code in (200, 201, 204):
    print("✅ Tabela homenagens criada com sucesso!")
else:
    print("❌ Erro ao criar tabela. Tentando via pg_meta...")

    # Tentar via pg_meta (endpoint interno do Supabase)
    resp2 = requests.post(
        f"{SUPABASE_URL}/pg/query",
        headers=headers,
        json={"query": SQL},
        timeout=30,
    )
    print(f"pg_meta Status: {resp2.status_code}")
    print(f"pg_meta Response: {resp2.text[:500]}")
