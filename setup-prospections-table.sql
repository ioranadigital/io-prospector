-- ============================================================
-- Setup: Prospecciones Guardadas (io_prosp_search_sessions)
-- Iorana Digital — Prospector
-- ============================================================
-- Ejecutar en Supabase SQL Editor para configurar la tabla

-- 1. DROP y RECREATE tabla (si existe)
DROP TABLE IF EXISTS io_prosp_search_sessions CASCADE;

-- 2. CREATE tabla con ID como TEXT
CREATE TABLE io_prosp_search_sessions (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT,
  pages_from INTEGER DEFAULT 2,
  pages_to INTEGER DEFAULT 4,
  status TEXT DEFAULT 'pending',
  total_found INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX idx_io_prosp_search_sessions_status ON io_prosp_search_sessions(status);
CREATE INDEX idx_io_prosp_search_sessions_city ON io_prosp_search_sessions(city);
CREATE INDEX idx_io_prosp_search_sessions_created_at ON io_prosp_search_sessions(created_at DESC);

-- 4. Enable RLS
ALTER TABLE io_prosp_search_sessions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Allow authenticated users to INSERT their own prospections
CREATE POLICY "Allow inserts for authenticated users"
  ON io_prosp_search_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. RLS Policy: Allow authenticated users to SELECT all prospections
CREATE POLICY "Allow select for authenticated users"
  ON io_prosp_search_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- 7. RLS Policy: Allow authenticated users to UPDATE prospections
CREATE POLICY "Allow updates for authenticated users"
  ON io_prosp_search_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. RLS Policy: Allow authenticated users to DELETE prospections
CREATE POLICY "Allow deletes for authenticated users"
  ON io_prosp_search_sessions
  FOR DELETE
  TO authenticated
  USING (true);

-- 9. Verification
SELECT
  table_name,
  (SELECT array_agg(attname) FROM pg_attribute WHERE attrelid = c.oid) as columns
FROM information_schema.tables t
JOIN pg_class c ON t.table_name = c.relname
WHERE table_schema = 'public' AND table_name = 'io_prosp_search_sessions';
