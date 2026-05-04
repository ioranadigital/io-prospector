-- ============================================================
-- Prospector Local — Schema SQL v1.0.0
-- Iorana Digital
-- ============================================================
-- Ejecuta este script en Supabase SQL Editor para crear
-- todas las tablas y datos iniciales
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- 1. AUDIT_RULES — Reglas de auditoría SEO precargadas
-- ─────────────────────────────────────────────────────────
CREATE TABLE audit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  penalty INTEGER DEFAULT -5,
  enabled BOOLEAN DEFAULT true,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO audit_rules (key, category, penalty, label, description) VALUES
  ('no_meta_description', 'seo', -8, 'Falta meta description', 'La página no tiene meta description'),
  ('no_h1', 'seo', -10, 'Falta H1', 'No hay una etiqueta H1 en la página'),
  ('duplicate_h1', 'seo', -6, 'H1 duplicado', 'Hay múltiples etiquetas H1'),
  ('no_schema_org', 'seo', -12, 'Falta Schema.org', 'No hay datos estructurados JSON-LD'),
  ('slow_mobile', 'ux', -10, 'Velocidad móvil pobre', 'Score Core Web Vitals bajo en móvil'),
  ('no_mobile_friendly', 'ux', -15, 'No es mobile-friendly', 'Diseño no adaptable a móvil'),
  ('no_ssl', 'security', -20, 'Sin HTTPS', 'La web no usa certificado SSL'),
  ('broken_links', 'seo', -5, 'Enlaces rotos detectados', 'Se encontraron enlaces que devuelven 404'),
  ('no_sitemap', 'seo', -7, 'Falta sitemap.xml', 'No se detectó sitemap.xml'),
  ('no_robots', 'seo', -4, 'Falta robots.txt', 'No se detectó robots.txt'),
  ('poor_readability', 'ux', -6, 'Pobre legibilidad', 'Contraste bajo o fuente muy pequeña'),
  ('no_contact_form', 'conversion', -8, 'Sin formulario de contacto', 'La web no tiene forma de contactar');

-- ─────────────────────────────────────────────────────────
-- 2. SEARCH_SESSIONS — Historial de prospecciones
-- ─────────────────────────────────────────────────────────
CREATE TABLE search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT,
  pages_from INTEGER DEFAULT 2,
  pages_to INTEGER DEFAULT 4,
  status TEXT DEFAULT 'pending', -- pending, running, done, error
  total_found INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 3. LEADS — Core del sistema (negocios encontrados)
-- ─────────────────────────────────────────────────────────
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  business_name TEXT NOT NULL,
  website TEXT,
  city TEXT,
  category TEXT,
  phone TEXT,
  email TEXT,
  audit_score INTEGER DEFAULT 0, -- 0-100
  audit_data JSONB DEFAULT '{}', -- Detalle de cada regla evaluada
  priority TEXT DEFAULT 'normal', -- web_design, seo, normal
  crm_status TEXT DEFAULT 'new', -- new, contacted, interested, reserved, sold, upselling, lost
  notes TEXT,
  last_contact_at TIMESTAMP,
  next_follow_up TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_session ON leads(session_id);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_crm_status ON leads(crm_status);
CREATE INDEX idx_leads_score ON leads(audit_score);

-- ─────────────────────────────────────────────────────────
-- 4. LEAD_ACTIVITIES — Log de contactos y seguimiento
-- ─────────────────────────────────────────────────────────
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- email, whatsapp, call, status_change, demo_generated
  direction TEXT, -- outbound, inbound
  subject TEXT,
  body TEXT,
  outcome TEXT, -- sent, read, replied, scheduled, pending
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_activities_type ON lead_activities(type);

-- ─────────────────────────────────────────────────────────
-- 5. MESSAGE_TEMPLATES — Plantillas de contacto
-- ─────────────────────────────────────────────────────────
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- email, whatsapp
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  intensity TEXT, -- soft, medium, hard (para WhatsApp)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO message_templates (type, name, subject, body, intensity) VALUES
  ('email', 'Análisis SEO inicial', '🔍 Análisis SEO de {{business_name}}',
   'Hola {{business_name}},\n\nHemos detectado {{issue_count}} problemas SEO en tu web que podrían mejorarse.\n\nProblema principal: {{top_issue}}\n\nMe gustaría mostrarte cómo mejorar tu posicionamiento en Google.\n\n¿Tienes 15 minutos esta semana para una llamada?', NULL),

  ('email', 'Follow-up después de demo', 'Tu web mejorada — {{business_name}}',
   'Hola,\n\nComo acordamos, aquí te muestro cómo tu web podría verse después de implementar nuestras mejoras SEO.\n\nPuntuación actual: {{audit_score}}/100\n\n¿Podemos agendar una llamada?', NULL),

  ('whatsapp', 'Soft - Primera toma de contacto', NULL,
   'Hola 👋 Encontramos tu web y vimos que hay oportunidades SEO en {{category}}. ¿Te interesa mejorar tu posicionamiento?', 'soft'),

  ('whatsapp', 'Medium - Con datos específicos', NULL,
   'Hola {{business_name}} 👋 Analizamos tu web y detectamos {{issue_count}} problemas SEO.\n\nLa buena noticia: es fácil de arreglar 💪\n\n¿Hablamos de cómo mejorar tu presencia en Google?', 'medium'),

  ('whatsapp', 'Hard - Presión de conversión', NULL,
   '🚨 {{business_name}}, tus competidores en {{city}} ya ranking en Google mientras tú pierdes clientes.\n\nTeníamos tu analítica abierta y {{audit_score}} es bajo. Podemos arreglarlo en 30 días.\n\n¿Llamada ahora o mañana?', 'hard'),

  ('email', 'Newsletter mensual', 'Tips SEO para {{category}}',
   'Hola {{business_name}},\n\nEste mes te traemos 3 cambios rápidos que {{category}} están usando para crecer.\n\n1. {{tip_1}}\n2. {{tip_2}}\n3. {{tip_3}}\n\n¿Necesitas ayuda implementándolos?', NULL),

  ('email', 'Reactivación de prospecto', '¿Aún buscas mejorar tu SEO?',
   'Hola,\n\nHace tiempo que no tuvimos noticias tuyas sobre el proyecto SEO.\n\n¿Sigues interesado? Tenemos promoción especial este mes.\n\nDamelo a saber 👋', NULL);

-- ─────────────────────────────────────────────────────────
-- 6. LEAD_DEMOS — Demos generadas de webs mejoradas
-- ─────────────────────────────────────────────────────────
CREATE TABLE lead_demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL, -- URL amigable para compartir
  html_content TEXT NOT NULL, -- HTML de la demo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_demos_lead ON lead_demos(lead_id);
CREATE INDEX idx_demos_slug ON lead_demos(slug);

-- ─────────────────────────────────────────────────────────
-- 7. APP_CONFIG — Configuración global de la app
-- ─────────────────────────────────────────────────────────
CREATE TABLE app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO app_config (key, value, description) VALUES
  ('calendar_url', 'https://calendly.com/tu-usuario', 'URL pública de Calendly para agendar llamadas'),
  ('email_from', 'noreply@iorana.dev', 'Dirección de email desde la que se envían notificaciones'),
  ('company_name', 'Iorana Digital', 'Nombre de la empresa'),
  ('company_website', 'https://iorana.dev', 'Sitio web de la empresa'),
  ('logo_url', 'https://iorana.dev/logo.png', 'URL del logo para emails'),
  ('api_version', '1.0.0', 'Versión actual de la API'),
  ('max_pages_per_session', '15', 'Número máximo de páginas a scrapear por sesión'),
  ('audit_enabled', 'true', 'Activar/desactivar auditoría automática');

-- ─────────────────────────────────────────────────────────
-- 8. CONTACT_BATCHES — Tracking de envíos masivos
-- ─────────────────────────────────────────────────────────
CREATE TABLE contact_batches (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'email' | 'whatsapp'
  lead_ids UUID[] NOT NULL,
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  job_ids TEXT[] NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_batches_status ON contact_batches(status);
CREATE INDEX idx_contact_batches_type ON contact_batches(type);

-- ─────────────────────────────────────────────────────────
-- Habilitar RLS (Row Level Security) — Opcional pero recomendado
-- ─────────────────────────────────────────────────────────
-- En desarrollo lo dejamos desactivado, en producción:
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
-- etc.

-- ─────────────────────────────────────────────────────────
-- Verificación final
-- ─────────────────────────────────────────────────────────
-- Ejecuta estas queries para verificar que todo está OK:
--
-- SELECT * FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
--
-- SELECT COUNT(*) FROM audit_rules;      -- Debe ser 12
-- SELECT COUNT(*) FROM message_templates; -- Debe ser 7
-- SELECT COUNT(*) FROM app_config;        -- Debe ser 8
