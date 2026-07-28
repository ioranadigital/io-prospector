-- io_pro_lead_activities no tenía columna direction (el tipo TS que la
-- daba por existente estaba desactualizado). Necesaria para poder
-- distinguir actividad saliente (outbound, iniciada por nosotros) de
-- entrante (inbound, respuesta real del lead) — es la base de la ventana
-- de 24h de texto libre de WhatsApp.
ALTER TABLE io_pro_lead_activities ADD COLUMN IF NOT EXISTS direction text;
