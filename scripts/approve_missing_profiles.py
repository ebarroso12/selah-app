#!/usr/bin/env python3
"""
Cria perfis aprovados para usuários auth que ainda não têm perfil na tabela profiles.
"""
import requests
import json

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Buscar todos os usuários auth
auth_resp = requests.get(
    f"{SUPABASE_URL}/auth/v1/admin/users?per_page=50",
    headers=headers,
)
auth_users = auth_resp.json().get("users", [])

# Buscar todos os perfis existentes
profiles_resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,status",
    headers=headers,
)
existing_profiles = {p["id"]: p for p in profiles_resp.json()}

print(f"Usuários auth: {len(auth_users)}")
print(f"Perfis existentes: {len(existing_profiles)}")
print()

# Criar perfis para quem não tem
for u in auth_users:
    uid = u["id"]
    email = u["email"]
    meta = u.get("user_metadata", {})
    name = meta.get("full_name", meta.get("name", email.split("@")[0]))

    if uid in existing_profiles:
        p = existing_profiles[uid]
        print(f"OK  {name} ({email}) — status: {p.get('status')}")
    else:
        print(f"CRIANDO perfil para: {name} ({email})")
        insert_resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/profiles",
            headers=headers,
            json={
                "id": uid,
                "email": email,
                "full_name": name,
                "status": "approved",
                "gender": "male",
                "church_name": "",
                "city": "",
                "state": "",
            },
        )
        if insert_resp.status_code in (200, 201):
            print(f"  ✓ Perfil criado e aprovado!")
        else:
            print(f"  ✗ Erro {insert_resp.status_code}: {insert_resp.text[:200]}")
