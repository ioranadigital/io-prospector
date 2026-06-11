-- ================================================================
-- CREATE TABLE: io_pro_audit_logs
-- Purpose: Track all audit executions with statistics
-- ================================================================

CREATE TABLE io_pro_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url VARCHAR(500) NOT NULL,
  total_score INTEGER,
  total_checks INTEGER,
  enabled_checks INTEGER,
  pass_count INTEGER,
  warn_count INTEGER,
  fail_count INTEGER,
  info_count INTEGER,
  duration_ms INTEGER,
  performance JSONB, -- { ttfb, lcp, cls, fcp }
  top_issues JSONB,  -- Array de top 5 issues
  categories JSONB,  -- Scores por categoría
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para queries comunes
CREATE INDEX idx_io_pro_audit_logs_url ON io_pro_audit_logs(url);
CREATE INDEX idx_io_pro_audit_logs_created_at ON io_pro_audit_logs(created_at DESC);
CREATE INDEX idx_io_pro_audit_logs_score ON io_pro_audit_logs(total_score DESC);

-- Vista para tendencias diarias
CREATE VIEW io_pro_audit_logs_daily AS
SELECT
  DATE(created_at) as audit_date,
  COUNT(*) as total_audits,
  AVG(total_score) as avg_score,
  MIN(total_score) as min_score,
  MAX(total_score) as max_score,
  AVG(duration_ms) as avg_duration_ms
FROM io_pro_audit_logs
WHERE error_message IS NULL
GROUP BY DATE(created_at)
ORDER BY audit_date DESC;

-- Vista para URLs más auditadas
CREATE VIEW io_pro_audit_logs_top_urls AS
SELECT
  url,
  COUNT(*) as audit_count,
  AVG(total_score) as avg_score,
  MAX(total_score) as best_score,
  MAX(created_at) as last_audit_at
FROM io_pro_audit_logs
WHERE error_message IS NULL
GROUP BY url
ORDER BY audit_count DESC, last_audit_at DESC
LIMIT 20;

-- Habilitar RLS (opcional pero recomendado)
ALTER TABLE io_pro_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Leer solo audits propios (si tienes user_id)
-- CREATE POLICY "Select own audits" ON io_pro_audit_logs
--   FOR SELECT USING (auth.uid()::text = user_id);
