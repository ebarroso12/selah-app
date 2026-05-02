"""
Adiciona coluna login_count na tabela profiles via Supabase Management API.
"""
import requests

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
PROJECT_REF = "urmhuxluepexyycptflr"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# Usar a API de SQL do Supabase via pg endpoint
sql = """
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;
"""

# Tentar via Supabase Management API
import os
MGMT_TOKEN = os.environ.get("SUPABASE_MGMT_TOKEN", "")

if MGMT_TOKEN:
    resp = requests.post(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"},
        json={"query": sql}
    )
    print(f"Management API: {resp.status_code} - {resp.text[:200]}")
else:
    # Tentar via REST com função RPC customizada
    # Como não temos exec_sql, vamos usar o endpoint de migrations
    print("Tentando via endpoint de migrations...")
    
    # Verificar se a coluna já existe
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/profiles?select=login_count&limit=1",
        headers=headers
    )
    if resp.status_code == 200:
        print("✓ Coluna login_count já existe!")
    else:
        print(f"Coluna não existe ainda: {resp.status_code} - {resp.text[:200]}")
        print("\nPrecisa adicionar manualmente via Supabase Dashboard:")
        print("  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;")
