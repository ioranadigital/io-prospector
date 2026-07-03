/**
 * EXTRACTOR INTELIGENTE DE SCHEMA.ORG (JSON-LD)
 * Alto rendimiento con manejo de @graph, flatten y validación de tipos
 *
 * Características:
 * - Parseo ultrarrápido con Cheerio
 * - Soporte nativo para estructuras @graph complejas
 * - Flatten automático de nodos anidados
 * - Enrutamiento por @type
 * - Manejo de errores de red y timeouts
 */

import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { ENTITY_BY_TYPE } from './entity-dictionary.js';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class SchemaExtractorPro {
  constructor(options = {}) {
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.userAgent = options.userAgent || DEFAULT_USER_AGENT;
  }

  /**
   * MÉTODO PRINCIPAL: Extraer y procesar Schema.org de una URL
   */
  async extractFromUrl(url) {
    try {
      // Validar URL
      if (!url || typeof url !== 'string') {
        throw new Error('URL inválida o vacía');
      }

      // Normalizar URL
      const normalizedUrl = this._normalizeUrl(url);

      // Fetchear HTML
      const html = await this._fetchHtml(normalizedUrl);

      // Extraer bloques JSON-LD
      const rawSchemas = this._extractJsonLdScripts(html);

      // Procesar y aplanar
      const processedSchemas = this._processSchemas(rawSchemas);

      // Determinar tipo principal
      const primaryType = this._determinePrimaryType(processedSchemas);

      return {
        url: normalizedUrl,
        primaryType,
        schemasFound: processedSchemas.map(s => s['@type']),
        extractedData: processedSchemas,
        rawCount: rawSchemas.length,
        processedCount: processedSchemas.length,
      };
    } catch (error) {
      return {
        url,
        error: error.message,
        primaryType: null,
        schemasFound: [],
        extractedData: [],
        rawCount: 0,
        processedCount: 0,
      };
    }
  }

  /**
   * Fetchear HTML con timeouts y User-Agent limpio
   */
  async _fetchHtml(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Extraer todos los bloques <script type="application/ld+json">
   */
  _extractJsonLdScripts(html) {
    const $ = cheerio.load(html);
    const scripts = [];

    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const content = $(element).html();
        if (content) {
          const parsed = JSON.parse(content);
          scripts.push(parsed);
        }
      } catch (e) {
        // Ignorar scripts malformados
      }
    });

    return scripts;
  }

  /**
   * Procesar schemas: flatten @graph y validar tipos
   */
  _processSchemas(rawSchemas) {
    const processed = [];

    rawSchemas.forEach(schema => {
      // Si es @graph, aplanar
      if (schema['@graph'] && Array.isArray(schema['@graph'])) {
        schema['@graph'].forEach(node => {
          if (this._isValidSchema(node)) {
            processed.push(this._sanitizeSchema(node));
          }
        });
      } else if (this._isValidSchema(schema)) {
        processed.push(this._sanitizeSchema(schema));
      }
    });

    return processed;
  }

  /**
   * Validar que el objeto tenga @type
   */
  _isValidSchema(obj) {
    return obj && typeof obj === 'object' && (obj['@type'] || obj.type);
  }

  /**
   * Sanitizar y normalizar schema
   */
  _sanitizeSchema(schema) {
    const sanitized = {
      '@context': schema['@context'] || 'https://schema.org',
      '@type': schema['@type'] || schema.type,
    };

    // Copiar propiedades no-estructurales
    Object.keys(schema).forEach(key => {
      if (!['@context', '@type', '@graph'].includes(key) && !key.startsWith('@')) {
        sanitized[key] = schema[key];
      }
    });

    return sanitized;
  }

  /**
   * Determinar tipo principal (el primero con definición válida)
   */
  _determinePrimaryType(schemas) {
    for (const schema of schemas) {
      const type = schema['@type'];
      if (ENTITY_BY_TYPE[type]) {
        return type;
      }
    }
    return schemas.length > 0 ? schemas[0]['@type'] : null;
  }

  /**
   * Normalizar URL
   */
  _normalizeUrl(url) {
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }
}

/**
 * Factory pattern para uso rápido
 */
export async function extractSchema(url, options = {}) {
  const extractor = new SchemaExtractorPro(options);
  return await extractor.extractFromUrl(url);
}
