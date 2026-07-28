-- El check constraint de outcome solo permitía sent/failed/pending (todos
-- pensados para actividad saliente). Las respuestas entrantes de WhatsApp
-- (io_pro_lead_activities con direction='inbound') necesitan un outcome
-- propio — 'received' — que no encaja en ninguno de los existentes.
ALTER TABLE io_pro_lead_activities DROP CONSTRAINT IF EXISTS io_pro_lead_activities_outcome_check;
ALTER TABLE io_pro_lead_activities ADD CONSTRAINT io_pro_lead_activities_outcome_check
  CHECK (outcome = ANY (ARRAY['sent'::text, 'failed'::text, 'pending'::text, 'received'::text]));
