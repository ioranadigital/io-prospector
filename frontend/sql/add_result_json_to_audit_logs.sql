-- Añade almacenamiento del detalle completo de cada auditoría
-- para poder reabrir el resultado histórico (replicando /audit-resultados).
-- Ejecutar en Supabase SQL Editor.

ALTER TABLE io_pro_audit_logs
  ADD COLUMN IF NOT EXISTS result_json jsonb;

COMMENT ON COLUMN io_pro_audit_logs.result_json IS
  'Resultado completo de la auditoría (categorías, checks, performance) tal como se mostró en /audit-resultados.';
