import requests

URL = "https://urmhuxluepexyycptflr.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"
h = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

# Buscar por Giovanni em profiles
r = requests.get(f"{URL}/rest/v1/profiles?full_name=ilike.*giovanni*&select=id,full_name,email,status", headers=h)
profiles = r.json()
print("Profiles encontrados:", profiles)

# Buscar também na auth.users via Admin API
r2 = requests.get(f"{URL}/auth/v1/admin/users?page=1&per_page=100", headers=h)
users = r2.json().get("users", [])
giovanni_users = [u for u in users if "giovanni" in (u.get("email", "") + u.get("user_metadata", {}).get("full_name", "")).lower()]
print("Auth users Giovanni:", [(u["id"], u.get("email"), u.get("user_metadata", {}).get("full_name")) for u in giovanni_users])

# Aprovar todos os Giovannis encontrados em profiles
for p in profiles:
    uid = p["id"]
    r3 = requests.patch(
        f"{URL}/rest/v1/profiles?id=eq.{uid}",
        headers={**h, "Prefer": "return=representation"},
        json={"status": "approved"}
    )
    print(f"Aprovado profile {p['full_name']} ({p['email']}): {r3.status_code}")

# Se Giovanni está na auth mas sem profile, criar profile
existing_ids = {p["id"] for p in profiles}
for u in giovanni_users:
    uid = u["id"]
    if uid not in existing_ids:
        name = u.get("user_metadata", {}).get("full_name") or u.get("user_metadata", {}).get("name") or u["email"].split("@")[0]
        r4 = requests.post(
            f"{URL}/rest/v1/profiles",
            headers={**h, "Prefer": "return=representation"},
            json={
                "id": uid,
                "email": u["email"],
                "full_name": name,
                "status": "approved",
                "gender": "male",
                "church_name": "",
                "city": "",
                "state": "",
            }
        )
        print(f"Perfil criado para {name} ({u['email']}): {r4.status_code} {r4.text[:200]}")
    else:
        # Garantir aprovação
        r5 = requests.patch(
            f"{URL}/rest/v1/profiles?id=eq.{uid}",
            headers={**h, "Prefer": "return=representation"},
            json={"status": "approved"}
        )
        print(f"Aprovado auth user {u['email']}: {r5.status_code}")

print("\nConcluído!")
