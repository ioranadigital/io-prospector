-- ================================================================
-- INSERT AUDIT RULES (45 checks)
-- Ejecutar en: Supabase SQL Editor
-- Tabla: io_pro_audit_rules
-- ================================================================

-- 1️⃣ METADATOS (12 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('meta.title.exists', 'Title existe', 'seo', -10, true),
('meta.title.length', 'Title longitud (30-60 chars)', 'seo', -5, true),
('meta.description.exists', 'Meta description existe', 'seo', -10, true),
('meta.description.length', 'Meta desc longitud (120-160 chars)', 'seo', -5, true),
('meta.canonical', 'URL Canonical', 'seo', -3, true),
('meta.noindex', 'Página indexable (no noindex)', 'seo', -15, true),
('meta.og.title', 'OG Title (redes sociales)', 'seo', -2, true),
('meta.og.description', 'OG Description', 'seo', -2, true),
('meta.og.image', 'OG Image', 'seo', -2, true),
('meta.twitter.card', 'Twitter Card', 'seo', -1, true),
('meta.lang', 'Atributo lang en <html>', 'seo', -1, true),
('meta.favicon', 'Favicon presente', 'seo', -1, true);

-- 2️⃣ HEADINGS (6 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('headings.h1.exists', 'H1 existe', 'seo', -15, true),
('headings.h1.unique', 'H1 único (solo 1)', 'seo', -10, true),
('headings.h1.length', 'H1 longitud (20-70 chars)', 'seo', -5, true),
('headings.h2.exists', 'H2 existen', 'seo', -5, true),
('headings.hierarchy', 'Jerarquía correcta (H1→H2→H3)', 'seo', -3, true),
('headings.keyword.presence', 'Keywords en headings', 'seo', -3, true);

-- 3️⃣ IMÁGENES (4 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('images.alt.missing', 'Imágenes con alt text', 'seo', -8, true),
('images.lazy', 'Lazy loading activado', 'ux', -3, true),
('images.format', 'Formato moderno (WebP/AVIF)', 'performance', -4, true),
('images.total', 'Cantidad de imágenes (≤30)', 'ux', -2, true);

-- 4️⃣ ENLACES (4 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('links.internal', 'Links internos presentes', 'seo', -5, true),
('links.external.security', 'Links externos con noopener', 'security', -8, true),
('links.empty', 'Sin enlaces vacíos (#)', 'ux', -3, true),
('links.anchor.text', 'Anchor text descriptivo', 'seo', -2, true);

-- 5️⃣ SEO TÉCNICO (8 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('technical.ssl', 'HTTPS / SSL activo', 'security', -15, true),
('technical.schema', 'Schema Markup (JSON-LD)', 'seo', -5, true),
('technical.doctype', 'DOCTYPE declarado', 'ux', -5, true),
('technical.robots', 'Robots.txt presente', 'seo', -2, true),
('technical.inline.scripts', 'Scripts inline minimizados', 'performance', -3, true),
('technical.iframes', 'iFrames optimizados', 'ux', -2, true),
('technical.flash', 'Sin Flash (deprecated)', 'security', -10, true),
('technical.hreflang', 'Hreflang para multiidioma', 'seo', -1, true);

-- 6️⃣ PERFORMANCE (7 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('perf.ttfb', 'TTFB < 200ms', 'performance', -10, true),
('perf.lcp', 'LCP < 2500ms', 'performance', -10, true),
('perf.cls', 'CLS < 0.1', 'performance', -8, true),
('perf.fcp', 'FCP < 1800ms', 'performance', -8, true),
('perf.scripts', 'Scripts externos (≤5)', 'performance', -5, true),
('perf.css', 'Archivos CSS (≤3)', 'performance', -3, true),
('perf.dom', 'DOM size < 1500 nodes', 'ux', -2, true);

-- 7️⃣ CONTENIDO (5 checks)
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('content.wordcount', 'Palabras en página (≥300)', 'seo', -8, true),
('content.text_ratio', 'Ratio texto/HTML (≥15%)', 'seo', -5, true),
('content.paragraphs', 'Párrafos estructurados (≥3)', 'ux', -3, true),
('content.long_paragraphs', 'Párrafos largos (≤150 palabras)', 'ux', -2, true),
('content.multimedia', 'Multimedia presente', 'ux', -1, true);

-- ================================================================
-- VERIFICACIÓN: Contar checks insertados
-- ================================================================
SELECT COUNT(*) as total_checks FROM io_pro_audit_rules;

-- Distribución por categoría:
SELECT category, COUNT(*) as count FROM io_pro_audit_rules GROUP BY category ORDER BY count DESC;
