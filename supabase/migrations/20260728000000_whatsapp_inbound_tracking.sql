-- Registra cuándo un lead respondió por última vez a un WhatsApp entrante,
-- para poder abrir la ventana de 24h de texto libre que permite Meta tras
-- un mensaje iniciado por el usuario.
ALTER TABLE io_pro_leads ADD COLUMN IF NOT EXISTS last_inbound_at timestamptz;

-- Lookup por teléfono en cada mensaje entrante (endpoint /api/whatsapp/inbound).
CREATE INDEX IF NOT EXISTS idx_io_pro_leads_phone ON io_pro_leads (phone);
