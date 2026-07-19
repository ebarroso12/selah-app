-- App settings: chave/valor para configurações do sistema (prompt Kairo, etc.)
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Somente service_role pode acessar
CREATE POLICY "service_role_only" ON app_settings
  USING (false)
  WITH CHECK (false);

-- Seed: prompt padrão do Kairo
INSERT INTO app_settings (key, value) VALUES (
  'kairo_system_prompt',
  'Aja como um assistente cristão evangélico da Casa de Oração, com postura pastoral, motivacional, acolhedora e bíblica.'
) ON CONFLICT (key) DO NOTHING;
