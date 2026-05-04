-- ==========================================
-- PASO 1: Agregar columna category (si no existe)
-- ==========================================
ALTER TABLE io_prosp_message_templates
ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'GENERAL';

-- ==========================================
-- PASO 2: Insertar 3 Plantillas ANALISIS INICIAL
-- ==========================================

-- 1. ANÁLISIS SEO
INSERT INTO io_prosp_message_templates (name, type, category, subject, body, is_active)
VALUES (
  'Análisis SEO Técnico',
  'email',
  'ANALISIS INICIAL',
  '{{business_name}} - Hemos encontrado {{issue_count}} problemas SEO en tu web',
  'Hola {{business_name}},

Realizamos un análisis completo de tu sitio web ({{website}}) y encontramos {{issue_count}} problemas SEO técnicos que están impactando tu visibilidad en Google.

🔴 PROBLEMA PRINCIPAL:
{{top_issue}}

📊 DETALLES DEL ANÁLISIS:
• Puntuación actual: {{audit_score}}/100
• Problemas detectados: {{issue_count}}
• Falta: {{missing_service}}

⚠️ COMPARATIVA CON LA COMPETENCIA:
Mientras tú estás en {{audit_score}}/100, {{main_competitor}} ya está implementando estas mejoras y ganando clientes.

💡 LOS PRÓXIMOS PASOS:
No necesitas una agencia complicada. Con {{top_issue}} y {{missing_service}}, podrías mejorar 30-50 posiciones en 3 meses.

¿Te gustaría una llamada de 20 minutos para explicarte por dónde empezar?

Saludos,
Equipo SEO Iorana Digital',
  true
);

-- 2. NECESIDAD DE PÁGINA WEB
INSERT INTO io_prosp_message_templates (name, type, category, subject, body, is_active)
VALUES (
  'Por qué necesitas página web',
  'email',
  'ANALISIS INICIAL',
  '{{business_name}} - 8 de cada 10 clientes buscaban en Google... y no te encontraron',
  'Hola {{business_name}},

Revisamos tu presencia online en {{website}} y encontramos algo importante:

📱 LA REALIDAD ACTUAL:
• 89% de tus clientes potenciales buscan en Google antes de comprar
• {{main_competitor}} (tu competidor) SI tiene página web optimizada
• Estás perdiendo clientes que no pueden encontrarte

💰 ¿CUÁNTOS CLIENTES ESTÁS PERDIENDO?
Con {{missing_service}}, estimas que pierdes al menos 3-5 clientes al mes = $15,000-$25,000/año

🎯 UNA PÁGINA WEB NO ES LUJO, ES NECESIDAD:
✓ Aparecer en Google (SEO)
✓ Información disponible 24/7
✓ Competir con {{main_competitor}}
✓ Generar confianza
✓ Captar clientes automáticamente

📊 DATO: Las empresas con web optimizada:
• Captan 3x más clientes
• Aumentan precios promedio 20%
• Tienen marca profesional

¿Hablamos de cómo una página web optimizada te cambiaría el juego?

Saludos,
Equipo SEO Iorana Digital',
  true
);

-- 3. MEJORAR SEO LOCAL
INSERT INTO io_prosp_message_templates (name, type, category, subject, body, is_active)
VALUES (
  'Por qué mejorar tu SEO Local',
  'email',
  'ANALISIS INICIAL',
  '{{business_name}} - Tus clientes te buscan en Google Maps (pero no te encuentran)',
  'Hola {{business_name}},

Analizamos cómo apareces en Google Maps y buscas locales en tu zona, y encontramos un problema grave:

📍 EL PROBLEMA:
• {{main_competitor}} aparece en primeras posiciones
• Tú estás invisible en Google Maps y búsquedas locales
• {{top_issue}} hace que bajes en rankings
• Pierdes clientes que buscan "{{missing_service}} cerca de mí"

💼 ¿QUÉ ES SEO LOCAL?
Es aparecer en las primeras posiciones cuando alguien busca:
- "{{business_name}} cerca de mí"
- "Servicios en tu zona"
- "Horario de atención"
- Reseñas y calificaciones

📈 IMPACTO REAL:
Empresas que mejoran SEO Local:
• +150% más clientes locales en 90 días
• Ocupan la posición #1 en Google Maps
• Reciben llamadas de clientes calificados
• Nota: {{audit_score}}/100 - hay mucho espacio para mejorar

🎯 LOS CAMBIOS QUE NECESITAS:
1. Optimizar Google Business Profile (GBP)
2. {{seo_gap}}
3. {{missing_service}}

¿Te gustaría saber exactamente qué cambios te subirían a posición #1 en tu zona?

Saludos,
Equipo SEO Iorana Digital',
  true
);

-- ==========================================
-- PASO 3: Insertar Versiones WhatsApp
-- ==========================================

-- 1. ANÁLISIS SEO (WhatsApp)
INSERT INTO io_prosp_message_templates (name, type, category, subject, body, is_active)
VALUES (
  'Análisis SEO Técnico',
  'whatsapp',
  'ANALISIS INICIAL',
  NULL,
  'Hola {{business_name}} 👋

Analizamos tu web ({{website}}) y encontramos {{issue_count}} problemas SEO:

🔴 Principal: {{top_issue}}

Puntuación: {{audit_score}}/100
Falta: {{missing_service}}

{{main_competitor}} ya está ganando.

¿15 min de llamada?',
  true
);

-- 2. POR QUÉ PÁGINA WEB (WhatsApp)
INSERT INTO io_prosp_message_templates (name, type, category, subject, body, is_active)
VALUES (
  'Por qué necesitas página web',
  'whatsapp',
  'ANALISIS INICIAL',
  NULL,
  'Hola {{business_name}} 👋

89% de tus clientes buscan en Google.

{{main_competitor}} tiene web. Tú no.

Estás perdiendo 3-5 clientes/mes = $15k-25k/año

¿Hablamos?',
  true
);

-- 3. SEO LOCAL (WhatsApp)
INSERT INTO io_prosp_message_templates (name, type, category, subject, body, is_active)
VALUES (
  'Por qué mejorar tu SEO Local',
  'whatsapp',
  'ANALISIS INICIAL',
  NULL,
  'Hola {{business_name}} 👋

Cuando buscan "{{business_name}} cerca de mí", {{main_competitor}} aparece primero.

Tú: {{audit_score}}/100 ⬇️

{{top_issue}} te está haciendo invisible.

¿15 min para mostrarte cómo #1? 📍',
  true
);
