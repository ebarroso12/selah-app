import requests

URL = "https://urmhuxluepexyycptflr.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"
h = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=representation"}

# Usuários sem perfil identificados
missing = [
    {"id": None, "email": "kairohenrique602@gmail.com", "full_name": "Kairo Henrique"},
    {"id": None, "email": "pauloabner405@gmail.com",    "full_name": "Abner Paulo"},
]

# Buscar IDs na auth
r = requests.get(f"{URL}/auth/v1/admin/users?page=1&per_page=200", headers=h)
auth_users = r.json().get("users", [])
auth_map = {u["email"]: u["id"] for u in auth_users}

for user in missing:
    uid = auth_map.get(user["email"])
    if not uid:
        print(f"✗ Não encontrado na auth: {user['email']}")
        continue

    # Verificar se já tem perfil
    rcheck = requests.get(f"{URL}/rest/v1/profiles?id=eq.{uid}&select=id,status", headers=h)
    existing = rcheck.json()
    if existing:
        # Já tem perfil — garantir approved
        rpatch = requests.patch(f"{URL}/rest/v1/profiles?id=eq.{uid}", headers=h, json={"status": "approved"})
        print(f"✓ Perfil atualizado para approved: {user['full_name']} ({user['email']}) — {rpatch.status_code}")
    else:
        # Criar perfil
        rins = requests.post(f"{URL}/rest/v1/profiles", headers=h, json={
            "id": uid,
            "email": user["email"],
            "full_name": user["full_name"],
            "status": "approved",
            "gender": "male",
            "church_name": "",
            "city": "",
            "state": "",
        })
        print(f"✓ Perfil criado: {user['full_name']} ({user['email']}) — {rins.status_code}")
        if rins.status_code not in (200, 201):
            print(f"  Erro: {rins.text[:300]}")

print("\nConcluído!")
