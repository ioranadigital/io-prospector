-- ============================================
-- IO_PROSPECTO PROJECT TABLES
-- Prefixed: io_prospecto_*
-- Multi-tenant: client_id required
-- ============================================

-- Create io_prospecto_leads table
CREATE TABLE IF NOT EXISTS io_prospecto_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  first_name TEXT,
  email TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  gmb_rating DECIMAL(2,1),
  review_count INTEGER,
  gmb_claimed BOOLEAN DEFAULT FALSE,
  has_website BOOLEAN DEFAULT FALSE,
  ssl_active BOOLEAN DEFAULT FALSE,
  load_time_ms INTEGER,
  is_mobile_responsive BOOLEAN DEFAULT FALSE,
  has_schema BOOLEAN DEFAULT FALSE,
  broken_links_count INTEGER,
  photo_count INTEGER,
  gmb_description TEXT,
  gmb_has_hours BOOLEAN DEFAULT FALSE,
  gmb_hours_updated BOOLEAN DEFAULT FALSE,
  main_competitor TEXT,
  missing_service TEXT,
  icebreaker TEXT,
  seo_gap TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, email)
);

-- Create io_prospecto_templates table
CREATE TABLE IF NOT EXISTS io_prospecto_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  whatsapp_body TEXT,
  variables_list TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, name)
);

-- Create io_prospecto_lead_activities table
CREATE TABLE IF NOT EXISTS io_prospecto_lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  lead_id UUID NOT NULL REFERENCES io_prospecto_leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('email', 'whatsapp')),
  plantilla_id UUID NOT NULL REFERENCES io_prospecto_templates(id),
  icebreaker_text TEXT,
  status TEXT NOT NULL DEFAULT 'reintentando' CHECK (status IN ('enviado', 'error', 'reintentando')),
  intentos INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_io_prospecto_leads_client_id ON io_prospecto_leads(client_id);
CREATE INDEX idx_io_prospecto_leads_email ON io_prospecto_leads(client_id, email);
CREATE INDEX idx_io_prospecto_leads_created_at ON io_prospecto_leads(client_id, created_at DESC);

CREATE INDEX idx_io_prospecto_templates_client_id ON io_prospecto_templates(client_id);

CREATE INDEX idx_io_prospecto_lead_activities_client_id ON io_prospecto_lead_activities(client_id);
CREATE INDEX idx_io_prospecto_lead_activities_lead_id ON io_prospecto_lead_activities(client_id, lead_id);
CREATE INDEX idx_io_prospecto_lead_activities_created_at ON io_prospecto_lead_activities(client_id, created_at DESC);

-- Insert default templates for io_prospecto
INSERT INTO io_prospecto_templates (client_id, name, subject, body_html, whatsapp_body, variables_list)
VALUES
  (
    'io_prospecto',
    'Prospección Competencia',
    'He visto que {{main_competitor}} te está quitando clientes en {{city}}',
    '<h2>Hola {{company_name}}</h2><p>He notado que {{main_competitor}} está dominando los resultados de búsqueda para tu zona.</p><p>{{seo_gap}}</p><p>Tenemos experiencia optimizando {{missing_service}}.</p><p>{{icebreaker}}</p>',
    'Hola {{company_name}}, 👋 He visto que {{main_competitor}} te está quitando clientes. {{seo_gap}}. ¿Conversamos?',
    ARRAY['{{company_name}}', '{{main_competitor}}', '{{city}}', '{{seo_gap}}', '{{missing_service}}', '{{icebreaker}}']
  ),
  (
    'io_prospecto',
    'Audit SEO Técnico',
    'Tu web tarda {{load_time_ms}}ms en cargar — podemos optimizarlo',
    '<h2>Hola {{company_name}}</h2><p>Detectamos: {{seo_gap}}</p><p>Solución: {{missing_service}}</p><p>{{icebreaker}}</p>',
    'Hola {{company_name}}, detectamos: {{seo_gap}}. Podemos ayudarte. ¿Hablamos?',
    ARRAY['{{company_name}}', '{{seo_gap}}', '{{missing_service}}', '{{icebreaker}}']
  );
