# 📋 Mapeo de Reglas de Auditoría para `audit_rules`

## Estructura de la tabla `audit_rules`

```sql
CREATE TABLE audit_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_id VARCHAR(50) UNIQUE NOT NULL,      -- ej: "meta.title.exists"
  label VARCHAR(200) NOT NULL,                -- Nombre descriptivo
  category VARCHAR(30) NOT NULL,              -- "seo", "performance", "security", "ux"
  enabled BOOLEAN DEFAULT TRUE,
  penalty INTEGER DEFAULT 0,                  -- Penalización en puntos (ej: -5)
  weight INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 CATEGORÍAS Y REGLAS

### 1️⃣ METADATOS (Meta) - Weight: 25
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| meta.title.exists | Title existe | seo | -10 | true |
| meta.title.length | Title longitud (30-60 chars) | seo | -5 | true |
| meta.description.exists | Meta description existe | seo | -10 | true |
| meta.description.length | Meta desc longitud (120-160 chars) | seo | -5 | true |
| meta.canonical | URL Canonical | seo | -3 | true |
| meta.noindex | Página indexable (no noindex) | seo | -15 | true |
| meta.og.title | OG Title (redes sociales) | seo | -2 | true |
| meta.og.description | OG Description | seo | -2 | true |
| meta.og.image | OG Image | seo | -2 | true |
| meta.twitter.card | Twitter Card | seo | -1 | true |
| meta.lang | Atributo lang en <html> | seo | -1 | true |
| meta.favicon | Favicon presente | seo | -1 | true |

---

### 2️⃣ HEADINGS - Weight: 20
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| headings.h1.exists | H1 existe | seo | -15 | true |
| headings.h1.unique | H1 único (solo 1) | seo | -10 | true |
| headings.h1.length | H1 longitud (20-70 chars) | seo | -5 | true |
| headings.h2.exists | H2 existen | seo | -5 | true |
| headings.hierarchy | Jerarquía correcta (H1→H2→H3) | seo | -3 | true |
| headings.keyword.presence | Keywords en headings | seo | -3 | true |

---

### 3️⃣ IMÁGENES - Weight: 15
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| images.alt.missing | Imágenes con alt text | seo | -8 | true |
| images.lazy | Lazy loading activado | ux | -3 | true |
| images.format | Formato moderno (WebP/AVIF) | performance | -4 | true |
| images.total | Cantidad de imágenes (≤30) | ux | -2 | true |

---

### 4️⃣ ENLACES - Weight: 10
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| links.internal | Links internos presentes | seo | -5 | true |
| links.external.security | Links externos con noopener | security | -8 | true |
| links.empty | Sin enlaces vacíos (#) | ux | -3 | true |
| links.anchor.text | Anchor text descriptivo | seo | -2 | true |

---

### 5️⃣ SEO TÉCNICO - Weight: 20
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| technical.ssl | HTTPS / SSL activo | security | -15 | true |
| technical.schema | Schema Markup (JSON-LD) | seo | -5 | true |
| technical.doctype | DOCTYPE declarado | ux | -5 | true |
| technical.robots | Robots.txt presente | seo | -2 | true |
| technical.inline.scripts | Scripts inline minimizados | performance | -3 | true |
| technical.iframes | iFrames optimizados | ux | -2 | true |
| technical.flash | Sin Flash (deprecated) | security | -10 | true |
| technical.hreflang | Hreflang para multiidioma | seo | -1 | true |

---

### 6️⃣ PERFORMANCE - Weight: 20
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| perf.ttfb | TTFB < 200ms | performance | -10 | true |
| perf.lcp | LCP < 2500ms | performance | -10 | true |
| perf.cls | CLS < 0.1 | performance | -8 | true |
| perf.fcp | FCP < 1800ms | performance | -8 | true |
| perf.scripts | Scripts externos (≤5) | performance | -5 | true |
| perf.css | Archivos CSS (≤3) | performance | -3 | true |
| perf.dom | DOM size < 1500 nodes | ux | -2 | true |

---

### 7️⃣ CONTENIDO - Weight: 10
| check_id | label | category | penalty | enabled |
|----------|-------|----------|---------|---------|
| content.wordcount | Palabras en página (≥300) | seo | -8 | true |
| content.text_ratio | Ratio texto/HTML (≥15%) | seo | -5 | true |
| content.paragraphs | Párrafos estructurados (≥3) | ux | -3 | true |
| content.long_paragraphs | Párrafos largos (≤150 palabras) | ux | -2 | true |
| content.multimedia | Multimedia presente | ux | -1 | true |

---

## 📝 TOTAL DE CHECKS: 45

### Distribución por categoría:
- **SEO**: 25 checks (prioridad alta)
- **Performance**: 14 checks
- **Security**: 4 checks
- **UX**: 12 checks

---

## 🚀 Cómo usar esto en `audit_rules`

Ejecuta este SQL en Supabase para crear las reglas base:

```sql
INSERT INTO audit_rules (check_id, label, category, penalty, enabled) VALUES
-- METADATOS (12 checks)
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
('meta.favicon', 'Favicon presente', 'seo', -1, true),

-- HEADINGS (6 checks)
('headings.h1.exists', 'H1 existe', 'seo', -15, true),
('headings.h1.unique', 'H1 único (solo 1)', 'seo', -10, true),
('headings.h1.length', 'H1 longitud (20-70 chars)', 'seo', -5, true),
('headings.h2.exists', 'H2 existen', 'seo', -5, true),
('headings.hierarchy', 'Jerarquía correcta (H1→H2→H3)', 'seo', -3, true),
('headings.keyword.presence', 'Keywords en headings', 'seo', -3, true),

-- IMÁGENES (4 checks)
('images.alt.missing', 'Imágenes con alt text', 'seo', -8, true),
('images.lazy', 'Lazy loading activado', 'ux', -3, true),
('images.format', 'Formato moderno (WebP/AVIF)', 'performance', -4, true),
('images.total', 'Cantidad de imágenes (≤30)', 'ux', -2, true),

-- ENLACES (4 checks)
('links.internal', 'Links internos presentes', 'seo', -5, true),
('links.external.security', 'Links externos con noopener', 'security', -8, true),
('links.empty', 'Sin enlaces vacíos (#)', 'ux', -3, true),
('links.anchor.text', 'Anchor text descriptivo', 'seo', -2, true),

-- SEO TÉCNICO (8 checks)
('technical.ssl', 'HTTPS / SSL activo', 'security', -15, true),
('technical.schema', 'Schema Markup (JSON-LD)', 'seo', -5, true),
('technical.doctype', 'DOCTYPE declarado', 'ux', -5, true),
('technical.robots', 'Robots.txt presente', 'seo', -2, true),
('technical.inline.scripts', 'Scripts inline minimizados', 'performance', -3, true),
('technical.iframes', 'iFrames optimizados', 'ux', -2, true),
('technical.flash', 'Sin Flash (deprecated)', 'security', -10, true),
('technical.hreflang', 'Hreflang para multiidioma', 'seo', -1, true),

-- PERFORMANCE (7 checks)
('perf.ttfb', 'TTFB < 200ms', 'performance', -10, true),
('perf.lcp', 'LCP < 2500ms', 'performance', -10, true),
('perf.cls', 'CLS < 0.1', 'performance', -8, true),
('perf.fcp', 'FCP < 1800ms', 'performance', -8, true),
('perf.scripts', 'Scripts externos (≤5)', 'performance', -5, true),
('perf.css', 'Archivos CSS (≤3)', 'performance', -3, true),
('perf.dom', 'DOM size < 1500 nodes', 'ux', -2, true),

-- CONTENIDO (5 checks)
('content.wordcount', 'Palabras en página (≥300)', 'seo', -8, true),
('content.text_ratio', 'Ratio texto/HTML (≥15%)', 'seo', -5, true),
('content.paragraphs', 'Párrafos estructurados (≥3)', 'ux', -3, true),
('content.long_paragraphs', 'Párrafos largos (≤150 palabras)', 'ux', -2, true),
('content.multimedia', 'Multimedia presente', 'ux', -1, true);
```

---

## 🎯 Características de la tabla

**enabled**: Si es `true`, la regla está activa. Desactívala para ignorar ciertos checks.

**penalty**: Puntos que se restan si el check falla:
- `-15` = Crítico (SSL, H1 único)
- `-10` = Muy importante (title, description, H1, TTFB, LCP)
- `-5` = Importante (weight, schema, robots.txt, etc)
- `-1/-2/-3` = Menor impacto (favicon, lang, Twitter Card)

---

## 💡 Próximos pasos

1. **Crear tabla en Supabase**: Ejecuta el SQL de INSERT anterior
2. **Ver en `/audit-config`**: Los checks aparecerán con checkboxes para activar/desactivar y inputs para ajustar penalizaciones
3. **Vincular con auditor**: El backend leerá estas reglas al hacer auditorías (si lo quieres, hay que modificar `/backend/services/auditor/index.js` para consultar la tabla)
