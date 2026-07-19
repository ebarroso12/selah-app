#!/usr/bin/env python3
import requests

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# Usar o endpoint de informações do schema via SQL RPC
sql = """
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
"""

resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"sql": sql},
)
print(resp.status_code, resp.text[:500])

# Tentar via query direta
resp2 = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?limit=1",
    headers={**headers, "Accept": "application/json"},
)
print("\nHeaders de resposta:", dict(resp2.headers).get("Content-Profile", ""))
# Ver um perfil existente para entender a estrutura
import json
profiles = resp2.json()
if profiles:
    print("\nEstrutura de um perfil existente:")
    print(json.dumps(profiles[0], indent=2, ensure_ascii=False))
