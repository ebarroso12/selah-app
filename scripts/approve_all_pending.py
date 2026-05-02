"""
Aprova todos os usuários pendentes e cria perfis para quem está no auth mas sem perfil.
"""
import requests

SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# 1. Aprovar todos os pendentes
print("=== Aprovando usuários pendentes ===")
resp = requests.patch(
    f"{SUPABASE_URL}/rest/v1/profiles?status=eq.pending",
    headers=headers,
    json={"status": "approved"}
)
print(f"Status: {resp.status_code}")
if resp.text and resp.text != "[]":
    data = resp.json()
    print(f"Aprovados: {len(data) if isinstance(data, list) else data}")
else:
    print("Nenhum pendente encontrado (ou já aprovados).")

# 2. Listar todos os usuários do auth
print("\n=== Listando usuários do auth ===")
resp = requests.get(
    f"{SUPABASE_URL}/auth/v1/admin/users?per_page=500",
    headers=headers
)
if resp.status_code != 200:
    print(f"Erro: {resp.status_code} - {resp.text}")
    exit(1)

auth_users = resp.json().get("users", [])
print(f"Total no auth: {len(auth_users)}")

# 3. Listar todos os perfis existentes
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?select=id,email,full_name,status",
    headers=headers
)
profiles = {p["id"]: p for p in resp.json()}
print(f"Total com perfil: {len(profiles)}")

# 4. Criar perfis para quem não tem
sem_perfil = [u for u in auth_users if u["id"] not in profiles]
print(f"Sem perfil: {len(sem_perfil)}")

for u in sem_perfil:
    email = u.get("email", "")
    full_name = (
        u.get("user_metadata", {}).get("full_name") or
        u.get("user_metadata", {}).get("name") or
        (email.split("@")[0] if email else "Usuário")
    )
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/profiles",
        headers=headers,
        json={
            "id": u["id"],
            "email": email,
            "full_name": full_name,
            "status": "approved",
            "gender": "male",
            "church_name": "",
            "city": "",
            "state": "",
        }
    )
    if resp.status_code in (200, 201):
        print(f"  ✓ Perfil criado: {full_name} ({email})")
    else:
        print(f"  ✗ Erro para {email}: {resp.status_code} - {resp.text[:120]}")

# 5. Resumo final
print("\n=== Resumo final ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,status,last_seen_at",
    headers=headers
)
all_profiles = resp.json()
approved = [p for p in all_profiles if p["status"] == "approved"]
never_logged = [p for p in all_profiles if not p.get("last_seen_at")]
print(f"Total cadastrados: {len(all_profiles)}")
print(f"Aprovados: {len(approved)}")
print(f"Nunca fizeram login: {len(never_logged)}")
for p in never_logged:
    print(f"  - {p['full_name']} ({p['email']})")
