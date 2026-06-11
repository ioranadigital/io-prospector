/**
 * SERVICIO COMPLETO DE ANÁLISIS SCHEMA.ORG
 * Orquestador que integra extracción, validación y generación de alertas
 */

import fetch from 'node-fetch';
import { extractJsonLdScripts, flattenSchema, extractSchemaData } from './schema-extractor.js';
import { SchemaValidator } from './schema-validators.js';
import { SCHEMA_DICTIONARY, getSchemaDefinition, getCategory } from './schema-dictionary.js';
import { logger } from '../../utils/logger.js';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 IOProspector/1.0';

export class SchemaAnalyzerService {
  constructor(options = {}) {
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.userAgent = options.userAgent || DEFAULT_USER_AGENT;
    this.validateNested = options.validateNested !== false;
  }

  /**
   * MÉTODO PRINCIPAL: Analizar URL
   * Retorna análisis completo de Schema.org en la URL
   */
  async analyzeUrl(url) {
    const startTime = Date.now();

    try {
      // 1. Validar y normalizar URL
      const normalizedUrl = this._normalizeUrl(url);

      // 2. Obtener HTML
      const html = await this._fetchHtml(normalizedUrl);

      // 3. Extraer JSON-LD
      const extractedScripts = await extractJsonLdScripts(html, normalizedUrl);

      // 4. Validar cada schema
      const analyzedSchemas = this._analyzeSchemas(extractedScripts.schemas);

      // 5. Compilar resultado
      const result = this._compileResult(normalizedUrl, analyzedSchemas, extractedScripts);

      result.executionTime = Date.now() - startTime;

      logger.info(`Schema analysis completed for ${normalizedUrl} in ${result.executionTime}ms`);
      return result;
    } catch (error) {
      logger.error(`Schema analysis failed for ${url}: ${error.message}`);
      return this._errorResult(url, error);
    }
  }

  /**
   * VALIDAR MÚLTIPLES URLS
   * Procesa un array de URLs (útil para auditoría masiva)
   */
  async analyzeUrls(urls, options = {}) {
    const concurrency = options.concurrency || 3;
    const results = [];
    const errors = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(batch.map(url => this.analyzeUrl(url)));

      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            url: batch[idx],
            error: result.reason?.message,
          });
        }
      });
    }

    return {
      results,
      errors,
      totalAnalyzed: urls.length,
      successCount: results.length,
      errorCount: errors.length,
    };
  }

  /**
   ╔════════════════════════════════════════════════════════════════════════╗
   ║                         MÉTODOS PRIVADOS                              ║
   ╚════════════════════════════════════════════════════════════════════════╝
   */

  /**
   * Normalizar URL
   */
  _normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Fetch HTML con reintentos y timeout
   */
  async _fetchHtml(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        redirect: 'follow',
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      if (!html || html.length === 0) {
        throw new Error('HTML vacío recibido');
      }

      return html;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Timeout después de ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Analizar cada schema extraído
   */
  _analyzeSchemas(schemas) {
    const analyzed = [];

    schemas.forEach(schema => {
      const definition = getSchemaDefinition(schema.type);

      // Validar
      const validator = new SchemaValidator();
      const validation = validator.validateSchema(schema.data, definition);

      // Extraer datos limpios
      const extractedData = extractSchemaData(schema.data, definition);

      analyzed.push({
        ...schema,
        definition,
        validation,
        extractedData,
        score: validation.score,
        category: getCategory(schema.type),
      });
    });

    return analyzed;
  }

  /**
   * Compilar resultado final
   */
  _compileResult(url, analyzedSchemas, extractedScripts) {
    // Identificar tipo principal (el primero válido y con definición)
    const primarySchema = analyzedSchemas.find(s => s.definition) || analyzedSchemas[0];

    // Compilar por categoría
    const byCategory = {};
    analyzedSchemas.forEach(schema => {
      const cat = schema.category || 'DESCONOCIDO';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push({
        type: schema.type,
        score: schema.score,
        isValid: schema.validation.isValid,
      });
    });

    // Recopilar todas las alertas
    const allAlerts = [];
    analyzedSchemas.forEach(schema => {
      allAlerts.push(
        ...schema.validation.alerts.map(alert => ({
          ...alert,
          schemaType: schema.type,
        }))
      );
    });

    // Alertas más críticas primero
    allAlerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Calcular scores
    const scores = {
      average: Math.round(
        analyzedSchemas.reduce((sum, s) => sum + s.score, 0) / analyzedSchemas.length || 0
      ),
      byType: Object.fromEntries(analyzedSchemas.map(s => [s.type, s.score])),
    };

    return {
      url,
      analyzedAt: new Date().toISOString(),

      // Resumen
      summary: {
        totalSchemas: analyzedSchemas.length,
        validSchemas: analyzedSchemas.filter(s => s.validation.isValid).length,
        primaryType: primarySchema?.type || 'Unknown',
        primaryScore: primarySchema?.score || 0,
      },

      // Detalles
      schemasFound: analyzedSchemas.map(s => s.type),
      schemas: analyzedSchemas.map(s => this._formatSchemaOutput(s)),

      // Alertas
      alerts: allAlerts,
      alertsSummary: {
        total: allAlerts.length,
        critical: allAlerts.filter(a => a.severity === 'CRITICAL').length,
        high: allAlerts.filter(a => a.severity === 'HIGH').length,
        medium: allAlerts.filter(a => a.severity === 'MEDIUM').length,
        low: allAlerts.filter(a => a.severity === 'LOW').length,
      },

      // Scores
      scores,
      byCategory,

      // Meta
      extractionStats: extractedScripts.stats,
      extractionErrors: extractedScripts.errors,
    };
  }

  /**
   * Formatear output de schema individual
   */
  _formatSchemaOutput(schema) {
    return {
      type: schema.type,
      category: schema.category,
      isValid: schema.validation.isValid,
      score: schema.score,
      definition: schema.definition
        ? {
            description: schema.definition.description,
            required: schema.definition.required,
            recommended: schema.definition.recommended,
            seoImpact: schema.definition.seoImpact,
          }
        : null,
      extractedData: schema.extractedData.properties,
      validation: {
        present: schema.validation.validation.present,
        missing: schema.validation.validation.missing,
        recommendedPresent: schema.validation.validation.recommended.present,
        recommendedMissing: schema.validation.validation.recommended.missing,
      },
      alerts: schema.validation.alerts,
    };
  }

  /**
   * Resultado de error
   */
  _errorResult(url, error) {
    const errorType = this._classifyError(error.message);

    return {
      url,
      success: false,
      error: error.message,
      errorType,
      analyzedAt: new Date().toISOString(),
      schemas: [],
      alerts: [
        {
          severity: 'CRITICAL',
          type: 'ANALYSIS_ERROR',
          message: `No se pudo analizar la URL: ${error.message}`,
          recommendation: this._getErrorRecommendation(errorType),
        },
      ],
      scores: {
        average: 0,
        byType: {},
      },
    };
  }

  /**
   * Clasificar tipo de error
   */
  _classifyError(message) {
    if (message.includes('404')) return 'NOT_FOUND';
    if (message.includes('Timeout') || message.includes('ETIMEDOUT'))
      return 'TIMEOUT';
    if (message.includes('ECONNREFUSED')) return 'CONNECTION_REFUSED';
    if (message.includes('DNS')) return 'DNS_ERROR';
    if (message.includes('SSL') || message.includes('CERTIFICATE'))
      return 'SSL_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * Recomendación por tipo de error
   */
  _getErrorRecommendation(errorType) {
    const recommendations = {
      NOT_FOUND: 'Verifica que la URL es correcta y el sitio está online',
      TIMEOUT: 'El sitio tardó mucho en responder, intenta más tarde',
      CONNECTION_REFUSED: 'No se pudo conectar al servidor',
      DNS_ERROR: 'El dominio no resuelve, verifica la URL',
      SSL_ERROR: 'Problema con el certificado SSL del sitio',
      UNKNOWN_ERROR: 'Error desconocido, intenta con otra URL',
    };

    return recommendations[errorType] || 'No se pudo completar el análisis';
  }
}

/**
 * EXPORTAR COMO SINGLETON
 */
export const schemaAnalyzer = new SchemaAnalyzerService();
