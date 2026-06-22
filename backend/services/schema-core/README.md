# Schema.org Core - Extractor & Validator Pro

**Sistema experto de extracción y validación de Schema.org (JSON-LD) con análisis jerárquico completo de 50+ entidades Schema.org**

## 📋 Características

✅ **Extracción Inteligente**
- Parseo ultrarrápido con Cheerio
- Soporte nativo para `@graph` (aplana automáticamente)
- Manejo de múltiples schemas por página
- Normalización y sanitización de datos

✅ **Validación Jerárquica**
- 50+ tipos de entidades Schema.org mapeados
- Validación de propiedades requeridas y recomendadas
- Detección automática de entidad principal
- Soporte de jerarquía Thing → CreativeWork → Article

✅ **Sistema de Alertas Técnicas**
- 30+ patrones de validación SEO/GEO
- Detección de riesgos E-E-A-T (Expertise, Authoritativeness, Trustworthiness)
- Validación NAP (Name, Address, Phone) para LocalBusiness
- Alertas YMYL para sectores críticos (Médico, Financiero)
- Categorización por severidad (CRITICAL, HIGH, MEDIUM, LOW)

✅ **Soporte Completo de Entidades**

| Rama | Tipos | Ejemplos |
|------|-------|----------|
| **Article** | 6+ | Article, BlogPosting, NewsArticle, TechArticle, APIReference, MedicalWebPage |
| **WebPage** | 8+ | WebPage, AboutPage, ContactPage, CollectionPage, ProfilePage, SearchResultsPage |
| **IA Magnets** | 8+ | FAQPage, HowTo, Recipe, Review, AggregateRating, QAPage, JobPosting, Course |
| **MediaObject** | 4+ | VideoObject, ImageObject, AudioObject |
| **Organization** | 6+ | Organization, Corporation, EducationalOrganization, LocalBusiness, Restaurant, Store, ProfessionalService, MedicalBusiness |
| **Product** | 3+ | Product, ProductGroup, Offer, AggregateOffer |
| **Estructural** | 4+ | BreadcrumbList, WebSite, Person, Event |

## 🏗️ Arquitectura de Archivos

```
backend/services/schema-core/
├── entity-dictionary.js          [Diccionario jerárquico de 50+ entidades]
├── schema-extractor-pro.js       [Extractor inteligente + @graph flatten]
├── alert-generator.js            [Sistema de alertas técnicas SEO/GEO]
├── schema-processor.js           [Orquestador principal]
├── index.js                      [Punto de entrada único]
└── README.md                     [Esta documentación]
```

## 🚀 Uso Rápido

### 1. Procesamiento de URL Individual

```javascript
import { processSchemaUrl } from './services/schema-core/index.js';

const result = await processSchemaUrl('https://ejemplo.com/producto');

// Resultado:
{
  url: "https://ejemplo.com/producto",
  primaryType: "Product",           // Tipo principal detectado
  schemasFound: ["Product", "BreadcrumbList", "Organization"],
  isValid: false,                    // Tiene alertas críticas
  extractedData: [                   // Schemas extraídos y limpios
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "...",
      "image": "...",
      ...
    }
  ],
  alerts: [                          // Array de alertas
    {
      severity: "CRITICAL",
      type: "MISSING_REQUIRED_PROPERTY",
      property: "offers",
      entityType: "Product",
      message: "Falta propiedad requerida: 'offers' en Product",
      impact: "No aparece en Google Shopping",
      recommendation: "Estructura offers con price, priceCurrency (EUR), availability..."
    },
    ...
  ],
  summary: {
    totalSchemas: 3,
    totalAlerts: 5,
    criticalAlerts: 1,
    highAlerts: 2,
    mediumAlerts: 2,
    lowAlerts: 0
  }
}
```

### 2. Procesamiento en Batch

```javascript
import { processSchemaBatch } from './services/schema-core/index.js';

const result = await processSchemaBatch(
  [
    'https://ejemplo.com/producto1',
    'https://ejemplo.com/producto2',
    'https://ejemplo.com/blog/articulo'
  ],
  { concurrency: 3 }  // Procesar 3 URLs en paralelo
);

// Resultado:
{
  processed: 3,
  successful: 3,
  failed: 0,
  results: [...],      // Array de resultados individuales
  errors: []
}
```

### 3. Extracción Pura (sin validación)

```javascript
import { extractSchema } from './services/schema-core/index.js';

const result = await extractSchema('https://ejemplo.com');

// Resultado:
{
  url: "https://ejemplo.com",
  primaryType: "WebPage",
  schemasFound: ["WebPage", "Organization", "WebSite"],
  extractedData: [...],
  rawCount: 3,
  processedCount: 3
}
```

### 4. Validación Manual de Schema

```javascript
import { AlertGenerator, getEntityConfig } from './services/schema-core/index.js';

const productSchema = {
  "@type": "Product",
  "name": "Producto XYZ",
  "image": "https://..."
  // Falta: offers
};

const alerts = AlertGenerator.generateAlerts(productSchema, 'Product');

// Resultado: Array con alertas sobre propiedades faltantes
[
  {
    severity: "CRITICAL",
    type: "MISSING_REQUIRED_PROPERTY",
    property: "offers",
    message: "Falta propiedad requerida: 'offers' en Product",
    ...
  }
]
```

## 📊 Sistema de Alertas

### Severidades

| Nivel | Descripción | Acción |
|-------|-------------|--------|
| **CRITICAL** | Bloquea indexación o genera errores | ⛔ Arreglar ya |
| **HIGH** | Reduce visibilidad SEO | ⚠️ Arreglar pronto |
| **MEDIUM** | Mejora potencial | 💡 Considerar |
| **LOW** | Información complementaria | ℹ️ Opcional |

### Tipos de Alertas

- `MISSING_REQUIRED_PROPERTY` - Propiedad obligatoria ausente
- `MISSING_RECOMMENDED_PROPERTY` - Propiedad recomendada ausente
- `EEAT_RISK_*` - Riesgos de E-E-A-T (Expertise, Authoritativeness, Trustworthiness)
- `NAP_CONSISTENCY_*` - Inconsistencias Name/Address/Phone
- `GEO_MISSING` - Falta geolocalización
- `PRODUCT_*` - Específicos de Product
- `ARTICLE_*` - Específicos de Article
- `FAQ_*` - Específicos de FAQPage
- `HOWTO_*` - Específicos de HowTo
- `EXTRACTION_ERROR` - Error de red/parseo
- `PROCESSING_ERROR` - Error no controlado

## 🔧 Configuración

```javascript
// Opciones por defecto
const options = {
  timeout: 10000,                    // Timeout de request (ms)
  userAgent: 'Mozilla/5.0...',       // User-Agent para simulación de bot
  concurrency: 5                     // Concurrencia en batch
};

const processor = new SchemaProcessor(options);
```

## 📚 Diccionario de Entidades

Cada entidad en el diccionario incluye:

```javascript
{
  hierarchy: 'CreativeWork -> Article',  // Ruta jerárquica
  description: '...',                    // Descripción
  required: ['prop1', 'prop2'],          // Propiedades obligatorias
  recommended: ['prop3'],                // Propiedades recomendadas
  eeatRisk: true,                        // ¿Requiere E-E-A-T?
  napConsistency: true,                  // ¿Validar NAP?
  seoCategory: 'CONTENIDO',              // Categoría SEO
  seoImpact: 'MUY ALTO - ...'            // Impacto en SEO
}
```

### Acceso al Diccionario

```javascript
import { getEntityConfig, requiresEEAT, requiresNAP } from './services/schema-core/index.js';

// Obtener configuración
const productConfig = getEntityConfig('Product');

// Validaciones rápidas
if (requiresEEAT('BlogPosting')) { ... }   // ¿Requiere E-E-A-T?
if (requiresNAP('LocalBusiness')) { ... }  // ¿Requiere NAP?
```

## 🎯 Casos de Uso

### 1. Auditoría SEO Técnica
```javascript
const audit = await processSchemaUrl(url);
if (!audit.isValid) {
  console.log(`⚠️ ${audit.summary.criticalAlerts} alertas críticas`);
}
```

### 2. Validación de Implementación
```javascript
const audit = await processSchemaUrl(url);
audit.alerts.forEach(alert => {
  if (alert.severity === 'CRITICAL') {
    console.error(`❌ ${alert.message}`);
    console.log(`   Recomendación: ${alert.recommendation}`);
  }
});
```

### 3. Monitoreo Masivo
```javascript
const batch = await processSchemaBatch(thousandUrls, { concurrency: 10 });
const failingUrls = batch.results.filter(r => r.summary.criticalAlerts > 0);
console.log(`⚠️ ${failingUrls.length} URLs con problemas críticos`);
```

## 🌍 Soporte de @graph Complejos

El extractor maneja automáticamente:

```javascript
// ✅ Objeto único
{"@type": "Product", "name": "..."}

// ✅ Array de objetos
[{"@type": "Product"}, {"@type": "Review"}]

// ✅ Estructura @graph (aplana automáticamente)
{
  "@graph": [
    {"@type": "Product", ...},
    {"@type": "AggregateRating", ...}
  ]
}
```

## 🔐 Manejo de Errores

```javascript
const result = await processSchemaUrl('https://invalid.url');

if (result.alerts.some(a => a.type === 'EXTRACTION_ERROR')) {
  console.error('Error de extracción:', result.alerts[0].message);
}
```

## 📈 Performance

- ⚡ Extracción single: ~200-800ms
- ⚡ Batch (10 URLs, concurrency=5): ~2-4 segundos
- 📊 Memory footprint: ~5MB por URL
- 🔄 Manejo de timeout: 10 segundos por default

## 🤝 Integración con io-Prospector

Este módulo se integra con:

1. **Backend Analytics** - Auditoría de URLs de clientes
2. **Frontend Audit UI** - Mostrar alertas técnicas
3. **Email Reports** - Incluir resumen de schemas
4. **Database** - Guardar histórico de auditorías

---

**Versión:** 1.0.0  
**Última actualización:** 2026-06-11  
**Status:** ✅ Producción-ready
