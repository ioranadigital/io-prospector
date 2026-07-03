import { SCHEMA_DICTIONARY, RISK_LEVELS } from './schema-dictionary.js';
import { validateProperties, extractNestedValue } from './schema-extractor.js';

/**
 * GENERADOR DE ALERTAS
 * Valida esquemas contra su definición y genera alertas contextualizadas
 */

export class SchemaValidator {
  constructor() {
    this.alerts = [];
  }

  /**
   * Validar un schema completo
   */
  validateSchema(schema, definition) {
    this.alerts = [];

    if (!definition) {
      return {
        isValid: true,
        alerts: [],
        score: 50, // Sin definición, score neutral
      };
    }

    const validation = validateProperties(schema, definition.required, definition.recommended);

    // Generar alertas por propiedades faltantes
    this._generateMissingPropertyAlerts(schema, definition, validation);

    // Validaciones específicas por tipo
    this._runTypeSpecificValidations(schema, definition);

    // Calcular score
    const score = this._calculateScore(definition, validation);

    return {
      isValid: validation.missing.length === 0,
      score,
      alerts: this.alerts,
      validation,
    };
  }

  /**
   * Generar alertas por propiedades faltantes
   */
  _generateMissingPropertyAlerts(schema, definition, validation) {
    const type = schema['@type'] || schema.type;

    // Propiedades REQUERIDAS faltantes
    validation.missing.forEach(prop => {
      const risk = this._calculatePropertyRisk(type, prop, true);

      this.alerts.push({
        type: 'MISSING_REQUIRED',
        severity: risk.level,
        property: prop,
        message: `Falta propiedad obligatoria: '${prop}'`,
        impact: risk.impact,
        recommendation: risk.recommendation,
        seoCategory: definition.category,
      });
    });

    // Propiedades RECOMENDADAS faltantes
    validation.recommended.missing.forEach(prop => {
      const risk = this._calculatePropertyRisk(type, prop, false);

      this.alerts.push({
        type: 'MISSING_RECOMMENDED',
        severity: risk.level,
        property: prop,
        message: `Falta propiedad recomendada: '${prop}'`,
        impact: risk.impact,
        recommendation: risk.recommendation,
        seoCategory: definition.category,
      });
    });
  }

  /**
   * Cálculo de riesgo por propiedad y tipo
   */
  _calculatePropertyRisk(type, property, isRequired) {
    // Tabla de riesgos específicos
    const riskMap = {
      // ═══════ PRODUCT
      Product: {
        offers: { level: 'CRITICAL', impact: 'No aparece en Google Shopping' },
        price: { level: 'CRITICAL', impact: 'No se muestra precio' },
        image: { level: 'HIGH', impact: 'Sin imagen en SERP' },
        aggregateRating: { level: 'MEDIUM', impact: 'Sin estrellas de rating' },
        brand: { level: 'MEDIUM', impact: 'Marca no especificada' },
      },

      // ═══════ ARTICLE / BLOGPOSTING
      Article: {
        dateModified: { level: 'HIGH', impact: 'Riesgo de E-E-A-T / Frescura' },
        author: { level: 'HIGH', impact: 'Falta autoría (E-E-A-T)' },
        datePublished: { level: 'CRITICAL', impact: 'No se conoce fecha de publicación' },
        publisher: { level: 'MEDIUM', impact: 'Falta contexto editorial' },
      },

      BlogPosting: {
        dateModified: { level: 'HIGH', impact: 'Riesgo de E-E-A-T / Frescura' },
        author: { level: 'HIGH', impact: 'Falta autoría (E-E-A-T)' },
        datePublished: { level: 'CRITICAL', impact: 'No se conoce fecha de publicación' },
      },

      NewsArticle: {
        author: { level: 'CRITICAL', impact: 'Requerido para Google News' },
        datePublished: { level: 'CRITICAL', impact: 'Requerido para Google News' },
      },

      // ═══════ LOCALBUSINESS
      LocalBusiness: {
        address: { level: 'CRITICAL', impact: 'Optimización local incompleta (NAP)' },
        telephone: { level: 'CRITICAL', impact: 'Optimización local incompleta (NAP)' },
        geo: { level: 'HIGH', impact: 'Sin coordenadas (empeora búsquedas locales)' },
        sameAs: { level: 'MEDIUM', impact: 'Sin vinculación a Google Business' },
        openingHoursSpecification: { level: 'MEDIUM', impact: 'Horarios no especificados' },
      },

      // ═══════ FAQPAGE
      FAQPage: {
        mainEntity: { level: 'CRITICAL', impact: 'Sin preguntas (FAQPage no funciona)' },
      },

      // ═══════ HOWTO
      HowTo: {
        step: { level: 'CRITICAL', impact: 'Sin pasos (HowTo no funciona)' },
        totalTime: { level: 'MEDIUM', impact: 'Tiempo no especificado' },
      },
    };

    // Buscar riesgo específico
    if (riskMap[type]?.[property]) {
      const risk = riskMap[type][property];
      return {
        level: risk.level,
        impact: risk.impact,
        recommendation: this._getRecommendation(type, property),
      };
    }

    // Riesgo por defecto
    if (isRequired) {
      return {
        level: 'HIGH',
        impact: 'Propiedad requerida ausente',
        recommendation: `Agrega '${property}' a tu ${type} schema`,
      };
    }

    return {
      level: 'MEDIUM',
      impact: 'Oportunidad de mejora',
      recommendation: `Considera agregar '${property}' para mejor contexto SEO`,
    };
  }

  /**
   * Recomendaciones específicas por propiedad
   */
  _getRecommendation(type, property) {
    const recommendations = {
      Product: {
        offers: 'Agrega <offers> con precio y disponibilidad para Google Shopping',
        price: 'Incluye el precio actual del producto',
        aggregateRating: 'Añade reseñas y ratings para aumentar CTR',
      },
      Article: {
        author: 'Define autor con name y url (mejora E-E-A-T)',
        dateModified: 'Actualiza dateModified cada que edites (Google valora freshness)',
        datePublished: 'Especifica fecha de publicación original',
      },
      BlogPosting: {
        dateModified: 'Mantén actualizado (crucial para E-E-A-T)',
        author: 'Vincula a perfil de autor con autoridad',
      },
      LocalBusiness: {
        telephone: 'Teléfono visible y verificado',
        address: 'Dirección completa y verificable',
        geo: 'Agrega coordenadas exactas (lat, long)',
        sameAs: 'Vincula a Google Business Profile, Facebook, LinkedIn',
      },
      FAQPage: {
        mainEntity: 'Estructura: mainEntity[{@type: "Question", name: "...", acceptedAnswer: {text: "..."}}]',
      },
    };

    return (
      recommendations[type]?.[property] || `Agrega '${property}' a tu ${type} schema para mejor SEO`
    );
  }

  /**
   * Validaciones específicas por tipo
   */
  _runTypeSpecificValidations(schema, definition) {
    const type = schema['@type'] || schema.type;

    switch (type) {
      case 'Product':
        this._validateProduct(schema);
        break;
      case 'LocalBusiness':
      case 'Restaurant':
      case 'Store':
      case 'ProfessionalService':
        this._validateLocalBusiness(schema);
        break;
      case 'Article':
      case 'BlogPosting':
      case 'NewsArticle':
        this._validateArticle(schema);
        break;
      case 'FAQPage':
        this._validateFAQPage(schema);
        break;
      case 'BreadcrumbList':
        this._validateBreadcrumbList(schema);
        break;
    }
  }

  /**
   * Validaciones específicas para Product
   */
  _validateProduct(schema) {
    // Verificar Offer/AggregateOffer
    const offers = extractNestedValue(schema, 'offers');
    if (!offers) {
      return; // Ya alertado en propiedades faltantes
    }

    // Si offers es un array, verificar precios
    if (Array.isArray(offers)) {
      const missingPrices = offers.some(offer => !offer.price);
      if (missingPrices) {
        this.alerts.push({
          type: 'INVALID_NESTED',
          severity: 'HIGH',
          message: 'Algunos offers no tienen precio especificado',
          property: 'offers[].price',
          recommendation: 'Verifica que cada offer tenga price y priceCurrency',
          seoCategory: 'TRANSACCIONAL',
        });
      }
    }

    // Verificar currency
    const hasPriceCurrency = extractNestedValue(schema, 'priceCurrency');
    if (offers && !hasPriceCurrency) {
      this.alerts.push({
        type: 'MISSING_RECOMMENDED',
        severity: 'MEDIUM',
        message: 'Falta especificar priceCurrency',
        property: 'priceCurrency',
        recommendation: 'Agrega priceCurrency (ej: "EUR", "USD")',
        seoCategory: 'TRANSACCIONAL',
      });
    }
  }

  /**
   * Validaciones específicas para LocalBusiness (NAP)
   */
  _validateLocalBusiness(schema) {
    // NAP Consistency
    const name = schema.name;
    const address = extractNestedValue(schema, 'address');
    const phone = schema.telephone;

    if (name && address && phone) {
      // Validar que address sea un objeto con campos
      if (typeof address === 'object') {
        const hasAddressComponents = address.streetAddress || address.addressLocality;
        if (!hasAddressComponents) {
          this.alerts.push({
            type: 'INVALID_NESTED',
            severity: 'HIGH',
            message: 'Dirección sin detalles (streetAddress, addressLocality, etc)',
            property: 'address',
            recommendation: 'Estructura: address { streetAddress, addressLocality, postalCode, addressCountry }',
            seoCategory: 'SEO_LOCAL',
          });
        }
      }
    }

    // Verificar Google Business vinculación
    const sameAs = schema.sameAs || [];
    const hasGoogleBusiness = sameAs.some(url => url.includes('google') && url.includes('business'));
    if (!hasGoogleBusiness) {
      this.alerts.push({
        type: 'MISSING_INTEGRATION',
        severity: 'MEDIUM',
        message: 'No vinculado a Google Business Profile',
        property: 'sameAs',
        recommendation: 'Agrega Google Business en sameAs array',
        seoCategory: 'SEO_LOCAL',
      });
    }

    // Verificar geo
    const geo = extractNestedValue(schema, 'geo');
    if (!geo) {
      this.alerts.push({
        type: 'MISSING_RECOMMENDED',
        severity: 'MEDIUM',
        message: 'Sin coordenadas geográficas',
        property: 'geo',
        recommendation: 'Agrega geo: { latitude: X, longitude: Y }',
        seoCategory: 'SEO_LOCAL',
      });
    }
  }

  /**
   * Validaciones específicas para Article/BlogPosting
   */
  _validateArticle(schema) {
    const type = schema['@type'] || schema.type;

    // E-E-A-T: Verificar author
    const author = extractNestedValue(schema, 'author');
    if (!author) {
      this.alerts.push({
        type: 'EEAT_RISK',
        severity: 'CRITICAL',
        message: 'Riesgo de E-E-A-T: Falta información de autor',
        property: 'author',
        recommendation: 'Define author con { name, url, @type: "Person" }',
        seoCategory: 'CONTENIDO',
      });
    }

    // Freshness: Verificar dateModified
    const dateModified = schema.dateModified;
    if (!dateModified) {
      this.alerts.push({
        type: 'FRESHNESS_RISK',
        severity: 'HIGH',
        message: 'Riesgo de Freshness: Falta dateModified',
        property: 'dateModified',
        recommendation: 'Actualiza dateModified cada que edites el artículo',
        seoCategory: 'CONTENIDO',
      });
    }

    // Publisher
    const publisher = extractNestedValue(schema, 'publisher');
    if (!publisher) {
      this.alerts.push({
        type: 'MISSING_RECOMMENDED',
        severity: 'MEDIUM',
        message: 'Sin información de publisher',
        property: 'publisher',
        recommendation: 'Agrega publisher: { name, logo { url } }',
        seoCategory: 'CONTENIDO',
      });
    }
  }

  /**
   * Validaciones específicas para FAQPage
   */
  _validateFAQPage(schema) {
    const mainEntity = schema.mainEntity;
    if (!mainEntity || (Array.isArray(mainEntity) && mainEntity.length === 0)) {
      return; // Ya alertado
    }

    const entities = Array.isArray(mainEntity) ? mainEntity : [mainEntity];
    const invalidQuestions = entities.filter(q => !q.acceptedAnswer || !q.name);

    if (invalidQuestions.length > 0) {
      this.alerts.push({
        type: 'INVALID_NESTED',
        severity: 'HIGH',
        message: `${invalidQuestions.length} preguntas sin respuesta o nombre`,
        property: 'mainEntity[].acceptedAnswer',
        recommendation:
          'Cada Question debe tener { name, acceptedAnswer: { @type: "Answer", text: "..." } }',
        seoCategory: 'IA_MAGNET',
      });
    }
  }

  /**
   * Validaciones para BreadcrumbList
   */
  _validateBreadcrumbList(schema) {
    const itemListElement = schema.itemListElement;
    if (!itemListElement || !Array.isArray(itemListElement)) {
      return;
    }

    const invalidItems = itemListElement.filter(item => !item.position || !item.name || !item.item);
    if (invalidItems.length > 0) {
      this.alerts.push({
        type: 'INVALID_NESTED',
        severity: 'MEDIUM',
        message: `${invalidItems.length} breadcrumbs incompletos`,
        property: 'itemListElement',
        recommendation:
          'Cada elemento debe tener { position, name, item: { @id } }',
        seoCategory: 'ESTRUCTURAL',
      });
    }
  }

  /**
   * Cálculo de score de completitud
   */
  _calculateScore(definition, validation) {
    if (!definition.required || definition.required.length === 0) {
      return 100;
    }

    const requiredTotal = definition.required.length;
    const requiredPresent = definition.required.length - validation.missing.length;
    const requiredScore = (requiredPresent / requiredTotal) * 100;

    // Bonus por propiedades recomendadas (25% del score)
    let recommendedScore = 0;
    if (definition.recommended && definition.recommended.length > 0) {
      const recommendedTotal = definition.recommended.length;
      const recommendedPresent =
        definition.recommended.length - validation.recommended.missing.length;
      recommendedScore = (recommendedPresent / recommendedTotal) * 25;
    }

    return Math.round(requiredScore + recommendedScore);
  }
}

/**
 * Función helper para validar un solo schema
 */
export function validateSingleSchema(schema, definition) {
  const validator = new SchemaValidator();
  return validator.validateSchema(schema, definition);
}
