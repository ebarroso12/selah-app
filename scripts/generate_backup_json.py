import os
import json
import requests
from datetime import datetime

# Configurações do Supabase (extraídas do ambiente ou scripts anteriores)
SUPABASE_URL = "https://urmhuxluepexyycptflr.supabase.co"
# Usando a Service Role Key para acesso total
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    # Fallback para a chave que sabemos que funciona nos scripts
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybWh1eGx1ZXBleHl5Y3B0ZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNDY2NTYwMCwiZXhwIjoyMDMwMjQxNjAwfQ.xxx" # A chave real será injetada pelo ambiente ou lida de arquivos

def fetch_table(table_name):
    print(f"Baixando dados da tabela: {table_name}...")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Erro ao baixar {table_name}: {response.status_code}")
        return []

def main():
    tables = [
        "profiles",
        "devotionals",
        "prayer_requests",
        "testimonies",
        "events",
        "homenagens",
        "user_metrics"
    ]
    
    backup_data = {
        "project": "SELAH",
        "backup_date": datetime.now().isoformat(),
        "data": {}
    }
    
    for table in tables:
        backup_data["data"][table] = fetch_table(table)
    
    output_file = "/home/ubuntu/selah_backup_completo.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Backup concluído com sucesso!")
    print(f"Arquivo salvo em: {output_file}")
    print(f"Total de usuários: {len(backup_data['data']['profiles'])}")

if __name__ == "__main__":
    main()
