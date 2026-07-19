-- Migration 007: Tabela de logs do sistema de auto-avaliação e reparo
-- SELAH Healthcheck System

CREATE TABLE IF NOT EXISTS healthcheck_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  overall     TEXT NOT NULL CHECK (overall IN ('healthy', 'degraded', 'critical')),
  fixes_applied INTEGER DEFAULT 0,
  errors_found  INTEGER DEFAULT 0,
  duration_ms   INTEGER DEFAULT 0,
  checks        JSONB,
  ai_analysis   TEXT,
  ai_recommendations JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Índice para consultas por tempo
CREATE INDEX IF NOT EXISTS idx_healthcheck_logs_timestamp ON healthcheck_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_healthcheck_logs_overall   ON healthcheck_logs (overall);

-- RLS: apenas service_role pode ler/escrever
ALTER TABLE healthcheck_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "healthcheck_service_only"
  ON healthcheck_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Limpeza automática: manter apenas últimos 90 dias
CREATE OR REPLACE FUNCTION cleanup_old_healthcheck_logs()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM healthcheck_logs
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

COMMENT ON TABLE healthcheck_logs IS 'Logs do sistema de auto-avaliação e reparo com IA do SELAH';
