-- ============================================================
-- SELAH — Migração 002: Campos extras no perfil + admin_alerts
-- ============================================================

-- Adicionar colunas extras na tabela profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS wants_to_be_legendario boolean NOT NULL DEFAULT false;

-- ============================================================
-- ADMIN ALERTS — Alertas para o admin master
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL DEFAULT 'new_user',  -- 'new_user', 'new_prayer', etc.
  title       text NOT NULL,
  body        text NOT NULL,
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  data        jsonb,
  read_at     timestamptz,
  dismissed   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: apenas admin pode ver/deletar alertas
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

-- Permitir service_role inserir (sem RLS)
CREATE POLICY "admin_alerts_service_insert" ON admin_alerts
  FOR INSERT WITH CHECK (true);

-- Apenas admin pode ler e atualizar
CREATE POLICY "admin_alerts_admin_read" ON admin_alerts
  FOR SELECT USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "admin_alerts_admin_update" ON admin_alerts
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "admin_alerts_admin_delete" ON admin_alerts
  FOR DELETE USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    OR auth.role() = 'service_role'
  );

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_dismissed ON admin_alerts(dismissed, created_at DESC);
