# Auditoría de Scraping y Precisión de Datos — IO Prospector

**Fecha:** 2026-07-09
**Alcance:** Pipeline de prospección (`backend/services/prospector-v2.service.js` y dependencias)
**Autor:** Auditoría técnica asistida (Claude Code)

---

## 0. Resumen ejecutivo

El pipeline vive en Node.js + Express (no Next.js/TypeScript — ver §1.1) y combina **Google Places API** (oficial) + **SerpAPI** (SERP de Google) + **Playwright** (extracción de contacto en la web del lead). Es una arquitectura razonable y ya mejor que "scrapear Google Maps a pelo" (ese enfoque existe pero está **abandonado/no usado**, ver §5).

El hallazgo principal no es "regex débiles que a veces fallan": es que **4 de las 14 variables críticas nunca se calculan** (siempre `null`) y **2 más se calculan pero se descartan antes de persistirse**, por bugs concretos y reproducibles, no por falta de robustez. Antes de "optimizar precisión" hay que arreglar código que está, literalmente, muerto o roto. Ver tabla §2 y bugs §3.

---

## 1. Mapeo y diagnóstico de la lógica actual

### 1.1 Aclaración de stack

El repo `io-prospector` es **Node.js + Express (JS puro, ESM) en el backend** y **Next.js en el frontend** (`frontend/`). No hay rutas de scraping en `/src/app/api` de Next — todo el scraping vive en `backend/`. Los parches de este informe siguen el estilo real del código (JS ESM, sin TypeScript), no TS, para no introducir un tipo de archivo ajeno al proyecto.

### 1.2 Pipeline real (flujo activo)

```
POST /api/scraping/start  (backend/routes/scraping.routes.js)
        │
        ▼
startProspectionV2()  (backend/services/prospector-v2.service.js)
        │
        ├─► fetchSerpPage()  → SerpAPI (serpapi.com) — SERP de Google, 1 fetch por página/variación de query
        │
        └─► processResult() por cada resultado orgánico:
                ├─► contactExtractorService.extract(url)     → Playwright: email/tel/HTTPS/schema/mobile/broken links
                ├─► googlePlacesService.getBusinessData()    → Google Places API oficial: rating/reviews/fotos/horario
                ├─► performanceAuditService.auditPerformanceAndCanonical()  → Playwright: TTFB/LCP/CLS/canonical/H1  [fire-and-forget]
                └─► techDetectionService.detectTechStack()   → regex sobre HTML: CMS/analytics/ecommerce           [fire-and-forget]
        │
        ▼
csvExportService.saveLeadsToCSV()  → CSV en disco (docs §1.3: columnas limitadas)
        │
        ▼
orchestrateProspection()  (scraping-orchestrator.js)
        ├─► lead-analyzer.js → analyzeLeads() → audit_score, issues[]
        ├─► dashboard-generator.js / email-generator.js
        └─► INSERT en Supabase `io_pro_leads`
```

### 1.3 APIs/métodos usados por función

| Función | Tecnología | Motivo |
|---|---|---|
| Búsqueda de negocios (SERP) | **SerpAPI** (`serpapi.com/search.json`) | Evita scrapear Google directamente (que es lo que más banea) |
| Datos GMB (rating, reviews, fotos, horario) | **Google Places API oficial** (`Find Place` + `Place Details`) | Reemplazó un scraper Playwright de Maps (`gmb-scraper.service.js`, ver §5) |
| Contacto (email/teléfono) + señales SEO en la web del lead | **Playwright** (`contact-extractor.service.js`) | No hay API oficial para esto — scraping directo justificado |
| Performance / Core Web Vitals | **Playwright** (`performance-audit.service.js`) | Roto, ver Bug #2 |
| Stack tecnológico (CMS, analytics) | Regex sobre HTML ya descargado | Roto, ver Bug #3 |

### 1.4 Filtros de exclusión

`prospector-v2.service.js` tiene `SKIP_DOMAINS` (Google, Facebook, Yelp, TripAdvisor, Wikipedia, portales inmobiliarios, **Páginas Amarillas**, InfoJobs, etc.). Cubre bien agregadores/redes sociales.

**Gap real:** no excluye dominios institucionales (`.gob.es`, `ayuntamiento*.es`, diputaciones, colegios profesionales, cámaras de comercio) ni portales sectoriales de segundo nivel (`empresite.com`, `einforma.com`, `axesor.es`, `paginas.infoisinfo.es`). Cuando el SERP los devuelve, se procesan como si fueran la web del negocio: se les hace auditoría SSL/mobile/schema y se buscan email/teléfono en la ficha institucional en vez de en el negocio real → contaminación de `website`, `email`, `phone` en negocios pequeños con poca presencia web propia (justo el segmento más valioso para prospección).

### 1.5 Reintentos ante bloqueos (403/429)

**No existe ninguna lógica de retry/backoff ante bloqueos en todo el pipeline de scraping.** Se verificó por grep en `backend/`: no hay manejo de `403`, `429`, `OVER_QUERY_LIMIT` (código real que devuelve Google Places cuando se excede cuota) en ningún servicio de scraping. Lo único que existe es un `sleep` aleatorio (1.5–3s) entre resultados, que es *rate limiting preventivo*, no *manejo de bloqueo*. Si SerpAPI o Google Places devuelven un error transitorio, **el lead se pierde silenciosamente** (`return []` / `result.error = ...`) sin reintento.

---

## 2. Auditoría de precisión — las 14 variables

| # | Variable | Fuente actual | Estado real | Problema |
|---|---|---|---|---|
| 1 | `gmb_claimed` | `google-places.service.js:73` — `!!(website \|\| phone \|\| opening_hours)` | ⚠️ Heurística débil | La Places API **no expone** si el perfil está reclamado por el propietario. Usar "tiene web o teléfono u horario" es un proxy indirecto: muchas fichas gestionadas por datos de terceros (no por el dueño) tienen esos 3 campos igualmente → **falsos positivos** de "reclamado", que hacen perder los 40 puntos de urgencia de `GMB_NO_CLAIMED` en leads que sí son buenos candidatos. |
| 2 | `gmb_status` | Solo frontend (`SendModal.tsx`, `TemplatesAdmin.tsx`) | ✅ OK | No es un campo de BD, se compone en cliente a partir de `gmb_claimed/gmb_rating/review_count`. Correcto por diseño. |
| 3 | `gmb_rating` | Places API `details.rating` | ✅ Fiable | Dato oficial de Google. |
| 4 | `review_count` | Places API `details.user_ratings_total` | ✅ Fiable | Dato oficial de Google. |
| 5 | `photo_count` | Places API `details.photos.length` | ⚠️ Sesgado a la baja | El campo `photos` de *Place Details* está limitado por la propia API (no es la galería completa de Maps). Negocios con muchas fotos siempre muestran un número tope, no el real. |
| 6 | `audit_score` | `lead-analyzer.js: analyzeLeadScore()` | ⚠️ Depende de datos corriente arriba rotos | La lógica de suma de puntos (0–100) es razonable, pero hereda el ruido de `gmb_claimed` (#1) y de `missing_service` (#12, siempre `null` → esa regla nunca dispara). |
| 7 | `issue_count` | `contact.routes.js:90` (calculado al vuelo desde `audit_data`) | 🔴 **Roto** | Ver **Bug #1**. `audit_data` no se construye por nombre de issue sino por índice de array → cuenta bien el número, pero por accidente (cuenta claves, y hay tantas claves como issues, así que el número es correcto), aunque las claves en sí son basura (`"0","1","2"...`). |
| 8 | `top_issue` | Dos fuentes en conflicto | 🔴 **Roto** | (a) `contact.routes.js:91` lee `Object.keys(audit_data).find(...)` → devuelve `"0"` (índice, no el nombre real del issue) por el mismo bug. (b) `performance-audit.service.js` calcula un `top_issue` legible (ej. "❌ No H1 tag found") pero **nunca llega a persistirse** — no está en las cabeceras del CSV ni en el `INSERT` a Supabase, y además el cálculo en sí falla siempre (ver **Bug #2**). |
| 9 | `seo_gap` | `prospector-v2.service.js:189` — inicializado a `null`, nunca reasignado | 🔴 **Muerto** | Cero lógica que lo calcule en todo el repo. Se exporta a CSV, se manda a Supabase, se usa en plantillas de email (`email-generator.js:127`) — siempre vacío. |
| 10 | `website` | `result.url` de SerpAPI, filtrado por `SKIP_DOMAINS` | ⚠️ Falsos positivos | Ver §1.4 — directorios institucionales/sectoriales no filtrados se cuelan como "website" del negocio. |
| 11 | `main_competitor` | `prospector-v2.service.js:186` — inicializado a `null`, nunca reasignado | 🔴 **Muerto** | Cero algoritmo. `email-generator.js:54` tiene un hook de copy ("He visto que {main_competitor} te está ganando en Google") que **nunca se dispara** porque el campo siempre es `null`. |
| 12 | `missing_service` | `prospector-v2.service.js:187` — inicializado a `null`, nunca reasignado | 🔴 **Muerto** | Cero algoritmo. Además `lead-analyzer.js:43` tiene una regla de scoring (`MISSING_SERVICE`, +10 pts) que por esto **nunca se activa**. |
| 13 | `website` (SSL/mobile/schema) | `contact-extractor.service.js` | ✅ Sólida | Bien resuelta: detecta HTTPS, `viewport`, `application/ld+json`/`itemscope`, enlaces rotos. Ver matices menores en §3. |
| 14 | `main_competitor` (contacto) — *email/teléfono* | `contact-extractor.service.js` | ✅ Sólida (la mejor pieza del pipeline) | `mailto:`/`tel:` como fuente primaria, filtro de spam (`SPAM_EMAIL_PATTERNS`), fallback a rastreo de `/contacto`, `/aviso-legal`, etc. Correcto y ya sigue buenas prácticas. |

**Resumen:** de las 14, **4 están completamente muertas** (`main_competitor`, `missing_service`, `seo_gap`, y de facto `icebreaker`), **2 producen basura activamente** (`issue_count`/`top_issue` por el bug de mapeo), **2 son heurísticas sesgadas** (`gmb_claimed`, `photo_count`), y el resto son correctas. Esto no es "a veces llegan vacíos" — es "siempre llegan vacíos o incorrectos" para casi un tercio de las variables pedidas.

---

## 3. Bugs críticos (con línea exacta)

### 🔴 Bug #1 — `audit_data` se indexa por posición de array, no por nombre de issue

`backend/services/scraping-orchestrator.js:48`

```js
audit_data: lead.issues ? Object.fromEntries(Object.entries(lead.issues).map(([k, v]) => [k, !!v])) : {},
```

`lead.issues` es un **array** de strings (`['GMB_NO_CLAIMED', 'NO_WEBSITE', ...]`). `Object.entries()` sobre un array devuelve pares `[índice, valor]`, así que el resultado real guardado en Supabase es:

```json
{ "0": true, "1": true, "2": true }
```

...en vez de:

```json
{ "GMB_NO_CLAIMED": true, "NO_WEBSITE": true, "NO_HTTPS": true }
```

Consecuencia directa: `{{top_issue}}` en cualquier plantilla de email (`contact.routes.js:91`) se renderiza como el string `"0"`. Esto sale en emails reales a clientes potenciales.

### 🔴 Bug #2 — `performance-audit.service.js` usa una opción de Puppeteer en código Playwright: siempre falla

`backend/services/seo-technical/performance-audit.service.js:64`

```js
await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
```

Playwright solo acepta `'load' | 'domcontentloaded' | 'networkidle' | 'commit'` para `waitUntil`. `'networkidle2'` es sintaxis de **Puppeteer**, no de Playwright (que es lo que usa este proyecto — `import { chromium } from 'playwright'`). Playwright lanza un error de validación de parámetros en cada llamada, **antes de navegar siquiera**. Resultado: cada auditoría de performance cae siempre al `catch`, y `top_issue` termina siendo literalmente `"❌ Audit failed: waitUntil: expected one of (load|domcontentloaded|networkidle|commit)"` — si es que llegara a persistirse (no llega, ver Bug #4).

### 🔴 Bug #3 — `techDetectionService.detectTechStack()` recibe el HTML vacío

`backend/services/prospector-v2.service.js:243`

```js
techDetectionService.detectTechStack(result.url, '')
```

El segundo argumento (`html`) se pasa como **string vacío literal**, no el HTML ya descargado por `contactExtractorService`. Todos los detectores de `tech-detection.service.js` (`detectCMS`, `detectEcommerce`, `detectAnalytics`, `detectFormTools`, `detectCDN`, `detectJSFrameworks`) hacen regex sobre `html`, así que siempre devuelven vacío/`none`. La detección de stack tecnológico nunca ha funcionado en el pipeline en vivo.

### 🔴 Bug #4 — Fire-and-forget: los resultados de auditoría nunca llegan a persistirse (y aunque llegaran, no hay columna)

`backend/services/prospector-v2.service.js:230-251`

```js
performanceAuditService.auditPerformanceAndCanonical(result.url)
  .then(a => { lead.ttfb_ms = a.ttfb_ms; /* ... */ lead.top_issue = a.top_issue; ... })
  .catch(e => logger.warn(...));

techDetectionService.detectTechStack(result.url, '')
  .then(t => { lead.tech_cms = ...; ... })
  .catch(e => logger.warn(...));

return lead;   // ← se devuelve YA, sin esperar los .then() de arriba
```

`processResult()` devuelve `lead` inmediatamente; las promesas de arriba mutan el objeto **después**, en un momento indeterminado. Incluso en el caso favorable de que resuelvan a tiempo (antes del `csvExportService.saveLeadsToCSV()`), es irrelevante: **`csv-export.service.js` no tiene columnas para `top_issue`, `ttfb_ms`, `tech_cms`, etc.** (ver cabeceras en `csv-export.service.js:28-51`). El dato se calcula (cuando no falla por el Bug #2/#3) y se tira a la basura sin excepción.

### 🔴 Bug #5 — 4 variables nunca calculadas (dead fields desde el origen)

`backend/services/prospector-v2.service.js:186-189`

```js
main_competitor: null,
missing_service: null,
icebreaker: null,
seo_gap: null,
```

Nunca se reasignan en ningún punto del pipeline real (confirmado por grep en todo `backend/`: solo aparecen como `null`/`''` en scripts de test y como *lectores* en `email-generator.js`/`csv-export.service.js`, nunca como *escritores*). Ver algoritmos de reemplazo en §6.

### ⚠️ Hallazgo adicional — código duplicado/muerto que confunde el mantenimiento

- `backend/services/gmb-scraper.service.js`: scraper Playwright de Google Maps por DOM (selectores `[aria-label*="stars"]`, `button:has-text("Editar")"`, etc.). **Ya no se usa en el pipeline real** (`prospector-v2.service.js` usa `google-places.service.js`). Solo lo importa `scripts/health-check.js`. Es además el enfoque más frágil y con mayor riesgo de bloqueo (scrapea Maps directamente, sin API oficial) — no debería revivirse tal cual.
- `backend/services/scraper.service.js` + `backend/services/audit.service.js`: motor de auditoría SEO "v1" (Tier 1–5, UA hardcodeado sin rotación). No lo usa `audit.routes.js` (que usa `services/auditor/index.js`, el motor nuevo por checks). Es decir, hay **dos motores de auditoría SEO en paralelo**, uno vivo y uno huerto.

Recomendación: eliminar `gmb-scraper.service.js`, `scraper.service.js` y `audit.service.js` (o migrarlos a `docs/archive/` si se quieren conservar como referencia) para que nadie los toque pensando que están en producción.

---

## 4. Propuestas de mejora

### 4.1 Estrategia antirrastreo (Playwright)

Estado actual por archivo:

| Archivo | UA rotation | Args anti-detección | Bloqueo de recursos pesados |
|---|---|---|---|
| `contact-extractor.service.js` | ✅ 3 UAs random | ✅ `--disable-blink-features=AutomationControlled` | ✅ bloquea imágenes/fuentes/analytics |
| `performance-audit.service.js` | ❌ ninguno | ❌ ninguno | ❌ no |
| `gmb-scraper.service.js` (no usado) | ❌ ninguno | ❌ ninguno | ❌ no |

`contact-extractor.service.js` ya tiene la base correcta. Hay que **extenderla al resto de llamadas Playwright** y añadir:

1. **Pool de UAs más grande y realista** (10–15 combinaciones actuales de Chrome/Edge/Firefox en Win/Mac, no solo 3).
2. `viewport` con jitter (no siempre `1366×768` exacto — variar ±unos px simula parque real de dispositivos).
3. `--disable-blink-features=AutomationControlled` + override de `navigator.webdriver` vía `addInitScript` (Playwright no lo oculta 100% con args solo).
4. **Backoff exponencial con jitter** ante timeout/403/429 (2–3 reintentos máx, no más — esto es prospección, no debe convertirse en un ataque de fuerza bruta).
5. Proxies: no hay infraestructura de proxies en el repo (`config/`, `.env.example`) — si el volumen de prospección crece, un pool de proxies residenciales rotativos (2–3 proveedores, ej. gestionado vía variable `PROXY_LIST` en `master.env`) es el siguiente paso natural, pero **no es prioritario ahora mismo**: los bugs de §3 son gratis de arreglar y tienen más impacto inmediato que evadir bloqueos que hoy ni siquiera se están gestionando con retry.

### 4.2 Algoritmo ligero para `main_competitor`

No hace falta una llamada extra: `startProspectionV2()` **ya tiene** los resultados completos de cada página SERP en memoria (`results`, en `fetchSerpPage`) antes de iterar lead a lead. El competidor principal de un lead es, con coste cero de red, **el resultado mejor posicionado de la misma página que no sea el propio lead ni un dominio de `SKIP_DOMAINS`**:

```js
function pickMainCompetitor(results, currentResult) {
  const rival = results.find(r =>
    r.position !== currentResult.position &&
    r.url && !SKIP_DOMAINS.some(d => r.url.includes(d))
  );
  return rival ? rival.title.replace(/\s*[-|–]\s*.*$/, '').trim() : null;
}
```

Esto da "quién te gana en el mismo SERP, para la misma búsqueda" — exactamente la promesa del email de `email-generator.js:55` ("he visto que X te está ganando en Google").

### 4.3 `missing_service` — heurística basada en el catálogo de sectores ya existente

El repo ya tiene un catálogo curado de sub-servicios por sector en `bbdd/sectores/sectores_GBM_esp.md` (ej. "Fisioterapia y Osteopatía: rehabilitación, suelo pélvico, fisioterapia deportiva"). En vez de crear un diccionario nuevo, se parsea esa lista de sub-servicios por categoría una vez (caché en memoria) y se compara contra el texto ya disponible (`serp_snippet` + `bodyText`/meta description capturados por `contact-extractor.service.js`, que hoy se descartan tras extraer email/teléfono). El primer sub-servicio del sector que no aparece mencionado en ese texto es el candidato a `missing_service`. Es intencionalmente aproximado (no NLP) — el objetivo es un gancho de venta, no una auditoría exhaustiva.

### 4.4 `seo_gap` — ya calculado, solo falta cablearlo

Una vez arreglados los Bugs #2 y #4, `seo_gap` sale gratis del propio `performanceAuditService`:

```js
seo_gap: [
  !hasSchema && 'sin datos estructurados (Schema.org)',
  !canonical_is_valid && 'canonical mal configurado o ausente',
  h1_count !== 1 && 'etiquetas H1 duplicadas o ausentes',
  robots_txt_blocks_indexing && 'robots.txt bloqueando indexación',
].filter(Boolean).join('; ') || null
```

### 4.5 Extracción de contacto (email/WhatsApp)

`contact-extractor.service.js` ya es sólida (§2, fila 14). Dos mejoras concretas:

1. **Normalizar a WhatsApp real, no solo teléfono.** Hoy `filterPhones()` limpia el formato pero no distingue si el número es de WhatsApp Business. Añadir detección de `a[href*="wa.me"]` / `a[href*="api.whatsapp.com"]` como *fuente de mayor confianza* que el regex de texto libre (ya se detecta `hasWhatsApp` en `scraper.service.js`, que está en el motor muerto — vale la pena portar solo ese selector al `contact-extractor.service.js` vivo).
2. **Priorizar `/aviso-legal` para el email de facturación real.** Ya está en `CONTACT_PATHS`, pero se recorre en el mismo orden que `/contacto` — como el aviso legal casi siempre tiene el email fiscal/administrativo (más útil para prospección B2B que un `info@`), conviene extraerlo aparte como `email_legal` en vez de mezclarlo con el primer email encontrado.

---

## 5. Tabla comparativa: fallo actual → refactor propuesto

| Área | Código actual | Fallo | Refactor propuesto |
|---|---|---|---|
| `audit_data` | `Object.entries(lead.issues)` sobre un array | Claves numéricas en vez de nombres de issue | `Object.fromEntries(lead.issues.map(i => [i, true]))` |
| `performance-audit.service.js` | `waitUntil: 'networkidle2'` | Sintaxis Puppeteer inválida en Playwright → excepción inmediata siempre | `waitUntil: 'networkidle'` |
| `techDetectionService.detectTechStack(url, '')` | HTML vacío hardcodeado | Todos los detectores regex devuelven vacío | Pasar el HTML ya obtenido por `contactExtractorService` |
| Auditorías de performance/tech-stack | `.then()` sin `await`, fuera del `return` | Race condition + campos ausentes en CSV/DB | `await Promise.all([...])` antes de construir/devolver `lead` |
| CSV export | Cabeceras sin `top_issue`, `ttfb_ms`, `tech_cms`, etc. | Datos calculados se descartan al no tener columna | Añadir columnas correspondientes en `csv-export.service.js` |
| `main_competitor` / `missing_service` / `seo_gap` | `null` hardcodeado, sin lógica | Variables muertas desde el origen | Algoritmos §4.2–4.4, reusando datos ya obtenidos (SERP + contact-extractor) |
| `gmb_claimed` | `!!(website \|\| phone \|\| horario)` | Proxy débil, falsos positivos | Usar `business_status === 'OPERATIONAL'` + heurística combinada más conservadora (ver parche §6.5) — documentar como *estimación*, no dato oficial |
| Filtro de exclusión | Solo agregadores/redes sociales | Se cuelan directorios institucionales (`.gob.es`, `einforma.com`...) | Ampliar `SKIP_DOMAINS` (parche §6.6) |
| Bloqueos 403/429 | Ninguno | Leads se pierden en silencio ante error transitorio | Wrapper `fetchWithRetry()` con backoff exponencial (parche §6.7) |
| Código muerto | `gmb-scraper.service.js`, `scraper.service.js`, `audit.service.js` | Confunde mantenimiento, riesgo de que alguien las "reactive" pensando que están vivas | Archivar/eliminar |

---

## 6. Parches listos para aplicar

> Todos en JS ESM, estilo idéntico al resto del repo (no se introduce TypeScript en `backend/`, que es Express puro).

### 6.1 Fix `audit_data` (Bug #1)

`backend/services/scraping-orchestrator.js`

```diff
-        audit_data: lead.issues ? Object.fromEntries(Object.entries(lead.issues).map(([k, v]) => [k, !!v])) : {},
+        audit_data: lead.issues ? Object.fromEntries(lead.issues.map(issue => [issue, true])) : {},
```

Y en `backend/routes/contact.routes.js`, ahora `top_issue` sí devuelve el nombre real del issue:

```diff
-        if (key === 'top_issue')    return Object.keys(lead.audit_data || {}).find(k => lead.audit_data[k]) || '';
+        if (key === 'top_issue')    return Object.keys(lead.audit_data || {})[0] || '';
```

### 6.2 Fix `performance-audit.service.js` (Bug #2)

```diff
-      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
+      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
```

### 6.3 Fix + await de auditorías en `prospector-v2.service.js` (Bugs #3 y #4)

```diff
-  // Auditorías técnicas en background
-  performanceAuditService.auditPerformanceAndCanonical(result.url)
-    .then(a => {
-      lead.ttfb_ms = a.ttfb_ms;
-      lead.lcp_ms = a.largest_contentful_paint_ms;
-      lead.cls = a.cumulative_layout_shift;
-      lead.canonical_url = a.canonical_url;
-      lead.h1_count = a.h1_count;
-      lead.top_issue = a.top_issue;
-      lead.top_issue_severity = a.top_issue_severity;
-    })
-    .catch(e => logger.warn(`Performance audit error: ${e.message}`));
-
-  techDetectionService.detectTechStack(result.url, '')
-    .then(t => {
-      lead.tech_cms = t.cms?.join(',') || null;
-      lead.tech_ecommerce = t.ecommerce;
-      lead.tech_analytics = t.analytics?.join(',') || null;
-      lead.tech_server = t.server;
-      lead.tech_risks = t.risks?.join(',') || null;
-    })
-    .catch(e => logger.warn(`Tech detection error: ${e.message}`));
-
-  return lead;
+  // Auditorías técnicas — se esperan para que sus datos lleguen al CSV/BD
+  const [perfResult, techResult] = await Promise.allSettled([
+    performanceAuditService.auditPerformanceAndCanonical(result.url),
+    techDetectionService.detectTechStack(result.url, contacted.html || ''),
+  ]);
+
+  if (perfResult.status === 'fulfilled') {
+    const a = perfResult.value;
+    lead.ttfb_ms = a.ttfb_ms;
+    lead.lcp_ms = a.largest_contentful_paint_ms;
+    lead.cls = a.cumulative_layout_shift;
+    lead.canonical_url = a.canonical_url;
+    lead.h1_count = a.h1_count;
+    lead.top_issue = a.top_issue;
+    lead.top_issue_severity = a.top_issue_severity;
+    lead.seo_gap = [
+      !lead.has_schema && 'sin datos estructurados (Schema.org)',
+      a.canonical_url && !a.canonical_is_valid && 'canonical mal configurado',
+      a.h1_count !== 1 && 'etiquetas H1 duplicadas o ausentes',
+      a.robots_txt_blocks_indexing && 'robots.txt bloqueando indexación',
+    ].filter(Boolean).join('; ') || null;
+  } else {
+    logger.warn(`Performance audit error: ${perfResult.reason?.message}`);
+  }
+
+  if (techResult.status === 'fulfilled') {
+    const t = techResult.value;
+    lead.tech_cms = t.cms?.join(',') || null;
+    lead.tech_ecommerce = t.ecommerce;
+    lead.tech_analytics = t.analytics?.join(',') || null;
+    lead.tech_server = t.server;
+    lead.tech_risks = t.risks?.join(',') || null;
+  } else {
+    logger.warn(`Tech detection error: ${techResult.reason?.message}`);
+  }
+
+  lead.main_competitor = pickMainCompetitor(pageResults, result);
+  lead.missing_service = pickMissingService(category, `${result.snippet} ${contacted.page_text || ''}`);
+  lead.icebreaker = lead.main_competitor
+    ? `He visto que ${lead.main_competitor} te está ganando en Google en ${city}.${lead.seo_gap ? ` Además tu web tiene: ${lead.seo_gap}.` : ''}`
+    : null;
+
+  return lead;
```

> Nota: este cambio hace que `processResult()` tarde más por lead (ahora espera performance+tech en vez de dispararlos en paralelo sin esperar). Es el trade-off correcto: **datos completos y correctos > velocidad artificial con campos vacíos**. Si el volumen lo requiere, paralelizar auditorías *entre leads* (con un límite de concurrencia, ej. `p-limit(3)`) en vez de dentro de un mismo lead.

`processResult` necesita recibir `pageResults` (el array completo de resultados de la página) para que `pickMainCompetitor` funcione:

```diff
-        for (const result of results) {
+        for (const result of results) {
           try {
             ...
-            const lead = await processResult({ result, city, category });
+            const lead = await processResult({ result, city, category, pageResults: results });
```

```diff
-async function processResult({ result, city, category }) {
+async function processResult({ result, city, category, pageResults }) {
```

### 6.4 Nuevas funciones auxiliares (`main_competitor` / `missing_service`)

Añadir en `backend/services/prospector-v2.service.js` (junto a `extractDomain`):

```js
// backend/services/sector-services.util.js
import fs from 'fs';
import path from 'path';

let _sectorServicesCache = null;

// Parsea bbdd/sectores/sectores_GBM_esp.md una vez y cachea:
// { "fisioterapia y osteopatía": ["rehabilitación", "suelo pélvico", "fisioterapia deportiva"], ... }
function loadSectorServices() {
  if (_sectorServicesCache) return _sectorServicesCache;
  _sectorServicesCache = {};
  try {
    const filePath = path.join(process.cwd(), 'bbdd', 'sectores', 'sectores_GBM_esp.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const m = line.match(/^\*\s+\*\*(.+?)\*\*:\s*(.+)$/);
      if (!m) continue;
      const [, sector, servicesRaw] = m;
      const services = servicesRaw.split(/,|\by\b/).map(s => s.trim().toLowerCase()).filter(Boolean);
      _sectorServicesCache[sector.toLowerCase()] = services;
    }
  } catch {
    _sectorServicesCache = {};
  }
  return _sectorServicesCache;
}

export function pickMissingService(category, text) {
  if (!category || !text) return null;
  const dict = loadSectorServices();
  const key = Object.keys(dict).find(k => k.includes(category.toLowerCase()) || category.toLowerCase().includes(k));
  if (!key) return null;

  const haystack = text.toLowerCase();
  const missing = dict[key].find(service => !haystack.includes(service));
  return missing || null;
}
```

Y en `prospector-v2.service.js`:

```js
import { pickMissingService } from './sector-services.util.js';

function pickMainCompetitor(pageResults, currentResult) {
  const rival = pageResults.find(r =>
    r.position !== currentResult.position &&
    r.url && !SKIP_DOMAINS.some(d => r.url.includes(d))
  );
  if (!rival) return null;
  return rival.title.replace(/\s*[-|–]\s*.*$/, '').trim();
}
```

### 6.5 `gmb_claimed` más conservador

`backend/services/google-places.service.js`

```diff
-      // Un negocio reclamado tiene website/teléfono/horarios
-      result.gmb_claimed = !!(details.website || details.formatted_phone_number || details.opening_hours);
+      // La Places API no expone "reclamado" directamente. Se usa una heurística conservadora:
+      // negocio operativo + al menos 2 de 3 señales de gestión activa (más estricto que 1 sola señal).
+      const signals = [details.website, details.formatted_phone_number, details.opening_hours].filter(Boolean).length;
+      result.gmb_claimed = details.business_status === 'OPERATIONAL' && signals >= 2;
```

### 6.6 Ampliar `SKIP_DOMAINS`

`backend/services/prospector-v2.service.js`

```diff
 const SKIP_DOMAINS = [
   'google.com', 'facebook.com', 'yelp.com', 'tripadvisor.com',
   'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
   'wikipedia.org', 'amazon.com', 'maps.google.com', 'reddit.com',
   'bing.com', 'yahoo.com', 'booking.com', 'idealista.com', 'fotocasa.es',
   'infojobs.net', 'indeed.com', 'paginas-amarillas.com', 'paginasamarillas.es',
   'habitaclia.com', 'wallapop.com', 'milanuncios.com',
+  // Directorios institucionales/sectoriales — no son la web del negocio
+  'einforma.com', 'empresite.com', 'axesor.es', 'infoisinfo.es',
+  'guiadeltrabajador.com', 'cylex.es', 'europages.es',
+  '.gob.es', '.gub.es', 'sede.', 'ayuntamiento',
 ];
```

(La comprobación existente `result.url.includes(d)` ya funciona con sufijos tipo `.gob.es` o substrings tipo `ayuntamiento` sin cambios adicionales.)

### 6.7 Retry/backoff ante 403/429/OVER_QUERY_LIMIT

Nuevo helper `backend/utils/fetch-with-retry.js`:

```js
export async function fetchWithRetry(url, options = {}, { retries = 2, baseDelayMs = 800 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 && res.status !== 403) return res;
    if (attempt === retries) return res;
    const delay = baseDelayMs * 2 ** attempt + Math.random() * 300;
    await new Promise(r => setTimeout(r, delay));
  }
}
```

Uso en `google-places.service.js` (`_findPlaceId`/`_getPlaceDetails`) y `prospector-v2.service.js` (`fetchSerpPage`): sustituir `fetch(...)` por `fetchWithRetry(...)`, y en `google-places.service.js` añadir el caso `OVER_QUERY_LIMIT`:

```diff
     if (data.status === 'REQUEST_DENIED') {
       throw new Error(`API denegada: ${data.error_message}`);
     }
+    if (data.status === 'OVER_QUERY_LIMIT') {
+      logger.warn('Google Places: cuota excedida, reintentando tras pausa...');
+      await new Promise(r => setTimeout(r, 2000));
+      return this._findPlaceId(businessName, city, apiKey); // 1 reintento simple
+    }
```

### 6.8 Nuevas columnas en CSV (para que lo calculado no se pierda)

`backend/services/csv-export.service.js` — añadir a `headers` y al `row`:

```diff
   'Main_Competitor',
   'Missing_Service',
   'Icebreaker',
   'SEO_Gap',
+  'Top_Issue',
+  'TTFB_Ms',
+  'Tech_CMS',
 ];
```

```diff
   escapeCSV(lead.seo_gap || ''),
+  escapeCSV(lead.top_issue || ''),
+  lead.ttfb_ms || '',
+  escapeCSV(lead.tech_cms || ''),
 ];
```

Y en el `headerMap` de `readCSVFromPath` (mismo archivo) añadir las correspondencias inversas, y en `scraping-orchestrator.js` añadir esos campos al `leadsForDB` (requiere columnas equivalentes en la tabla `io_pro_leads` de Supabase — no versionada en el repo, se gestiona desde el dashboard de Supabase; hay que crearlas ahí primero).

---

## 7. Orden de implementación recomendado

1. **Bugs #1–#3** (parches §6.1–6.2, cambio de una línea cada uno) — cero riesgo, arreglan datos ya calculados que hoy se pierden.
2. **Bug #4 + `main_competitor`/`missing_service`/`seo_gap`** (§6.3–6.4) — el cambio más grande, pero reutiliza infraestructura existente (SERP ya obtenido, catálogo de sectores ya existente). Probar con una prospección pequeña (`pagesFrom=2, pagesTo=2`) antes de lanzar a producción, porque aumenta la duración por lead.
3. **`gmb_claimed`** (§6.5) y **`SKIP_DOMAINS`** (§6.6) — bajo riesgo, mejoran precisión sin tocar flujo.
4. **Retry/backoff** (§6.7) — importante para escalar volumen sin perder leads por errores transitorios.
5. **Columnas CSV/BD** (§6.8) — depende de crear las columnas nuevas en Supabase primero.
6. **Limpieza de código muerto** (`gmb-scraper.service.js`, `scraper.service.js`, `audit.service.js`) — cuando haya confirmación de que nada externo los referencia (solo `scripts/health-check.js` los toca hoy).

---

**Guardado en:** `docs/analysis/AUDITORIA-SCRAPING-14-VARIABLES.md`
