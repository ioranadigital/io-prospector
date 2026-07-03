/**
 * ORQUESTADOR PRINCIPAL: Schema.org Processor
 * Integra extractor, validador y generador de alertas
 * Devuelve JSON tipado listo para consumir
 */

import { SchemaExtractorPro } from './schema-extractor-pro.js';
import { AlertGenerator } from './alert-generator.js';
import { getEntityConfig } from './entity-dictionary.js';

export class SchemaProcessor {
  constructor(options = {}) {
    this.extractor = new SchemaExtractorPro(options);
  }

  /**
   * MÉTODO PÚBLICO: Procesar URL y devolver informe completo
   */
  async processUrl(url) {
    try {
      // 1. Extraer schemas
      const extractionResult = await this.extractor.extractFromUrl(url);

      if (extractionResult.error) {
        return {
          url,
          primaryType: null,
          schemasFound: [],
          isValid: false,
          extractedData: [],
          alerts: [
            {
              severity: 'CRITICAL',
              type: 'EXTRACTION_ERROR',
              message: extractionResult.error,
              impact: 'No se pudo analizar la URL',
              recommendation: 'Verifica que la URL sea válida y accesible',
            },
          ],
        };
      }

      // 2. Generar alertas para cada schema
      const allAlerts = [];
      extractionResult.extractedData.forEach(schema => {
        const entityType = schema['@type'];
        const config = getEntityConfig(entityType);

        if (config) {
          const schemaAlerts = AlertGenerator.generateAlerts(schema, entityType);
          allAlerts.push(...schemaAlerts);
        }
      });

      // 3. Determinar si es válido (sin alertas críticas)
      const criticalAlerts = allAlerts.filter(a => a.severity === 'CRITICAL');
      const isValid = criticalAlerts.length === 0 && extractionResult.schemasFound.length > 0;

      // 4. Retornar respuesta tipada
      return {
        url: extractionResult.url,
        primaryType: extractionResult.primaryType,
        schemasFound: extractionResult.schemasFound,
        isValid,
        extractedData: extractionResult.extractedData,
        alerts: allAlerts.sort((a, b) => {
          const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        summary: {
          totalSchemas: extractionResult.extractedData.length,
          totalAlerts: allAlerts.length,
          criticalAlerts: criticalAlerts.length,
          highAlerts: allAlerts.filter(a => a.severity === 'HIGH').length,
          mediumAlerts: allAlerts.filter(a => a.severity === 'MEDIUM').length,
          lowAlerts: allAlerts.filter(a => a.severity === 'LOW').length,
        },
      };
    } catch (error) {
      return {
        url,
        primaryType: null,
        schemasFound: [],
        isValid: false,
        extractedData: [],
        alerts: [
          {
            severity: 'CRITICAL',
            type: 'PROCESSING_ERROR',
            message: error.message,
            impact: 'Error no controlado durante el procesamiento',
            recommendation: 'Intenta de nuevo más tarde',
          },
        ],
      };
    }
  }

  /**
   * Procesar múltiples URLs en paralelo (batch)
   */
  async processBatch(urls, concurrency = 5) {
    const results = [];
    const errors = [];

    // Procesar en lotes de concurrency
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(url =>
          this.processUrl(url).catch(error => ({
            url,
            error: error.message,
            primaryType: null,
            schemasFound: [],
            isValid: false,
            extractedData: [],
            alerts: [],
          }))
        )
      );

      results.push(...batchResults);

      // Recolectar errores
      batchResults.forEach(result => {
        if (result.error) {
          errors.push({
            url: result.url,
            error: result.error,
          });
        }
      });
    }

    return {
      processed: urls.length,
      successful: results.filter(r => !r.error).length,
      failed: errors.length,
      results,
      errors,
    };
  }
}

/**
 * Factory para uso rápido
 */
export async function processSchemaUrl(url, options = {}) {
  const processor = new SchemaProcessor(options);
  return await processor.processUrl(url);
}

/**
 * Factory para batch
 */
export async function processSchemaBatch(urls, options = {}) {
  const processor = new SchemaProcessor(options);
  return await processor.processBatch(urls, options.concurrency || 5);
}
