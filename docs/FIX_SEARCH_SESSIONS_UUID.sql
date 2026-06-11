-- FIX: Recrear tabla search_sessions con UUID correcto
-- Si existe data importante, hacer backup primero

-- Opción 1: Si la tabla está vacía, simplemente dropear y recrear
DROP TABLE IF EXISTS search_sessions CASCADE;

CREATE TABLE search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  city TEXT,
  category TEXT,
  pages_from INTEGER DEFAULT 2,
  pages_to INTEGER DEFAULT 4,
  status TEXT DEFAULT 'pending',
  total_found INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear índices para queries rápidas
CREATE INDEX idx_search_sessions_status ON search_sessions(status);
CREATE INDEX idx_search_sessions_created ON search_sessions(created_at DESC);

-- Opción 2 (Si la tabla tiene datos): Agregar columna nueva y migrar
-- ALTER TABLE search_sessions
-- ADD COLUMN IF NOT EXISTS id_new UUID DEFAULT gen_random_uuid();
-- UPDATE search_sessions SET id_new = gen_random_uuid() WHERE id_new IS NULL;
-- ALTER TABLE search_sessions DROP COLUMN id;
-- ALTER TABLE search_sessions RENAME COLUMN id_new TO id;
-- ALTER TABLE search_sessions ADD PRIMARY KEY (id);
