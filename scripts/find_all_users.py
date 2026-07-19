import requests

URL = "https://urmhuxluepexyycptflr.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNjU5OSwiZXhwIjoyMDkzMjAyNTk5fQ.d_tWHDdQv8vdqQGCAefAnUcmnaYAnAAb0emUXuQ5TkA"
h = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

# Listar TODOS os profiles
r = requests.get(f"{URL}/rest/v1/profiles?select=id,full_name,email,status&order=created_at.desc&limit=200", headers=h)
profiles = r.json()
print(f"\n=== TODOS OS PROFILES ({len(profiles)}) ===")
for p in profiles:
    print(f"  [{p['status']:10}] {p['full_name']:30} | {p['email']}")

# Listar TODOS os auth users
r2 = requests.get(f"{URL}/auth/v1/admin/users?page=1&per_page=200", headers=h)
users = r2.json().get("users", [])
print(f"\n=== TODOS OS AUTH USERS ({len(users)}) ===")
for u in users:
    name = u.get("user_metadata", {}).get("full_name") or u.get("user_metadata", {}).get("name") or "-"
    confirmed = "✓" if u.get("email_confirmed_at") else "✗"
    print(f"  [{confirmed}] {name:30} | {u.get('email', '-')}")
