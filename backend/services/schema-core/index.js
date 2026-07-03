/**
 * SCHEMA-CORE: Índice de Exportación
 * Punto de entrada único para todos los componentes del sistema de análisis Schema.org
 */

export { SchemaExtractorPro, extractSchema } from './schema-extractor-pro.js';

export { AlertGenerator, generateSchemaAlerts } from './alert-generator.js';

export { SchemaProcessor, processSchemaUrl, processSchemaBatch } from './schema-processor.js';

export {
  ENTITY_DICTIONARY,
  ENTITY_BY_TYPE,
  CATEGORIES,
  getEntityConfig,
  requiresEEAT,
  requiresNAP,
} from './entity-dictionary.js';
