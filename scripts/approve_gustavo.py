#!/usr/bin/env python3
"""
Busca e aprova o usuário Gustavo no Supabase SELAH.
"""
import requests
import json

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# Buscar todos os perfis com nome contendo "gustavo" (case insensitive)
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?full_name=ilike.*gustavo*&select=id,full_name,email,status",
    headers=headers,
)
print("Perfis encontrados:", json.dumps(resp.json(), indent=2, ensure_ascii=False))

profiles = resp.json()
if not profiles:
    print("\nNenhum perfil com 'gustavo' encontrado. Buscando todos os perfis...")
    resp2 = requests.get(
        f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,status&order=created_at.desc&limit=20",
        headers=headers,
    )
    print("Últimos 20 perfis:", json.dumps(resp2.json(), indent=2, ensure_ascii=False))
else:
    for p in profiles:
        pid = p["id"]
        print(f"\nAprovando: {p['full_name']} ({p.get('email', 'sem email')}) — status atual: {p.get('status')}")
        # Atualizar status para approved
        upd = requests.patch(
            f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{pid}",
            headers={**headers, "Prefer": "return=representation"},
            json={"status": "approved"},
        )
        print("Resultado:", upd.status_code, upd.text[:200])
