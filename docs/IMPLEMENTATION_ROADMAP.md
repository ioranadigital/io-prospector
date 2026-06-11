# 🗺️ IO Prospector — Roadmap de Implementación (4 Pillares)

## 📊 Vista General

| Pilar | Features | Sprint | Duración | Dificultad | ROI |
|------|----------|--------|----------|-----------|-----|
| **1️⃣ SEO Técnico** | Performance, Tech Stack, Structured Data | 1 | 5-7 días | Media | Alto ⭐⭐⭐ |
| **2️⃣ SEO Local** | NAP Check, GMB Tracking | 2 | 5-7 días | Media | Alto ⭐⭐⭐ |
| **3️⃣ Competencia** | Gap Analysis, Benchmarking | 2 | 5-7 días | Media-Alta | Muy Alto ⭐⭐⭐⭐ |
| **4️⃣ Arquitectura** | n8n Async, Redis Queues, API Escalable | 3 | 10-14 días | Alta | Crítico ⭐⭐⭐⭐⭐ |

---

## 🏃 SPRINT 1: SEO Técnico (Quick Wins)

### Feature 1.1: Performance & Canonical Audit
**Objetivo:** Medir Core Web Vitals + detectar problemas SEO críticos  
**Tiempo:** 2 días  
**Complejidad:** ⭐⭐ Media

#### Pasos de Implementación:
```
1. Backend → Crear servicio: backend/services/seo-technical/performance-audit.service.js
   ├─ Inyectar Web Vitals collector en Playwright
   ├─ Extraer TTFB, LCP, CLS
   ├─ Validar canonical URL
   ├─ Detectar H1 duplicados
   ├─ Verificar robots.txt y noindex
   └─ Retornar objeto con issues críticos

2. BD → Ejecutar SQL para agregar columnas:
   ├─ ttfb_ms, lcp_ms, cls (números)
   ├─ canonical_url (texto)
   ├─ h1_count (número)
   ├─ top_issue, top_issue_severity (texto)
   └─ robots_txt_status

3. Frontend → Crear UI para mostrar resultados:
   ├─ Nueva sección en LeadAnalysisModal
   ├─ Traffic light: 🟢 (OK) 🟡 (Warning) 🔴 (Critical)
   ├─ Mostrar cada métrica con recomendación
   └─ Link directo a soluciones

4. Pruebas:
   ├─ curl -X POST http://localhost:4000/api/audit/performance \
         -d '{"url": "https://example.com"}'
   └─ Verificar que datos aparecen en modal del lead
```

**Código mínimo:** ~200 líneas servicio + ~150 líneas API + ~50 líneas UI

---

### Feature 1.2: Tech Stack Detection
**Objetivo:** Detectar CMS, ecommerce, analytics, riesgos de seguridad  
**Tiempo:** 2 días  
**Complejidad:** ⭐⭐ Media

#### Pasos de Implementación:
```
1. Backend → Crear servicio: backend/services/tech-stack/tech-detection.service.js
   ├─ Detectar CMS (WordPress, Shopify, Drupal, etc.)
   ├─ Detectar ecommerce (WooCommerce, Shopify, etc.)
   ├─ Detectar analytics (Google Analytics, Mixpanel, etc.)
   ├─ Detectar herramientas de forms (Typeform, HubSpot, etc.)
   ├─ Detectar CDN (Cloudflare, AWS CloudFront, etc.)
   ├─ Detectar versiones desactualizadas (WordPress < 6.0)
   ├─ Detectar ausencia de herramientas críticas
   └─ Retornar issues con recomendaciones

2. Integrar en scraper.service.js:
   ├─ Llamar techDetectionService.detectTechStack(url, html)
   ├─ Guardar resultado en lead.tech_stack
   └─ Retornar junto con otros datos

3. BD → Agregar columna:
   ├─ tech_stack JSONB (almacena objeto completo)
   └─ tech_issues JSONB (array de problemas)

4. Frontend → Mostrar en modal:
   ├─ Card: "🛠️ Tech Stack"
   ├─ Listar: CMS, ecommerce, analytics, formas de captura
   ├─ Mostrar issues en rojo (ej: "WordPress desactualizado")
   └─ Expandible para detalles

5. Pruebas:
   ├─ Visitar http://localhost:3002/prospector
   ├─ Buscar un lead
   ├─ Abrir modal y revisar sección Tech Stack
   └─ Debe mostrar CMS detectado + issues
```

**Código mínimo:** ~300 líneas servicio + ~50 líneas integración

---

### Feature 1.3: Structured Data Gaps
**Objetivo:** Detectar ausencia de schemas JSON-LD según tipo de negocio  
**Tiempo:** 2 días  
**Complejidad:** ⭐⭐ Media

#### Pasos de Implementación:
```
1. Backend → Crear servicio: backend/services/seo-technical/structured-data.service.js
   ├─ Detectar tipo de negocio (ecommerce/local/service/media)
   ├─ Validar presencia de schemas:
   │  ├─ Organization (todos)
   │  ├─ Product (ecommerce)
   │  ├─ LocalBusiness (local)
   │  ├─ NewsArticle/BlogPosting (media)
   │  └─ Review/AggregateRating (reputación)
   ├─ Retornar gaps con severidad (high/medium/low)
   ├─ Incluir ejemplos JSON-LD en cada recomendación
   └─ Calcular score de cobertura

2. Integrar en scraper.service.js:
   ├─ Llamar structuredDataService.detectStructuredDataGaps(url, html)
   ├─ Guardar resultado en lead.schema_gaps
   └─ Retornar junto con otros datos

3. BD → Agregar columna:
   ├─ schema_gaps JSONB (almacena array de gaps)
   ├─ schema_coverage_score NUMERIC (0-100)
   └─ missing_schema_types TEXT[] (array de tipos)

4. Frontend → Mostrar en modal:
   ├─ Card: "📋 Structured Data"
   ├─ Progress bar: "7/10 schemas implementados"
   ├─ Listar gaps por severidad (🔴 High, 🟡 Medium)
   ├─ Botón "Ver ejemplos" → modal con JSON-LD listo para copiar
   └─ Clickeable: copiar código al portapapeles

5. Pruebas:
   ├─ Buscar ecommerce sin Product schema
   ├─ Debe mostrar gap recomendando Product + Offer
   ├─ El JSON-LD debe ser copiable
   └─ Verificar en lead.schema_gaps que está guardado
```

**Código mínimo:** ~350 líneas servicio + ~100 líneas UI

---

## 🚀 SPRINT 2: SEO Local + Competencia (Semana 2-3)

### Feature 2.1: NAP Consistency Checker
**Objetivo:** Verificar que Nombre/Teléfono/Dirección coincida en Google/Facebook/Yelp  
**Tiempo:** 3 días  
**Complejidad:** ⭐⭐⭐ Media-Alta

#### Pasos de Implementación:
```
1. Backend → Crear servicio: backend/services/gmb-api/nap-consistency.service.js
   ├─ Normalizar strings (minúsculas, espacios, caracteres especiales)
   ├─ Normalizar teléfonos (solo números)
   ├─ Buscar en Google Maps (direct URL + parsing)
   ├─ Búsqueda en Facebook (parse datos públicos)
   ├─ Búsqueda en Yelp (parse datos públicos)
   ├─ Comparar NAP en cada fuente
   ├─ Calcular consistency_score (0-100)
   └─ Retornar inconsistencias detectadas

2. BD → Agregar columnas:
   ├─ nap_consistency_score NUMERIC
   ├─ nap_issues JSONB (array de inconsistencias)
   ├─ verified_in_google BOOLEAN
   ├─ verified_in_facebook BOOLEAN
   └─ verified_in_yelp BOOLEAN

3. Frontend → Mostrar en modal:
   ├─ Card: "📍 NAP Consistency"
   ├─ Score visual: "78/100" con barra de progreso
   ├─ Tabla: Fuente | Nombre | Teléfono | Dirección | Status
   ├─ ✅ Verde si coincide, ❌ Rojo si no
   └─ Recomendaciones: "Actualiza Facebook: dirección desactualizada"

4. Endpoint API:
   ├─ POST /api/audit/nap-consistency
   ├─ Body: { url, business_name, phone, address }
   └─ Respuesta: { score, verified_sources, inconsistencies }

5. Pruebas:
   ├─ POST http://localhost:4000/api/audit/nap-consistency \
        -d '{"business_name": "Café La Obra", "phone": "+34 912 345 678", ...}'
   └─ Debe mostrar coincidencias/desajustes en cada plataforma
```

**Código mínimo:** ~400 líneas servicio + ~150 líneas UI

---

### Feature 2.2: Google Business Profile API (Futuro)
**Objetivo:** Integración directa con API oficial de Google (más preciso que scraping)  
**Tiempo:** 5 días (Fase 2)  
**Complejidad:** ⭐⭐⭐⭐ Alta

#### Requisitos Previos:
```
1. Obtener OAuth 2.0 credentials de Google Cloud Console
2. Activar Business Profile Management API
3. Crear servicio: backend/services/gmb-api/gmb-official.service.js
4. Implementar OAuth flow en frontend
5. Guardar refresh_token en Supabase para reutilizar
```

---

### Feature 3.1: Competitor Gap Analysis
**Objetivo:** Comparar tu website vs competidores en 7 dimensiones  
**Tiempo:** 3 días  
**Complejidad:** ⭐⭐⭐ Media-Alta

#### Pasos de Implementación:
```
1. Backend → Crear servicio: backend/services/competitor-analysis/gap-analysis.service.js
   ├─ Extraer métricas de URL 1 (lead):
   │  ├─ Word count (tamaño contenido)
   │  ├─ Heading count (estructura)
   │  ├─ Mobile friendly (responsivo)
   │  ├─ Load time (TTFB)
   │  ├─ Analytics presencia
   │  ├─ Forms count (captura leads)
   │  └─ Schema markup presencia
   ├─ Extraer mismas métricas de URL 2 (competidor)
   ├─ Comparar lado a lado
   ├─ Calcular gaps (diferencias significativas)
   ├─ Priorizar por impacto (high/medium/low)
   └─ Estimar semanas para resolver cada gap

2. BD → Agregar columnas:
   ├─ main_competitor URL TEXT
   ├─ competitor_gaps JSONB (array de gaps)
   ├─ estimated_weeks_to_parity NUMERIC
   └─ last_competitor_audit TIMESTAMPTZ

3. Frontend → Mostrar en modal:
   ├─ Campo "Competidor principal" (URL input)
   ├─ Botón "Analizar brecha"
   ├─ Tabla comparativa:
   │  ├─ Métrica | Tu sitio | Competidor | Brecha | Acción
   │  ├─ Content | 1,200 palabras | 3,500 palabras | -2,300 | Expand
   │  ├─ Mobile | ✅ Responsive | ✅ Responsive | None | ✓
   │  ├─ Load | 2.1s | 0.8s | +1.3s | CDN, Images
   │  └─ Forms | 1 | 3 | -2 | Add exit-intent
   ├─ Resumen: "5 brechas encontradas"
   ├─ Recomendaciones ordenadas por impacto
   └─ Estimación: "~3 semanas para paridad"

4. Endpoint API:
   ├─ POST /api/audit/competitor-gap
   ├─ Body: { lead_url, competitor_url }
   └─ Respuesta: { gaps, total_gaps, estimated_weeks }

5. Pruebas:
   ├─ Comparar sitio A vs sitio B
   ├─ Verificar que gaps detectados son correctos
   ├─ Revisar que recomendaciones son accionables
   └─ Comprobar que puntuación se guarda en BD
```

**Código mínimo:** ~500 líneas servicio + ~200 líneas UI

---

## ⚙️ SPRINT 3: Arquitectura Asíncrona (Semana 4-6)

### Feature 4.1: n8n + Docker Compose
**Objetivo:** Ejecutar auditorías en background sin bloquear interfaz  
**Tiempo:** 5 días  
**Complejidad:** ⭐⭐⭐⭐ Alta

#### Pasos de Implementación:
```
1. Infrastructure → Actualizar docker-compose.yml:
   ├─ PostgreSQL 15 (para n8n state)
   ├─ Redis 7 (para colas)
   ├─ n8n latest (orquestador de workflows)
   ├─ Backend (Node.js con Bull queues)
   └─ Frontend (Next.js)

2. Backend → Crear servicio de n8n:
   ├─ backend/services/n8n-orchestrator.service.js
   ├─ Métodos:
   │  ├─ startScrapeWorkflow(url) → ID workflow
   │  ├─ checkWorkflowStatus(id) → status
   │  ├─ cancelWorkflow(id) → bool
   │  └─ webhookReceiver(payload) → procesar resultado
   └─ Integración con Bull para polling

3. Backend → Implementar Redis + Bull:
   ├─ backend/services/queue.service.js
   ├─ Queues:
   │  ├─ scraping_queue (auditorías largas)
   │  ├─ email_queue (envío masivo de contacto)
   │  ├─ whatsapp_queue (mensajes masivos)
   │  └─ analysis_queue (análisis competitivos)
   ├─ Retry logic (exponential backoff)
   └─ Job tracking en Supabase

4. Frontend → Crear UI de progreso:
   ├─ Modal: "⏳ Auditoría en progreso"
   ├─ Progress bar: "3/5 auditorías completadas"
   ├─ Logs en vivo desde server
   ├─ Cancel button si aún está corriendo
   └─ Auto-refresh cuando termina

5. n8n → Crear workflow JSON:
   ├─ Trigger: webhook de backend
   ├─ Step 1: Scrape con Playwright
   ├─ Step 2: Ejecutar auditoría
   ├─ Step 3: Guardar en Supabase
   ├─ Step 4: Enviar webhook de conclusión
   └─ Error handling: reintentos

6. Comandos Docker:
   ├─ docker-compose down
   ├─ docker-compose build --no-cache
   ├─ docker-compose up -d
   ├─ docker-compose logs -f backend (para ver logs)
   └─ docker-compose logs -f n8n (para ver n8n)

7. Tests:
   ├─ Enviar 5 URLs para auditía
   ├─ Verificar que se encolan en Redis
   ├─ Ver que n8n ejecuta los workflows
   ├─ Confirmarse que resultados llegan a Supabase
   └─ Verificar que frontend muestra progreso
```

**Código mínimo:** ~400 líneas servicio + ~250 líneas UI + ~200 líneas n8n JSON

---

### Feature 4.2: Escalabilidad de Prospection
**Objetivo:** Manejar 1000+ búsquedas sin timeout  
**Tiempo:** 5 días  
**Complejidad:** ⭐⭐⭐⭐ Alta

#### Pasos de Implementación:
```
1. Backend → Refactorizar startProspection():
   ├─ En lugar de hacer scraping secuencial (lento)
   ├─ Encolar cada URL en scraping_queue
   ├─ Retornar inmediatamente con session_id
   ├─ Guardar estado en Supabase (pending/running/done)
   └─ Meter todas las URLs en Redis instantáneamente

2. Backend → Worker process:
   ├─ backend/workers/scrape-worker.js
   ├─ Consume de scraping_queue
   ├─ Ejecuta una auditoría por vez
   ├─ Guarda resultado en io_pro_scraping_raw
   ├─ Incrementa counter en search_sessions
   └─ Si hay error: reintenta con backoff exponencial

3. BD → Crear tabla de tracking:
   ├─ scraping_jobs (id, session_id, url, status, result, error)
   └─ search_sessions (id, query, total_to_process, completed, status)

4. Frontend → Mostrar progreso en tiempo real:
   ├─ WebSocket listener: escuchar updates de sesión
   ├─ Progress bar: "127/1000 leads procesados"
   ├─ ETA: "Completará en ~45 minutos"
   ├─ Botón para pausar/reanudar
   └─ Auto-descarga de resultados cuando termina

5. Tests:
   ├─ Iniciar búsqueda con 100 URLs
   ├─ Debe retornar en < 1 segundo
   ├─ Backend procesa en background
   ├─ Frontend muestra progreso en vivo
   └─ Resultados acumulan en BD sin pérdidas
```

**Código mínimo:** ~300 líneas worker + ~200 líneas UI

---

## 📝 Cronograma Sugerido

```
SEMANA 1 (Sprint 1 — SEO Técnico):
  Lunes-Martes: Feature 1.1 (Performance)
  Miércoles: Feature 1.2 (Tech Stack)
  Jueves-Viernes: Feature 1.3 (Structured Data)
  
SEMANA 2-3 (Sprint 2 — SEO Local + Competencia):
  Lunes-Martes: Feature 2.1 (NAP Consistency)
  Miércoles-Viernes: Feature 3.1 (Gap Analysis)
  
SEMANA 4-6 (Sprint 3 — Arquitectura):
  Semana 4: Feature 4.1 (Docker + n8n)
  Semana 5-6: Feature 4.2 (Escalabilidad)

Hito: Todas las features + tests + documentación
```

---

## 🎯 Priorización por Valor

### Máxima Prioridad (¡Hacer primero!):
1. **Feature 1.1** (Performance) — clientes ven Core Web Vitals directamente
2. **Feature 3.1** (Gap Analysis) — diferenciación clave vs competencia
3. **Feature 4.1** (n8n) — sin esto, app colapsa en 100+ búsquedas

### Alta Prioridad (Semana 2):
4. **Feature 1.2** (Tech Stack) — identifica riesgos de seguridad
5. **Feature 2.1** (NAP Consistency) — crucial para SEO local

### Normal Prioridad (Semana 3+):
6. **Feature 1.3** (Structured Data) — ROI más lento pero importante
7. **Feature 4.2** (Escalabilidad) — cuando volumen > 500 URLs/sesión

---

## 💡 Tips de Implementación

### ✅ DO:
- Implementar Feature 1.1 primero (más simple, máximo valor)
- Usar el código de IMPLEMENTATION_GUIDE.md como base
- Testear cada feature en http://localhost:3002 antes de pasar al siguiente
- Commitear después de cada feature: `git commit -m "Feature: Performance Audit"`

### ❌ DON'T:
- No empezar Feature 4 sin terminar Sprint 1 + 2
- No hacer Feature 3.1 antes de Feature 1.1 (necesita datos base)
- No cambiar docker-compose.yml sin backup (Feature 4.1 es destructivo)

---

## 📊 Validación

**Después de cada sprint:**
```bash
# Verificar que código compila
cd backend && npm run build
cd frontend && npm run build

# Verificar tipos
tsc --noEmit

# Ejecutar tests si existen
npm test

# Verificar en navegador
http://localhost:3002/prospector
```

---

## 🚨 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Cannot read property 'seo'" | Asegúrate que scraperService retorna seo object |
| "Feature no aparece en modal" | Borrar .next/ y rebuild: `rm -rf frontend/.next && docker-compose build --no-cache` |
| "Backend no conecta a n8n" | Verificar env vars en docker-compose.yml |
| "Colas no procesan" | Verificar redis está corriendo: `docker exec redis redis-cli ping` |

---

**¿Listo para empezar Feature 1.1?** 🚀  
Di "yes" para que te muestro el código completo para Performance Audit.
