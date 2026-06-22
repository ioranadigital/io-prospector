/**
 * SERVICIO COMPLETO DE ANÁLISIS SCHEMA.ORG
 * Orquestador que integra extracción, validación y generación de alertas
 */

import fetch from 'node-fetch';
import { extractJsonLdScripts, flattenSchema, extractSchemaData } from './schema-extractor.js';
import { SchemaValidator } from './schema-validators.js';
import { SchemaRecommender } from './schema-recommender.js';
import { SchemaFAQGenerator } from './schema-faq-generator.js';
import { SchemaAuditEngine } from './schema-audit-engine.js';
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
   *
   * @param {string} url - URL a analizar
   * @param {Object} options - Opciones de validación cruzada
   * @param {string} options.expectedType - Tipo de schema esperado (legado, un solo tipo)
   * @param {string} options.expectedCategory - Categoría del tipo esperado (legado)
   * @param {Array} options.expectedSchemas - Array de esquemas esperados (múltiples)
   * @param {string} options.validationMode - Modo de validación (ANALYTICAL, SINGLE_TYPE_CHECK, MULTI_SCHEMA_CHECK)
   */
  async analyzeUrl(url, options = {}) {
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

      // 5. Compilar resultado (con parámetros de validación cruzada)
      const result = this._compileResult(normalizedUrl, analyzedSchemas, extractedScripts, html, options);

      result.executionTime = Date.now() - startTime;

      // 6. Agregar contexto de validación cruzada al resultado
      if (options.expectedType) {
        result.expectedType = options.expectedType;
        result.expectedCategory = options.expectedCategory;
      }
      if (options.expectedSchemas && options.expectedSchemas.length > 0) {
        result.expectedSchemas = options.expectedSchemas;
        result.validationMode = options.validationMode || 'MULTI_SCHEMA_CHECK';
      }

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
   * @param {string} url - URL analizada
   * @param {Array} analyzedSchemas - Schemas analizados
   * @param {Object} extractedScripts - Scripts extraídos
   * @param {string} html - Contenido HTML
   * @param {Object} options - Opciones de validación cruzada
   * @param {string} options.expectedType - Tipo de schema esperado para validación cruzada
   * @param {string} options.expectedCategory - Categoría del tipo esperado
   */
  _compileResult(url, analyzedSchemas, extractedScripts, html = '', options = {}) {
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

    // ═══════════════════════════════════════════════════════════════
    // VALIDACIÓN CRUZADA: Modo de múltiples esquemas (NUEVO)
    // ═══════════════════════════════════════════════════════════════
    let missingSchemas = [];
    let foundSchemas = [];

    if (options.expectedSchemas && options.expectedSchemas.length > 0) {
      // Validación de múltiples esquemas
      options.expectedSchemas.forEach((expectedSchema) => {
        const schemaFound = analyzedSchemas.some(s => s.type === expectedSchema.type);

        if (schemaFound) {
          foundSchemas.push(expectedSchema.type);
        } else {
          missingSchemas.push(expectedSchema);

          // Agregar alerta crítica para cada schema faltante
          allAlerts.unshift({
            severity: 'CRITICAL',
            type: 'MISSING_EXPECTED_SCHEMA',
            property: expectedSchema.type,
            entityType: expectedSchema.type,
            message: `Falta entidad obligatoria ${expectedSchema.type} (${expectedSchema.category}) del grafo esperado`,
            impact: 'El grafo de datos estructurados no está completo según la configuración solicitada',
            recommendation: `Implementar schema ${expectedSchema.type} en la página. Es fundamental para esta auditoría.`,
          });
        }
      });
    } else if (options.expectedType) {
      // Validación legada: un solo tipo esperado
      const expectedTypeFound = analyzedSchemas.some(s => s.type === options.expectedType);

      if (!expectedTypeFound) {
        missingSchemas.push({ type: options.expectedType, category: options.expectedCategory });
        foundSchemas = [];

        allAlerts.unshift({
          severity: 'CRITICAL',
          type: 'MISSING_EXPECTED_SCHEMA',
          property: options.expectedType,
          entityType: options.expectedType,
          message: `Falta entidad obligatoria ${options.expectedType} para la categoría seleccionada (${options.expectedCategory})`,
          impact: 'El sitio no está optimizado para esta categoría de búsqueda',
          recommendation: `Implementar schema ${options.expectedType} en la página. Es fundamental para optimizar resultados en esta categoría.`,
        });
      } else {
        foundSchemas.push(options.expectedType);
      }
    }

    // Alertas más críticas primero
    allAlerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // ═══════════════════════════════════════════════════════════════
    // CALCULAR SCORES - Con penalización según esquemas faltantes
    // ═══════════════════════════════════════════════════════════════
    let averageScore = Math.round(
      analyzedSchemas.reduce((sum, s) => sum + s.score, 0) / analyzedSchemas.length || 0
    );

    // Penalizar por esquemas faltantes
    if (missingSchemas.length > 0) {
      // Penalización: (esquemas encontrados / total esperados) * score base
      const expectedCount = options.expectedSchemas?.length || 1;
      const foundCount = foundSchemas.length;
      const completionRatio = expectedCount > 0 ? foundCount / expectedCount : 0;

      // Score penalizado: máximo 40% si faltan todos, proporcional si faltan algunos
      averageScore = Math.max(0, Math.round(averageScore * completionRatio * 0.5));
    }

    const scores = {
      average: averageScore,
      byType: Object.fromEntries(analyzedSchemas.map(s => [s.type, s.score])),
      validationMode: options.expectedSchemas?.length ? 'MULTI_SCHEMA_CHECK' : (options.expectedType ? 'SINGLE_TYPE_CHECK' : 'ANALYTICAL'),
      expectedSchemasSummary: options.expectedSchemas?.length ? {
        total: options.expectedSchemas.length,
        found: foundSchemas.length,
        missing: missingSchemas.length,
        foundSchemas,
        missingSchemas: missingSchemas.map(s => s.type),
      } : undefined,
    };

    // Obtener recomendaciones — si viene tipo manual, lo usamos directamente
    let recommendations;
    if (options.manualPageType) {
      const foundTypes = analyzedSchemas.map(s => s.type);
      const recs = SchemaRecommender._getRecommendationsByType(options.manualPageType, foundTypes);
      recommendations = {
        pageType: options.manualPageType,
        recommendations: recs,
        implementedCount: analyzedSchemas.length,
        recommendedCount: recs.length,
        completeness: Math.round((analyzedSchemas.length / (analyzedSchemas.length + recs.length || 1)) * 100),
        manual: true,
      };
    } else {
      recommendations = SchemaRecommender.recommendSchemas(url, analyzedSchemas, html);
    }

    // Generar FAQs contextuales validadas por tipología
    const faqs = SchemaFAQGenerator.generateFAQs(recommendations.pageType, url);

    // Generar auditoría técnica/semántica (usa tipo manual si viene)
    const auditPageType = options.manualPageType || recommendations.pageType;
    const audit = SchemaAuditEngine.auditUrl(url, analyzedSchemas, auditPageType);

    // Si hay tipo manual, sobreescribir la tipología detectada en el audit
    if (options.manualPageType && options.manualTipologia) {
      audit.tipologia_detectada = options.manualTipologia;
      audit.tipologia_manual = true;
    }

    return {
      url,
      analyzedAt: new Date().toISOString(),

      // ═══════════════════════════════════════════════════════════════
      // CONTEXTO DE VALIDACIÓN CRUZADA
      // ═══════════════════════════════════════════════════════════════
      validationContext: options.expectedType ? {
        mode: 'CROSS_CHECK',
        expectedType: options.expectedType,
        expectedCategory: options.expectedCategory,
        typeFound: analyzedSchemas.some(s => s.type === options.expectedType),
      } : {
        mode: 'ANALYTICAL',
      },

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

      // Recomendaciones
      recommendations,

      // FAQs generadas (validación semántica)
      faqs,

      // Auditoría técnica/semántica (Motor de Revisión)
      audit,

      // Meta
      extractionStats: extractedScripts.stats,
      extractionErrors: extractedScripts.errors,
    };
  }

  /**
   * Formatear output de schema individual
   */
  _formatSchemaOutput(schema) {
    const validation = schema.validation?.validation || {};
    return {
      type: schema.type,
      category: schema.category,
      isValid: schema.validation?.isValid || false,
      score: schema.score || 0,
      definition: schema.definition
        ? {
            description: schema.definition.description,
            required: schema.definition.required,
            recommended: schema.definition.recommended,
            seoImpact: schema.definition.seoImpact,
          }
        : null,
      extractedData: schema.extractedData?.properties || {},
      validation: {
        present: validation.present || [],
        missing: validation.missing || [],
        recommendedPresent: validation.recommended?.present || [],
        recommendedMissing: validation.recommended?.missing || [],
      },
      alerts: schema.validation?.alerts || [],
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
