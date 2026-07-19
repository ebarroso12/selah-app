-- AI Budget: orçamento de IA por usuário com reset semanal/mensal

-- Tabela ai_budgets: wallet agregada por usuário e janela
CREATE TABLE IF NOT EXISTS ai_budgets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start  timestamptz NOT NULL,
  period_end    timestamptz NOT NULL,
  tokens_used   bigint NOT NULL DEFAULT 0,
  cost_brl      numeric(10,4) NOT NULL DEFAULT 0,
  bonus_brl     numeric(10,4) NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_ai_budgets_user_period ON ai_budgets(user_id, period_end);

-- Coluna em profiles para override individual (null = usa default global)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_budget_brl numeric(10,2);

-- Seeds em app_settings
INSERT INTO app_settings (key, value) VALUES
  ('ai_default_budget_brl', '5.00'),
  ('ai_reset_period', 'monthly'),
  ('ai_usd_to_brl', '5.20'),
  ('ai_pricing_usd', '{"gpt-4o-mini":{"input":0.15,"output":0.60}}')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE ai_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin reads all budgets" ON ai_budgets
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "user reads own budget" ON ai_budgets
  FOR SELECT USING (user_id = auth.uid());

-- Writes só via service role (sem policy de INSERT/UPDATE pra usuários comuns)
