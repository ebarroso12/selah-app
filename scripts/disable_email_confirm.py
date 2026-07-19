import requests

URL = "https://urmhuxluepexyycptflr.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"
h = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

# Tentar via Supabase Management API (requer access token pessoal, não service role)
# Alternativa: confirmar manualmente todos os usuários não confirmados

# Listar usuários não confirmados
r = requests.get(f"{URL}/auth/v1/admin/users?page=1&per_page=200", headers=h)
users = r.json().get("users", [])

unconfirmed = [u for u in users if not u.get("email_confirmed_at")]
print(f"Usuários sem email confirmado: {len(unconfirmed)}")
for u in unconfirmed:
    name = u.get("user_metadata", {}).get("full_name") or u.get("user_metadata", {}).get("name") or "-"
    print(f"  - {name} | {u.get('email')}")

# Confirmar email de todos os não confirmados via Admin API
for u in unconfirmed:
    uid = u["id"]
    r2 = requests.put(
        f"{URL}/auth/v1/admin/users/{uid}",
        headers=h,
        json={"email_confirm": True}
    )
    name = u.get("user_metadata", {}).get("full_name") or u.get("email", "-")
    if r2.status_code in (200, 201):
        print(f"✓ Email confirmado: {name}")
    else:
        print(f"✗ Erro ao confirmar {name}: {r2.status_code} {r2.text[:200]}")

# Também garantir que todos têm perfil approved
print("\nVerificando perfis...")
profile_ids = set()
rp = requests.get(f"{URL}/rest/v1/profiles?select=id", headers=h)
for p in rp.json():
    profile_ids.add(p["id"])

for u in users:
    uid = u["id"]
    if uid not in profile_ids:
        name = u.get("user_metadata", {}).get("full_name") or u.get("user_metadata", {}).get("name") or u.get("email", "").split("@")[0]
        email = u.get("email", "")
        r3 = requests.post(
            f"{URL}/rest/v1/profiles",
            headers={**h, "Prefer": "return=representation"},
            json={
                "id": uid,
                "email": email,
                "full_name": name,
                "status": "approved",
                "gender": "male",
                "church_name": "",
                "city": "",
                "state": "",
            }
        )
        if r3.status_code in (200, 201):
            print(f"✓ Perfil criado: {name} ({email})")
        else:
            print(f"✗ Erro ao criar perfil {name}: {r3.status_code} {r3.text[:200]}")

print("\nConcluído!")
