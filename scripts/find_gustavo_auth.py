#!/usr/bin/env python3
"""
Busca o usuário Gustavo na tabela auth.users via Admin API do Supabase.
"""
import requests
import json

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
}

# Listar todos os usuários via Admin API
resp = requests.get(
    f"{SUPABASE_URL}/auth/v1/admin/users?per_page=50",
    headers=headers,
)
data = resp.json()
users = data.get("users", [])
print(f"Total de usuários auth: {len(users)}")
print()
for u in users:
    meta = u.get("user_metadata", {})
    name = meta.get("full_name", meta.get("name", ""))
    print(f"  - {u['email']} | {name} | confirmado: {u.get('email_confirmed_at', 'NÃO')[:10] if u.get('email_confirmed_at') else 'NÃO'}")
