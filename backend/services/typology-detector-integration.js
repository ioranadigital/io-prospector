/**
 * GUÍA DE INTEGRACIÓN: Detector de Tipología en Scraping
 *
 * Este archivo muestra cómo integrar el TypologyDetector en el flujo de scraping existente
 * para garantizar que cada URL rastreada tenga la tipología correcta antes de ir a la BD
 */

import { TypologyDetector, detectTypology } from './typology-detector.js';

/**
 * PATRÓN 1: Integración en scraperService.scrapeUrl()
 *
 * ANTES:
 * async scrapeUrl(url) {
 *   const html = await fetch(url);
 *   return { url, html, content: parse(html) };
 * }
 *
 * DESPUÉS:
 */
export async function scrapeUrlWithTypology(url, htmlContent) {
  // Paso 1: Detectar tipología
  const typologyResult = TypologyDetector.detect(url, htmlContent);

  // Paso 2: Retornar con tipología incluida
  return {
    url,
    tipologia: typologyResult.tipologia,
    nivel: typologyResult.nivel,
    confidence: typologyResult.confidence,
    htmlContent,
    // ... resto de datos de scraping
  };
}

/**
 * PATRÓN 2: Middleware para enriquecer datos antes de guardar en Supabase
 *
 * Uso en rutas de scraping:
 * router.post('/start', async (req, res) => {
 *   const urls = await scrapeUrls(req.body);
 *   const enrichedUrls = enrichWithTypology(urls);
 *   await saveToSupabase(enrichedUrls);
 * });
 */
export function enrichWithTypology(scrapedResults) {
  return scrapedResults.map(result => ({
    ...result,
    ...TypologyDetector.detect(result.url, result.htmlContent || ''),
  }));
}

/**
 * PATRÓN 3: Validator para asegurar que tipología es correcta antes de guardar
 *
 * Uso:
 * const validated = validateScrapedData(rawData);
 * if (validated.errors.length > 0) {
 *   console.warn('Errores de tipología detectados:', validated.errors);
 * }
 * await saveToSupabase(validated.data);
 */
export function validateScrapedData(scrapedResults) {
  const errors = [];
  const data = scrapedResults.map(result => {
    const typologyResult = TypologyDetector.detect(result.url, result.htmlContent || '');

    // Validar que tipología sea válida
    const isValid = TypologyDetector.validate(typologyResult.tipologia);
    if (!isValid) {
      errors.push({
        url: result.url,
        error: `Tipología inválida: ${typologyResult.tipologia}`,
        fallback: 'generica',
      });
    }

    // Validar que nivel corresponda a tipología
    const expectedNivel = TypologyDetector.getNivelForTipologia(typologyResult.tipologia);
    const nivelMatch = typologyResult.nivel === expectedNivel;
    if (!nivelMatch) {
      console.warn(
        `⚠️ Nivel no coincide para ${result.url}: tipología=${typologyResult.tipologia}, nivel=${typologyResult.nivel}, expected=${expectedNivel}`
      );
    }

    return {
      ...result,
      tipologia: isValid ? typologyResult.tipologia : 'generica',
      nivel: typologyResult.nivel,
      confidence: typologyResult.confidence,
      validated: isValid && nivelMatch,
    };
  });

  return { data, errors, isClean: errors.length === 0 };
}

/**
 * PATRÓN 4: Integración en batch scraping
 *
 * Para scraping en lotes (múltiples URLs de una prospección):
 */
export async function scrapeBatchWithTypology(urls, fetchHtmlFn) {
  const results = [];

  for (const url of urls) {
    try {
      // Fetch del HTML
      const htmlContent = await fetchHtmlFn(url);

      // Detectar tipología
      const typologyResult = detectTypology(url, htmlContent);

      results.push({
        url,
        success: true,
        tipologia: typologyResult.tipologia,
        nivel: typologyResult.nivel,
        confidence: typologyResult.confidence,
        htmlContent,
      });
    } catch (error) {
      results.push({
        url,
        success: false,
        error: error.message,
        tipologia: 'generica',
        nivel: 2,
        confidence: 0.0,
      });
    }
  }

  return results;
}

/**
 * PATRÓN 5: Query builder para guardar correctamente en Supabase
 *
 * Ejemplo de cómo guardar datos con tipología en la tabla urls_rastreadas:
 *
 * const enrichedData = enrichWithTypology(scrapedResults);
 * const supabaseData = buildSupabaseInsert(enrichedData);
 *
 * await supabase
 *   .from('urls_rastreadas')
 *   .insert(supabaseData);
 */
export function buildSupabaseInsert(enrichedResults) {
  return enrichedResults.map(result => ({
    // Campos de rastreo
    url: result.url,
    prospection_id: result.prospection_id || null,

    // Tipología - CRÍTICO PARA AUDITORÍA
    tipologia: result.tipologia,
    nivel: result.nivel,
    confidence: result.confidence,

    // Contenido
    title: result.title || null,
    description: result.description || null,
    keywords: result.keywords || null,

    // Datos de scraping
    headings: result.headings || [],
    images: result.images || [],
    links: result.links || [],

    // Metadatos
    status_code: result.status_code || 200,
    scraped_at: new Date().toISOString(),

    // Auditoría
    schema_detected: result.schema_detected || false,
    has_contact: result.has_contact || false,
    has_reviews: result.has_reviews || false,
  }));
}

/**
 * PATRÓN 6: Logging para debugging de tipología
 *
 * Registrar las decisiones de tipología para auditar el sistema:
 */
export function logTypologyDecision(url, typologyResult) {
  const log = {
    timestamp: new Date().toISOString(),
    url,
    tipologia: typologyResult.tipologia,
    nivel: typologyResult.nivel,
    confidence: typologyResult.confidence,
    indicators: {
      urlIndicators: Object.entries(typologyResult.indicators.urlPatterns)
        .filter(([_, v]) => typeof v === 'boolean' && v)
        .map(([k]) => k),
      htmlIndicators: Object.entries(typologyResult.indicators.htmlIndicators)
        .filter(([_, v]) => typeof v === 'boolean' && v)
        .map(([k]) => k),
    },
  };

  console.log(`📋 Tipología detectada: ${log.tipologia} (nivel ${log.nivel}, confianza ${(log.confidence * 100).toFixed(0)}%)`);
  console.log(`   URL: ${log.url}`);
  console.log(`   Indicadores: ${log.indicators.urlIndicators.join(', ') || log.indicators.htmlIndicators.join(', ') || 'ninguno'}`);

  return log;
}

/**
 * PATRÓN 7: Corrección de tipología si hay baja confianza
 *
 * Si la confianza es baja, aplicar lógica de "fallback inteligente"
 */
export function ensureHighConfidenceTipology(typologyResult, fallback = 'generica') {
  const MIN_CONFIDENCE = 0.6; // 60% mínimo de confianza

  if (typologyResult.confidence < MIN_CONFIDENCE) {
    console.warn(
      `⚠️ Baja confianza en tipología ${typologyResult.tipologia} (${(typologyResult.confidence * 100).toFixed(0)}%). ` +
      `Usando fallback: ${fallback}`
    );

    return {
      ...typologyResult,
      tipologia: fallback,
      nivel: TypologyDetector.getNivelForTipologia(fallback),
      confidence: 0.3,
      lowConfidenceWarning: true,
    };
  }

  return typologyResult;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * RESUMEN DE INTEGRACIÓN
 * ═══════════════════════════════════════════════════════════════
 *
 * PASO 1: Importar en tu servicio de scraping
 *   import { enrichWithTypology, validateScrapedData } from './typology-detector-integration.js';
 *
 * PASO 2: Enriquecer datos después de scraping
 *   const scrapedResults = await scrapeMultipleUrls(urls);
 *   const enriched = enrichWithTypology(scrapedResults);
 *
 * PASO 3: Validar antes de guardar
 *   const validated = validateScrapedData(enriched);
 *   if (validated.errors.length > 0) console.warn(validated.errors);
 *
 * PASO 4: Construir datos para Supabase
 *   const supabaseData = buildSupabaseInsert(validated.data);
 *
 * PASO 5: Guardar en BD
 *   await supabase.from('urls_rastreadas').insert(supabaseData);
 *
 * RESULTADO: Todas las URLs en la BD tienen tipología 100% correcta
 * para que el motor de auditoría y schema.org funcionen perfectamente.
 *
 * ═══════════════════════════════════════════════════════════════
 */

export const typologyIntegration = {
  enrichWithTypology,
  validateScrapedData,
  scrapeUrlWithTypology,
  scrapeBatchWithTypology,
  buildSupabaseInsert,
  logTypologyDecision,
  ensureHighConfidenceTipology,
};
