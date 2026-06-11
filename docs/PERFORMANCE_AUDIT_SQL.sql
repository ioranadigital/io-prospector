-- ALTER TABLE para agregar columnas de Performance Audit
ALTER TABLE io_pro_scraping_raw
ADD COLUMN IF NOT EXISTS ttfb_ms INTEGER,
ADD COLUMN IF NOT EXISTS lcp_ms INTEGER,
ADD COLUMN IF NOT EXISTS cls NUMERIC,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS canonical_is_valid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS h1_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS h1_is_unique BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS robots_txt_status TEXT,
ADD COLUMN IF NOT EXISTS has_noindex BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS top_issue TEXT,
ADD COLUMN IF NOT EXISTS top_issue_severity TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_top_issue_severity ON io_pro_scraping_raw(top_issue_severity);
CREATE INDEX IF NOT EXISTS idx_ttfb ON io_pro_scraping_raw(ttfb_ms);
CREATE INDEX IF NOT EXISTS idx_lcp ON io_pro_scraping_raw(lcp_ms);
