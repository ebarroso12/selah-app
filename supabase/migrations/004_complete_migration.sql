-- ============================================================
-- MIGRAÇÃO COMPLETA SELAH APP
-- Execute este SQL no Supabase SQL Editor do projeto
-- ============================================================

-- 1. Adicionar colunas extras ao profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants_to_be_legendario BOOLEAN DEFAULT FALSE;

-- 2. Garantir que novos usuários entrem como 'approved' automaticamente
ALTER TABLE profiles ALTER COLUMN status SET DEFAULT 'approved';

-- 3. Aprovar todos os usuários pendentes
UPDATE profiles SET status = 'approved' WHERE status = 'pending';

-- 4. Criar tabela de uso de tokens (IA)
CREATE TABLE IF NOT EXISTS token_usage (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature           TEXT NOT NULL,
  model             TEXT,
  prompt_tokens     INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  tokens_used       INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS para token_usage
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'token_usage' AND policyname = 'service_role_all_token_usage'
  ) THEN
    CREATE POLICY service_role_all_token_usage ON token_usage
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'token_usage' AND policyname = 'users_read_own_token_usage'
  ) THEN
    CREATE POLICY users_read_own_token_usage ON token_usage
      FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- 6. Adicionar colunas de métricas ao user_metrics
ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS kairo_interactions INT DEFAULT 0;
ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS bible_searches INT DEFAULT 0;
ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS prayer_count INT DEFAULT 0;
ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS theology_queries INT DEFAULT 0;
ALTER TABLE user_metrics ADD COLUMN IF NOT EXISTS exegese_queries INT DEFAULT 0;

-- 7. Criar tabela admin_alerts para notificações de novos cadastros
CREATE TABLE IF NOT EXISTS admin_alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL DEFAULT 'new_user',
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  data       JSONB,
  dismissed  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_created   ON admin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_dismissed ON admin_alerts(dismissed, created_at DESC);

-- RLS para admin_alerts (somente service_role e admin podem ver)
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_alerts' AND policyname = 'service_role_all_admin_alerts'
  ) THEN
    CREATE POLICY service_role_all_admin_alerts ON admin_alerts
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_alerts' AND policyname = 'admin_read_alerts'
  ) THEN
    CREATE POLICY admin_read_alerts ON admin_alerts
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================
