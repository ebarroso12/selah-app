-- ============================================================
-- SELAH — Migração 003: Token Usage + Métricas detalhadas
-- ============================================================

-- Adicionar colunas extras em user_metrics para rastrear interações por seção
ALTER TABLE user_metrics
  ADD COLUMN IF NOT EXISTS kairo_interactions   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS biblia_interactions  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estudo_interactions  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS teologia_interactions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exegese_interactions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS oracao_interactions  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS devocional_interactions integer NOT NULL DEFAULT 0;

-- ============================================================
-- TOKEN USAGE — Registro de consumo de tokens de IA por usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS token_usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  api_name        text NOT NULL,  -- 'kairo', 'devocional', 'biblia', 'estudo', 'teologia', 'exegese'
  model           text NOT NULL,  -- 'gpt-4o-mini', 'claude-sonnet-4-5', etc.
  prompt_tokens   integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens    integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: usuário vê apenas os próprios; admin vê todos via service_role
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "token_usage_own_read" ON token_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "token_usage_service_insert" ON token_usage
  FOR INSERT WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_token_usage_user ON token_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_api ON token_usage(api_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(created_at DESC);

-- ============================================================
-- ADMIN ALERTS — Alertas para o admin master
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL DEFAULT 'new_user',
  title       text NOT NULL,
  body        text NOT NULL,
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  data        jsonb,
  dismissed   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_alerts_service_insert" ON admin_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_alerts_service_all" ON admin_alerts
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_dismissed ON admin_alerts(dismissed, created_at DESC);

-- ============================================================
-- Colunas extras em profiles (cadastro completo)
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS wants_to_be_legendario boolean NOT NULL DEFAULT false;
