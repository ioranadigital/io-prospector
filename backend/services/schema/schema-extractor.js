import { load } from 'cheerio';
import { logger } from '../../utils/logger.js';

/**
 * EXTRACTOR DE JSON-LD
 * Extrae todos los scripts de tipo "application/ld+json" del HTML
 * Maneja @graph anidado, arrays, y múltiples estructuras
 */

export async function extractJsonLdScripts(html, url) {
  const results = {
    schemas: [],
    errors: [],
    stats: {
      totalScripts: 0,
      validScripts: 0,
      invalidScripts: 0,
    },
  };

  try {
    const $ = load(html, { decodeEntities: false });

    // Encontrar todos los scripts de tipo application/ld+json
    const scripts = $('script[type="application/ld+json"]');
    results.stats.totalScripts = scripts.length;

    if (scripts.length === 0) {
      logger.debug(`No JSON-LD found in ${url}`);
      return results;
    }

    scripts.each((index, el) => {
      const content = $(el).html();

      if (!content || content.trim() === '') {
        results.stats.invalidScripts++;
        results.errors.push({
          index,
          error: 'Script vacío',
        });
        return;
      }

      try {
        const parsed = JSON.parse(content);
        const flattened = flattenSchema(parsed);

        // Cada objeto en flattened es un schema independiente
        flattened.forEach((schema, idx) => {
          results.schemas.push({
            index,
            subIndex: idx,
            type: schema['@type'] || schema.type || 'Unknown',
            isValid: true,
            data: schema,
            raw: content,
          });
        });

        results.stats.validScripts++;
      } catch (parseError) {
        results.stats.invalidScripts++;
        results.errors.push({
          index,
          error: parseError.message,
          content: content.substring(0, 100),
        });
      }
    });

    logger.debug(
      `Extracted ${results.stats.validScripts}/${results.stats.totalScripts} JSON-LD scripts from ${url}`
    );
  } catch (err) {
    logger.error(`Error extracting JSON-LD from ${url}: ${err.message}`);
    results.errors.push({
      error: 'Error al parsear HTML',
      message: err.message,
    });
  }

  return results;
}

/**
 * APLANADOR DE @graph
 * Convierte estructuras anidadas en objetos planos
 *
 * Ejemplo:
 *   Input:  { "@graph": [{ @type: "Article", ... }, { @type: "BreadcrumbList", ... }] }
 *   Output: [{ @type: "Article", ... }, { @type: "BreadcrumbList", ... }]
 *
 *   Input:  { @type: "Product", ... }
 *   Output: [{ @type: "Product", ... }]
 *
 *   Input:  [{ @type: "Schema1", ... }, { @type: "Schema2", ... }]
 *   Output: [{ @type: "Schema1", ... }, { @type: "Schema2", ... }]
 */
export function flattenSchema(schema) {
  // Si es null o undefined
  if (!schema) return [];

  // Si es un array de schemas
  if (Array.isArray(schema)) {
    return schema.flatMap(item => flattenSchema(item));
  }

  // Si tiene @graph (estructura anidada)
  if (schema['@graph']) {
    const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [schema['@graph']];
    const context = schema['@context'];

    return graph.map(item => ({
      ...item,
      '@context': item['@context'] || context || 'https://schema.org',
    }));
  }

  // Si es un objeto único
  if (typeof schema === 'object') {
    return [schema];
  }

  // Si es un string (debería haber fallado antes)
  return [];
}

/**
 * EXTRACTOR INTELIGENTE DE VALORES ANIDADOS
 * Busca valores en objetos anidados sin conocer la estructura exacta
 */
export function extractNestedValue(obj, key) {
  if (!obj || typeof obj !== 'object') return null;

  // Búsqueda directa
  if (obj[key]) {
    return obj[key];
  }

  // Búsqueda recursiva en objetos anidados
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) {
      // Si el valor es un array, busca en cada elemento
      if (Array.isArray(v)) {
        for (const item of v) {
          const found = extractNestedValue(item, key);
          if (found) return found;
        }
      } else {
        const found = extractNestedValue(v, key);
        if (found) return found;
      }
    }
  }

  return null;
}

/**
 * VALIDADOR DE PROPIEDADES
 * Verifica si un objeto tiene las propiedades requeridas
 */
export function validateProperties(obj, requiredProps, recommendedProps = []) {
  const result = {
    present: [],
    missing: [],
    recommended: {
      present: [],
      missing: [],
    },
  };

  // Validar requeridas
  requiredProps.forEach(prop => {
    const value = extractNestedValue(obj, prop);
    if (value) {
      result.present.push(prop);
    } else {
      result.missing.push(prop);
    }
  });

  // Validar recomendadas
  recommendedProps.forEach(prop => {
    const value = extractNestedValue(obj, prop);
    if (value) {
      result.recommended.present.push(prop);
    } else {
      result.recommended.missing.push(prop);
    }
  });

  return result;
}

/**
 * EXTRAER VALORES CLAVE DE SCHEMA
 * Retorna un objeto limpio con los campos más importantes
 */
export function extractSchemaData(schema, definition) {
  const extracted = {
    type: schema['@type'] || schema.type,
    properties: {},
  };

  if (!definition) {
    return extracted;
  }

  // Extraer propiedades requeridas
  if (Array.isArray(definition.required)) {
    definition.required.forEach(prop => {
      const value = extractNestedValue(schema, prop);
      if (value) {
        extracted.properties[prop] = value;
      }
    });
  }

  // Extraer propiedades recomendadas (si existen)
  if (Array.isArray(definition.recommended)) {
    definition.recommended.forEach(prop => {
      const value = extractNestedValue(schema, prop);
      if (value) {
        extracted.properties[prop] = value;
      }
    });
  }

  // Datos adicionales (primeros 5 campos no listados)
  const listedProps = new Set([
    ...(Array.isArray(definition.required) ? definition.required : []),
    ...(Array.isArray(definition.recommended) ? definition.recommended : []),
    '@context',
    '@type',
    'type',
  ]);

  let additionalCount = 0;
  for (const [key, value] of Object.entries(schema)) {
    if (!listedProps.has(key) && additionalCount < 5) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        extracted.properties[key] = value;
        additionalCount++;
      }
    }
  }

  return extracted;
}
