-- Campo editable manualmente en la ficha del lead/candidato: URL de una web
-- de ejemplo/demo (según su sector) que se usa como argumento de venta en
-- las plantillas de contacto vía {{website_new}}. No se rellena por scraping,
-- se completa a mano desde LeadDetailModal.
ALTER TABLE io_pro_leads ADD COLUMN IF NOT EXISTS website_new TEXT;
