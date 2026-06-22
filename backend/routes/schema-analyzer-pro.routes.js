/**
 * RUTAS DEL ANALIZADOR SCHEMA.ORG AVANZADO
 * Endpoints públicos para el servicio de análisis profesional
 */

import { Router } from 'express';
import { schemaAnalyzer } from '../services/schema/schema-analyzer.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/schema-analyzer-pro/analyze
 * Analizar una URL individual
 *
 * Body: { url: "https://ejemplo.com" }
 *
 * Response:
 * {
 *   url: "string",
 *   summary: { totalSchemas, validSchemas, primaryType, primaryScore },
 *   schemasFound: ["Type1", "Type2"],
 *   schemas: [{
 *     type, category, isValid, score,
 *     definition: { description, required, recommended, seoImpact },
 *     extractedData: { ...properties },
 *     validation: { present, missing, recommendedMissing },
 *     alerts: [{ severity, type, message, recommendation, ... }]
 *   }],
 *   alerts: [{ severity, type, message, schemaType, ... }],
 *   alertsSummary: { total, critical, high, medium, low },
 *   scores: { average, byType: {...} },
 *   byCategory: { TRANSACCIONAL: [...], CONTENIDO: [...] }
 * }
 */
router.post('/analyze', async (req, res) => {
  const { url, expectedType, expectedCategory, expectedSchemas, validationMode, manualPageType, manualTipologia } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'URL requerida',
      example: { url: 'https://ejemplo.com' },
    });
  }

  try {
    logger.info(`📊 Iniciando análisis Schema.org avanzado: ${url}`);
    if (manualPageType) {
      logger.info(`   Modo: MANUAL (tipo forzado: ${manualPageType} / ${manualTipologia})`);
    } else if (validationMode === 'MULTI_SCHEMA_CHECK' && expectedSchemas?.length) {
      logger.info(`   Modo: MULTI_SCHEMA_CHECK (${expectedSchemas.length} esquemas esperados)`);
    } else if (expectedType) {
      logger.info(`   Modo: SINGLE_TYPE_CHECK (esperado: ${expectedType})`);
    }

    // Pasar los parámetros de validación cruzada al analizador
    const result = await schemaAnalyzer.analyzeUrl(url, {
      expectedType,
      expectedCategory,
      expectedSchemas: expectedSchemas || [],
      validationMode: validationMode || 'ANALYTICAL',
      // Tipo de página forzado manualmente desde el frontend
      manualPageType,
      manualTipologia,
    });

    // Si hubo error al analizar
    if (!result.success === false) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error(`Error in schema-analyzer-pro: ${error.message}`);
    res.status(500).json({
      error: 'Error al analizar el esquema',
      message: error.message,
    });
  }
});

/**
 * POST /api/schema-analyzer-pro/analyze-batch
 * Analizar múltiples URLs (lote)
 *
 * Body: {
 *   urls: ["https://url1.com", "https://url2.com"],
 *   concurrency: 3 (opcional)
 * }
 */
router.post('/analyze-batch', async (req, res) => {
  const { urls, concurrency } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({
      error: 'Array de URLs requerido',
      example: { urls: ['https://ejemplo1.com', 'https://ejemplo2.com'] },
    });
  }

  if (urls.length > 100) {
    return res.status(400).json({
      error: 'Máximo 100 URLs por lote',
      provided: urls.length,
    });
  }

  try {
    logger.info(`📊 Iniciando análisis en lote: ${urls.length} URLs`);
    const startTime = Date.now();

    const results = await schemaAnalyzer.analyzeUrls(urls, { concurrency });

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      batchStats: {
        totalRequested: urls.length,
        successCount: results.successCount,
        errorCount: results.errorCount,
        durationMs: duration,
        avgTimePerUrl: Math.round(duration / urls.length),
      },
      results: results.results,
      errors: results.errors,
    });
  } catch (error) {
    logger.error(`Error in batch analysis: ${error.message}`);
    res.status(500).json({
      error: 'Error al analizar el lote',
      message: error.message,
    });
  }
});

/**
 * POST /api/schema-analyzer-pro/health-check
 * Verificar que el servicio está disponible
 */
router.post('/health-check', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.json({
      status: 'ok',
      service: 'schema-analyzer-pro',
      message: 'Servicio disponible',
    });
  }

  // Hacer un análisis rápido para verificar
  try {
    const result = await schemaAnalyzer.analyzeUrl(url);
    res.json({
      status: result.error ? 'degraded' : 'ok',
      service: 'schema-analyzer-pro',
      url,
      schemasFound: result.schemas?.length || 0,
      executionTime: result.executionTime,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'schema-analyzer-pro',
      message: error.message,
    });
  }
});

export default router;
