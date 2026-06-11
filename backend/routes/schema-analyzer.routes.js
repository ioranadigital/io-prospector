import { Router } from 'express';
import { chromium } from 'playwright';
import { logger } from '../utils/logger.js';

const router = Router();

router.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  let browser;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const fullUrl = urlObj.toString();

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const startTime = Date.now();
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const duration = Date.now() - startTime;

    const html = await page.content();
    const schemas = extractAndValidateSchemas(html);
    const opportunities = generateOpportunities(schemas);
    const seoScore = calculateSchemaScore(schemas);

    res.json({
      url: fullUrl,
      success: true,
      loadTime: duration,
      schemasFound: schemas.length,
      schemas,
      opportunities,
      seoScore,
      analysis: generateAnalysis(schemas, opportunities),
    });
  } catch (err) {
    logger.error(`Schema analysis error for ${url}: ${err.message}`);

    const urlError =
      /ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|ENOTFOUND|ERR_TIMED_OUT|net::ERR/i.test(
        err.message
      );

    res.status(urlError ? 400 : 500).json({
      error: urlError
        ? 'No se pudo acceder a la URL. Verifica que el dominio existe y está online.'
        : 'Error al analizar el sitio. Inténtalo de nuevo.',
      message: err.message,
    });
  } finally {
    if (browser) await browser.close();
  }
});

function extractAndValidateSchemas(html) {
  const schemas = [];
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    try {
      const rawJson = match[1].trim();
      const data = JSON.parse(rawJson);

      if (data['@graph'] && Array.isArray(data['@graph'])) {
        data['@graph'].forEach(item => {
          schemas.push({
            type: item['@type'] || item.type || 'Unknown',
            isValid: true,
            data: item,
            missingFields: detectMissingFields(item),
          });
        });
      } else {
        schemas.push({
          type: data['@type'] || data.type || 'Unknown',
          isValid: true,
          data,
          missingFields: detectMissingFields(data),
        });
      }
    } catch (err) {
      schemas.push({
        type: 'Invalid JSON-LD',
        isValid: false,
        error: err.message,
        data: null,
      });
    }
  }

  return schemas;
}

function detectMissingFields(data) {
  const type = data['@type'] || data.type;

  if (type === 'LocalBusiness') {
    const required = { name: 'Nombre', telephone: 'Teléfono', address: 'Dirección' };
    const recommended = {
      image: 'Logo/Imagen',
      geo: 'Coordenadas',
      openingHoursSpecification: 'Horarios',
      priceRange: 'Rango de precios',
    };

    const missing = {};
    Object.entries(required).forEach(([field, label]) => {
      if (!data[field]) missing[field] = { label, priority: 'required' };
    });
    Object.entries(recommended).forEach(([field, label]) => {
      if (!data[field]) missing[field] = { label, priority: 'recommended' };
    });

    return missing;
  }

  if (type === 'Product') {
    const required = { name: 'Nombre', price: 'Precio' };
    const recommended = {
      description: 'Descripción',
      image: 'Imagen',
      aggregateRating: 'Rating',
      availability: 'Disponibilidad',
    };

    const missing = {};
    Object.entries(required).forEach(([field, label]) => {
      if (!data[field]) missing[field] = { label, priority: 'required' };
    });
    Object.entries(recommended).forEach(([field, label]) => {
      if (!data[field]) missing[field] = { label, priority: 'recommended' };
    });

    return missing;
  }

  if (type === 'FAQPage') {
    const missing = {};
    if (!data.mainEntity || !Array.isArray(data.mainEntity)) {
      missing.mainEntity = { label: 'Preguntas y respuestas', priority: 'required' };
    }
    return missing;
  }

  return {};
}

function generateOpportunities(schemas) {
  const opportunities = [];

  if (schemas.length === 0) {
    opportunities.push({
      severity: 'CRITICAL',
      title: 'Sin Schema.org',
      description: 'No se detectó ningún marcado JSON-LD en el sitio',
      impact: 'Pérdida de visibilidad en rich snippets, Knowledge Graph y featured snippets',
      recommendation: 'Implementa al menos LocalBusiness o Product según tu sector',
    });
    return opportunities;
  }

  schemas.forEach(schema => {
    if (!schema.isValid) {
      opportunities.push({
        severity: 'HIGH',
        title: 'JSON-LD Malformado',
        description: schema.error,
        impact: 'Google no puede procesar el schema',
        recommendation: 'Valida el JSON con https://jsonlint.com o JSON-LD Playground',
      });
      return;
    }

    const { type, data, missingFields } = schema;

    if (Object.keys(missingFields).length > 0) {
      const required = Object.values(missingFields).filter(f => f.priority === 'required');
      const recommended = Object.values(missingFields).filter(f => f.priority === 'recommended');

      opportunities.push({
        severity: required.length > 0 ? 'HIGH' : 'MEDIUM',
        title: `Campos incompletos en ${type}`,
        description: `Faltan ${Object.keys(missingFields).length} campos`,
        fields: missingFields,
        impact:
          required.length > 0
            ? 'El schema puede no procesarse correctamente'
            : 'Reduce la riqueza de los rich snippets',
        recommendation: `Agrega los campos: ${Object.values(missingFields)
          .map(f => f.label)
          .join(', ')}`,
      });
    }

    if (type === 'LocalBusiness' && !data.geo) {
      opportunities.push({
        severity: 'MEDIUM',
        title: 'Coordenadas geográficas ausentes',
        description: 'LocalBusiness sin "geo" (latitud/longitud)',
        impact: 'Reduce la precisión en búsquedas locales',
        recommendation: 'Agrega "geo": { "@type": "GeoCoordinates", "latitude": X, "longitude": Y }',
      });
    }

    if (type === 'LocalBusiness' && !data.openingHoursSpecification) {
      opportunities.push({
        severity: 'LOW',
        title: 'Horarios de apertura ausentes',
        description: 'LocalBusiness sin openingHoursSpecification',
        impact: 'Mejora el UX mostrando horarios en SERP',
        recommendation: 'Define los horarios de apertura por día de la semana',
      });
    }

    if (type === 'Product' && !data.aggregateRating) {
      opportunities.push({
        severity: 'MEDIUM',
        title: 'Sin rating de producto',
        description: 'Product schema sin aggregateRating',
        impact: 'Reduce el CTR en resultados de búsqueda',
        recommendation: 'Agrega reseñas y ratings si tienes usuarios',
      });
    }
  });

  return opportunities;
}

function calculateSchemaScore(schemas) {
  if (schemas.length === 0) return 0;

  let score = 0;
  const validSchemas = schemas.filter(s => s.isValid);

  if (validSchemas.length === 0) return 10;

  validSchemas.forEach(schema => {
    score += 50; // Base: 50 puntos por schema válido
    const missingCount = Object.keys(schema.missingFields || {}).length;
    score -= missingCount * 3; // -3 puntos por campo faltante
  });

  return Math.min(100, Math.max(0, Math.round(score)));
}

function generateAnalysis(schemas, opportunities) {
  const analysis = {
    totalSchemas: schemas.length,
    validSchemas: schemas.filter(s => s.isValid).length,
    schemaTypes: [...new Set(schemas.map(s => s.type))],
    totalOpportunities: opportunities.length,
    criticalOpportunities: opportunities.filter(o => o.severity === 'CRITICAL').length,
    highPriorityOpportunities: opportunities.filter(o => o.severity === 'HIGH').length,
  };

  const hasLocalBusiness = schemas.some(s => s.type === 'LocalBusiness');
  const hasProduct = schemas.some(s => s.type === 'Product');
  const hasFAQ = schemas.some(s => s.type === 'FAQPage');
  const localBusiness = schemas.find(s => s.type === 'LocalBusiness');

  analysis.summary = [];

  if (!hasLocalBusiness && !hasProduct && !hasFAQ) {
    analysis.summary.push('No se detectó ningún schema.org relevante');
  }

  if (hasLocalBusiness) {
    analysis.summary.push('LocalBusiness detectado (negocio local)');
  }

  if (hasProduct) {
    analysis.summary.push('Product schema detectado (e-commerce)');
  }

  if (hasFAQ) {
    analysis.summary.push('FAQPage detectado');
  }

  if (opportunities.length === 0) {
    analysis.summary.push('✅ Schema.org está completo y optimizado');
  } else if (analysis.criticalOpportunities > 0) {
    analysis.summary.push(`⚠️ ${analysis.criticalOpportunities} problema(s) crítico(s) encontrado(s)`);
  } else {
    analysis.summary.push(`💡 ${analysis.totalOpportunities} mejora(s) disponible(s)`);
  }

  // Checks de SEO Local
  analysis.seoLocalChecks = generateSEOLocalChecks(schemas);

  return analysis;
}

function generateSEOLocalChecks(schemas) {
  const localBusiness = schemas.find(s => s.type === 'LocalBusiness');
  const checks = [];

  // Check 1: Schema LocalBusiness
  checks.push({
    id: 'local.schema.business',
    label: 'Schema LocalBusiness',
    description: 'Marcado de negocio local con datos estructurados',
    status: localBusiness ? 'pass' : 'fail',
    icon: localBusiness ? '✓' : '✗',
  });

  if (localBusiness) {
    // Check 2: NAP Consistency
    const hasName = !!localBusiness.name;
    const hasAddress = !!localBusiness.address;
    const hasPhone = !!localBusiness.telephone;
    const napComplete = hasName && hasAddress && hasPhone;

    checks.push({
      id: 'local.nap.consistency',
      label: 'Consistencia NAP',
      description: 'Nombre, Dirección y Teléfono completos',
      status: napComplete ? 'pass' : hasName && hasAddress ? 'warn' : 'fail',
      icon: napComplete ? '✓' : hasName && hasAddress ? '⚠' : '✗',
      detail: `${hasName ? '✓ Nombre' : '✗ Nombre'} | ${hasAddress ? '✓ Dirección' : '✗ Dirección'} | ${hasPhone ? '✓ Teléfono' : '✗ Teléfono'}`,
    });

    // Check 3: Google Business Profile
    const sameAsArray = localBusiness.sameAs || [];
    const hasGoogleBusiness = sameAsArray.some(url =>
      typeof url === 'string' && (url.includes('google.com/maps') || url.includes('business.google.com'))
    );

    checks.push({
      id: 'local.google.mybusiness',
      label: 'Google Business Profile',
      description: 'Vinculación con Google My Business',
      status: hasGoogleBusiness ? 'pass' : 'warn',
      icon: hasGoogleBusiness ? '✓' : '⚠',
      detail: hasGoogleBusiness ? 'Vinculado a Google Business' : 'No encontrado (Agrega en sameAs)',
    });

    // Check 4: Location Pages
    const hasGeo = !!localBusiness.geo;
    checks.push({
      id: 'local.location.pages',
      label: 'Datos de Ubicación',
      description: 'Coordenadas geográficas y zona de servicio',
      status: hasGeo ? 'pass' : 'warn',
      icon: hasGeo ? '✓' : '⚠',
      detail: hasGeo ? 'Coordenadas geográficas presentes' : 'Sin coordenadas (Mejora búsquedas locales)',
    });

    // Check 5: Phone Visibility
    checks.push({
      id: 'local.phone.visible',
      label: 'Teléfono Visible',
      description: 'Número de contacto fácilmente accesible',
      status: hasPhone ? 'pass' : 'fail',
      icon: hasPhone ? '✓' : '✗',
      detail: hasPhone ? `${localBusiness.telephone}` : 'Teléfono no especificado',
    });
  } else {
    // Si no hay LocalBusiness, todos los checks fallan
    checks.push(
      {
        id: 'local.nap.consistency',
        label: 'Consistencia NAP',
        description: 'Nombre, Dirección y Teléfono completos',
        status: 'fail',
        icon: '✗',
        detail: 'Schema LocalBusiness no detectado',
      },
      {
        id: 'local.google.mybusiness',
        label: 'Google Business Profile',
        description: 'Vinculación con Google My Business',
        status: 'fail',
        icon: '✗',
        detail: 'Schema LocalBusiness no detectado',
      },
      {
        id: 'local.location.pages',
        label: 'Datos de Ubicación',
        description: 'Coordenadas geográficas y zona de servicio',
        status: 'fail',
        icon: '✗',
        detail: 'Schema LocalBusiness no detectado',
      },
      {
        id: 'local.phone.visible',
        label: 'Teléfono Visible',
        description: 'Número de contacto fácilmente accesible',
        status: 'fail',
        icon: '✗',
        detail: 'Schema LocalBusiness no detectado',
      }
    );
  }

  return checks;
}

export default router;
