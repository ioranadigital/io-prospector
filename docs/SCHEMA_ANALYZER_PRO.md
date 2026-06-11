# 🚀 Schema Analyzer PRO - Guía Completa

**Módulo avanzado de análisis Schema.org con diccionario completo de entidades, validación inteligente y alertas contextualizadas.**

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Diccionario de Entidades](#diccionario-de-entidades)
4. [API Endpoints](#api-endpoints)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Sistema de Alertas](#sistema-de-alertas)
7. [Integración](#integración)

---

## Introducción

El **Schema Analyzer PRO** es un extractor inteligente de JSON-LD que:

✅ Analiza URLs y extrae datos estructurados  
✅ Identifica 30+ tipos de Schema.org  
✅ Valida propiedades obligatorias y recomendadas  
✅ Genera alertas contextualizadas con impacto SEO  
✅ Maneja estructuras complejas (@graph, anidadas)  
✅ Procesa lotes de 1-100 URLs en paralelo  
✅ Calcula scores de completitud (0-100)  

---

## Arquitectura

### Estructura de Archivos

```
backend/services/schema/
├── schema-analyzer.service.js      (Orquestador principal)
├── schema-dictionary.js            (30+ tipos, propiedades)
├── schema-validators.js            (Validaciones por tipo)
├── schema-extractor.js             (Extrae JSON-LD)
└── [schema-alerts.js]              (Sistema de alertas)

backend/routes/
└── schema-analyzer-pro.routes.js   (Endpoints públicos)
```

### Flujo de Procesamiento

```
URL Input
  ↓
[1] Fetch HTML (con timeout, reintentos)
  ↓
[2] Extract JSON-LD scripts (Cheerio)
  ↓
[3] Flatten @graph structures
  ↓
[4] Identify schema types
  ↓
[5] Validate against Dictionary
  ↓
[6] Generate Alerts (CRITICAL/HIGH/MEDIUM/LOW)
  ↓
[7] Calculate Scores (0-100)
  ↓
JSON Response
```

---

## Diccionario de Entidades

### Categorías Principales

#### 1. **TRANSACCIONAL** (E-commerce & Servicios)

**Product** (Producto)
```json
{
  "required": ["name", "image"],
  "recommended": ["offers", "aggregateRating", "description", "brand"],
  "nested": {
    "offers": { "required": ["price", "priceCurrency"] },
    "aggregateRating": { "required": ["ratingValue", "ratingCount"] }
  },
  "seoImpact": "ALTO - Google Shopping, rich snippets"
}
```

**Service** (Servicio)
```json
{
  "required": ["name", "serviceType"],
  "recommended": ["provider", "areaServed", "availableChannel"],
  "seoImpact": "MEDIO - Clarifica servicios"
}
```

#### 2. **CONTENIDO** (Articles & Blog)

**Article / BlogPosting / NewsArticle**
```json
{
  "required": ["headline", "image", "datePublished"],
  "recommended": ["dateModified", "author", "publisher"],
  "eeatRisk": true,
  "seoImpact": "MUY ALTO - Crítico para E-E-A-T"
}
```

#### 3. **IA_MAGNET** (Featured Snippets)

**FAQPage**
```json
{
  "required": ["mainEntity"],
  "structure": {
    "mainEntity[0]": {
      "@type": "Question",
      "name": "¿Pregunta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Respuesta"
      }
    }
  },
  "seoImpact": "MUY ALTO - Genera featured snippets"
}
```

**HowTo**
```json
{
  "required": ["name", "step"],
  "recommended": ["image", "totalTime"],
  "seoImpact": "MUY ALTO - Domina featured snippets"
}
```

#### 4. **SEO_LOCAL** (Negocio Local)

**LocalBusiness** (+ subtipos: Restaurant, Store, ProfessionalService)
```json
{
  "required": ["name", "address", "telephone"],
  "recommended": ["geo", "openingHoursSpecification", "image", "sameAs"],
  "napConsistency": true,
  "seoImpact": "MUY ALTO - Crítico para búsquedas locales"
}
```

#### 5. **ESTRUCTURAL** (Siempre Recomendados)

**BreadcrumbList**
```json
{
  "required": ["itemListElement"],
  "structure": [
    { "position": 1, "name": "Home", "item": "https://..." },
    { "position": 2, "name": "Producto", "item": "https://..." }
  ],
  "seoImpact": "ALTO - Mejora navegación en SERP"
}
```

**WebSite**
```json
{
  "required": ["name", "url"],
  "recommended": ["potentialAction", "image"],
  "seoImpact": "MEDIO - Base de identidad digital"
}
```

---

## API Endpoints

### 1. POST `/api/schema-analyzer-pro/analyze`

**Analizar una URL individual**

#### Request
```bash
curl -X POST http://localhost:4006/api/schema-analyzer-pro/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://esgarden.es/producto/flores"}'
```

#### Response (200 OK)
```json
{
  "success": true,
  "url": "https://esgarden.es/producto/flores",
  "analyzedAt": "2026-06-11T10:00:00Z",
  
  "summary": {
    "totalSchemas": 3,
    "validSchemas": 3,
    "primaryType": "Product",
    "primaryScore": 85
  },

  "schemasFound": ["WebSite", "Organization", "Product"],

  "schemas": [
    {
      "type": "Product",
      "category": "TRANSACCIONAL",
      "isValid": true,
      "score": 85,
      "definition": {
        "description": "Producto de e-commerce o catálogo",
        "required": ["name", "image"],
        "recommended": ["offers", "aggregateRating", "brand"],
        "seoImpact": "ALTO - Mejora visibilidad en Google Shopping"
      },
      "extractedData": {
        "name": "Flores Artificiales XYZ",
        "image": "https://...",
        "price": "29.99",
        "priceCurrency": "EUR"
      },
      "validation": {
        "present": ["name", "image", "offers"],
        "missing": [],
        "recommendedPresent": ["aggregateRating"],
        "recommendedMissing": ["brand"]
      },
      "alerts": [
        {
          "severity": "MEDIUM",
          "type": "MISSING_RECOMMENDED",
          "property": "brand",
          "message": "Falta propiedad recomendada: 'brand'",
          "impact": "Marca no especificada",
          "recommendation": "Agrega brand: { name: 'Marca' }"
        }
      ]
    }
  ],

  "alerts": [
    {
      "severity": "CRITICAL",
      "type": "MISSING_REQUIRED",
      "property": "offers",
      "schemaType": "Product",
      "message": "Falta propiedad obligatoria: 'offers'",
      "impact": "No aparece en Google Shopping",
      "recommendation": "Agrega offers: { price, priceCurrency, availability }"
    }
  ],

  "alertsSummary": {
    "total": 2,
    "critical": 1,
    "high": 0,
    "medium": 1,
    "low": 0
  },

  "scores": {
    "average": 82,
    "byType": {
      "Product": 85,
      "Organization": 90,
      "WebSite": 75
    }
  },

  "byCategory": {
    "TRANSACCIONAL": [
      { "type": "Product", "score": 85, "isValid": true }
    ],
    "ORGANIZACION": [
      { "type": "Organization", "score": 90, "isValid": true }
    ]
  },

  "executionTime": 3245
}
```

### 2. POST `/api/schema-analyzer-pro/analyze-batch`

**Analizar múltiples URLs (máx 100)**

#### Request
```bash
curl -X POST http://localhost:4006/api/schema-analyzer-pro/analyze-batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://sitio1.com",
      "https://sitio2.com",
      "https://sitio3.com"
    ],
    "concurrency": 3
  }'
```

#### Response
```json
{
  "success": true,
  "batchStats": {
    "totalRequested": 3,
    "successCount": 3,
    "errorCount": 0,
    "durationMs": 9500,
    "avgTimePerUrl": 3166
  },
  "results": [ ... ],
  "errors": []
}
```

### 3. POST `/api/schema-analyzer-pro/health-check`

**Verificar disponibilidad del servicio**

#### Request
```bash
curl -X POST http://localhost:4006/api/schema-analyzer-pro/health-check \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ejemplo.com"}'
```

#### Response
```json
{
  "status": "ok",
  "service": "schema-analyzer-pro",
  "url": "https://ejemplo.com",
  "schemasFound": 4,
  "executionTime": 2100
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Análisis de E-commerce

```javascript
const response = await fetch('/api/schema-analyzer-pro/analyze', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://tienda.es/producto' })
});

const result = await response.json();

if (result.summary.primaryType === 'Product') {
  console.log(`Score: ${result.scores.average}/100`);
  
  // Alertas críticas
  const critical = result.alerts.filter(a => a.severity === 'CRITICAL');
  console.log(`⚠️ ${critical.length} problemas críticos encontrados`);
  
  // Recomendaciones
  critical.forEach(alert => {
    console.log(`→ ${alert.recommendation}`);
  });
}
```

### Ejemplo 2: Auditoría de Blog

```javascript
// Verificar que BlogPosting tenga E-E-A-T
const result = await analyzeUrl('https://blog.es/articulo');

const blogSchema = result.schemas.find(s => s.type === 'BlogPosting');
const eeatRisks = blogSchema.alerts.filter(a => a.type === 'EEAT_RISK');

if (eeatRisks.length > 0) {
  console.log('⚠️ Riesgos de E-E-A-T detectados');
  eeatRisks.forEach(risk => {
    console.log(`  - ${risk.message}`);
    console.log(`    ${risk.recommendation}`);
  });
}
```

### Ejemplo 3: Análisis Masivo

```javascript
// Auditar 50 productos de tienda
const urls = productIds.map(id => `https://tienda.es/producto/${id}`);

const batch = await fetch('/api/schema-analyzer-pro/analyze-batch', {
  method: 'POST',
  body: JSON.stringify({ urls, concurrency: 5 })
});

const results = await batch.json();

// Estadísticas
console.log(`✅ Analizados: ${results.batchStats.successCount}`);
console.log(`⏱️  Tiempo promedio: ${results.batchStats.avgTimePerUrl}ms`);

// Productos con problemas críticos
const withCritical = results.results
  .filter(r => r.alertsSummary.critical > 0);

console.log(`\n🚨 ${withCritical.length} productos con alertas críticas`);
```

---

## Sistema de Alertas

### Severidades

| Nivel | Icono | Descripción | Acción |
|-------|-------|-------------|--------|
| CRITICAL | 🚨 | Impacta directamente visibilidad | Debe arreglarse ya |
| HIGH | ⚠️ | Riesgo importante de SEO | Corregir pronto |
| MEDIUM | 💡 | Oportunidad de mejora | Considerar |
| LOW | ℹ️ | Información | Opcional |

### Tipos de Alertas

#### Propiedades Faltantes
```
"MISSING_REQUIRED"     → Propiedad obligatoria ausente
"MISSING_RECOMMENDED"  → Propiedad recomendada ausente
"MISSING_INTEGRATION"  → Vinculación externa faltante (ej: Google Business)
```

#### Validación
```
"INVALID_NESTED"       → Estructura anidada incorrecta
"INVALID_FORMAT"       → Formato de valor incorrecto
```

#### Riesgo SEO
```
"EEAT_RISK"            → Problema de Expertise, Authoritativeness, Trustworthiness
"FRESHNESS_RISK"       → Contenido aparentemente obsoleto
"LOCAL_INCOMPLETE"     → NAP (Nombre, Address, Phone) incompleto
```

---

## Integración

### Uso en Auditor Global

Para integrar con el auditor existente:

```javascript
// backend/services/auditor/checks/schema-pro.check.js
import { schemaAnalyzer } from '../schema/schema-analyzer.service.js';

export const id = 'schema-pro';
export const label = 'Datos Estructurados (Avanzado)';
export const weight = 15;

export async function run(page, { url }) {
  const html = await page.content();
  const result = await schemaAnalyzer.analyzeUrl(url);
  
  // Convertir a formato de checks del auditor
  return result.alerts.map(alert => ({
    id: `schema-pro.${alert.type}`,
    label: alert.message,
    status: alert.severity === 'CRITICAL' ? 'fail' : 'warn',
    detail: alert.recommendation,
    value: `${result.summary.totalSchemas} schemas`,
  }));
}
```

### Frontend Integration

```typescript
// frontend/components/schema-pro-analyzer.tsx
'use client';

import { useState } from 'react';

export default function SchemaPro() {
  const [result, setResult] = useState(null);

  const handleAnalyze = async (url: string) => {
    const res = await fetch('/api/schema-analyzer-pro/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    
    const data = await res.json();
    setResult(data);
  };

  // Renderizar alertas por severidad
  if (result) {
    const critical = result.alerts.filter(a => a.severity === 'CRITICAL');
    const high = result.alerts.filter(a => a.severity === 'HIGH');
    
    return (
      <div>
        <h2>Score: {result.scores.average}/100</h2>
        
        {critical.length > 0 && (
          <div className="alerts critical">
            {critical.map(alert => (
              <Alert key={alert.property} alert={alert} />
            ))}
          </div>
        )}
        
        {high.length > 0 && (
          <div className="alerts high">
            {high.map(alert => (
              <Alert key={alert.property} alert={alert} />
            ))}
          </div>
        )}
      </div>
    );
  }
}
```

---

## Performance

| Métrica | Valor |
|---------|-------|
| Tiempo/URL (single) | 2-4 segundos |
| Tiempo/URL (batch) | 1-3 segundos (paralelo) |
| Timeout | 10 segundos |
| Max URLs/batch | 100 |
| Max concurrency | 10 |
| Memory per URL | ~5MB |

---

## Documentación del Código

Cada módulo está completamente documentado:

- **schema-dictionary.js**: Comentarios sobre cada tipo de entidad
- **schema-extractor.js**: Ejemplos de @graph flattening
- **schema-validators.js**: Tabla de riesgos por tipo
- **schema-analyzer.service.js**: Flujo completo documentado

---

## Changelog

**v1.0.0** (2026-06-11)
- ✅ Extracción de 30+ tipos Schema.org
- ✅ Sistema inteligente de alertas
- ✅ Validación de propiedades anidadas
- ✅ Score de completitud (0-100)
- ✅ API single + batch
- ✅ Manejo robusto de errores

---

**Última actualización:** 2026-06-11  
**Autor:** IO Prospector Dev Team  
**Licencia:** Propietaria Iorana Digital

