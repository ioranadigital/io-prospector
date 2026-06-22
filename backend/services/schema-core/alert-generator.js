/**
 * GENERADOR DE ALERTAS TÉCNICAS SEO/GEO
 * Sistema de validación de propiedades requeridas por tipo de Schema.org
 *
 * Detecta:
 * - Propiedades obligatorias faltantes
 * - Riesgos de E-E-A-T (Expertise, Authoritativeness, Trustworthiness)
 * - Inconsistencias NAP (Name, Address, Phone)
 * - Problemas de indexación GEO
 * - Validaciones críticas YMYL (Your Money, Your Life)
 */

import { getEntityConfig, requiresEEAT, requiresNAP } from './entity-dictionary.js';

export class AlertGenerator {
  /**
   * Generar alertas para un schema específico
   */
  static generateAlerts(schema, entityType) {
    const alerts = [];
    const config = getEntityConfig(entityType);

    if (!config) {
      return alerts; // Entidad desconocida, sin alertas
    }

    // Alertas de propiedades requeridas
    const requiredAlerts = this._validateRequired(schema, config, entityType);
    alerts.push(...requiredAlerts);

    // Alertas específicas por tipo
    const typeSpecificAlerts = this._validateTypeSpecific(schema, entityType);
    alerts.push(...typeSpecificAlerts);

    // Alertas de E-E-A-T si aplica
    if (requiresEEAT(entityType)) {
      const eeatAlerts = this._validateEEAT(schema, entityType);
      alerts.push(...eeatAlerts);
    }

    // Alertas de NAP si aplica
    if (requiresNAP(entityType)) {
      const napAlerts = this._validateNAP(schema, entityType);
      alerts.push(...napAlerts);
    }

    return alerts;
  }

  /**
   * Validar propiedades requeridas
   */
  static _validateRequired(schema, config, entityType) {
    const alerts = [];

    if (!config.required || config.required.length === 0) {
      return alerts;
    }

    config.required.forEach(prop => {
      if (!this._propertyExists(schema, prop)) {
        alerts.push({
          severity: 'CRITICAL',
          type: 'MISSING_REQUIRED_PROPERTY',
          property: prop,
          entityType,
          message: `Falta propiedad requerida: '${prop}' en ${entityType}`,
          impact: this._getPropertyImpact(entityType, prop),
          recommendation: `Añade '${prop}' al schema ${entityType} para cumplir con los requisitos de indexación`,
        });
      }
    });

    return alerts;
  }

  /**
   * Validaciones específicas por tipo de schema
   */
  static _validateTypeSpecific(schema, entityType) {
    const alerts = [];

    switch (entityType) {
      case 'Product':
      case 'ProductGroup':
        alerts.push(...this._validateProduct(schema));
        break;

      case 'BlogPosting':
      case 'Article':
      case 'NewsArticle':
      case 'TechArticle':
        alerts.push(...this._validateArticle(schema, entityType));
        break;

      case 'LocalBusiness':
      case 'Restaurant':
      case 'Store':
      case 'ProfessionalService':
        alerts.push(...this._validateLocalBusiness(schema, entityType));
        break;

      case 'FAQPage':
        alerts.push(...this._validateFAQPage(schema));
        break;

      case 'HowTo':
        alerts.push(...this._validateHowTo(schema));
        break;

      case 'BreadcrumbList':
        alerts.push(...this._validateBreadcrumbList(schema));
        break;

      case 'VideoObject':
        alerts.push(...this._validateVideoObject(schema));
        break;

      case 'Person':
        alerts.push(...this._validatePerson(schema));
        break;
    }

    return alerts;
  }

  /**
   * Validaciones de E-E-A-T
   */
  static _validateEEAT(schema, entityType) {
    const alerts = [];

    // Verificar autor
    if (!this._propertyExists(schema, 'author')) {
      alerts.push({
        severity: 'HIGH',
        type: 'EEAT_RISK_NO_AUTHOR',
        property: 'author',
        entityType,
        message: `Riesgo de E-E-A-T: Falta información de autor en ${entityType}`,
        impact: 'Google no puede validar expertise del contenido',
        recommendation: 'Agrega autor con nombre y enlace de verificación profesional (LinkedIn, sitio personal)',
      });
    }

    // Verificar dateModified (freshness)
    if (!this._propertyExists(schema, 'dateModified')) {
      alerts.push({
        severity: 'HIGH',
        type: 'EEAT_RISK_NO_FRESHNESS',
        property: 'dateModified',
        entityType,
        message: `Riesgo de Freshness: Falta dateModified en ${entityType}`,
        impact: 'Contenido aparenta ser obsoleto',
        recommendation: 'Actualiza dateModified a la fecha de última modificación del contenido',
      });
    }

    // Verificar publisher
    if (!this._propertyExists(schema, 'publisher') && entityType !== 'Person') {
      alerts.push({
        severity: 'MEDIUM',
        type: 'EEAT_RISK_NO_PUBLISHER',
        property: 'publisher',
        entityType,
        message: `Riesgo de E-E-A-T: Falta publisher en ${entityType}`,
        impact: 'No se identifica la publicación responsable',
        recommendation: 'Agrega publisher con nombre e imagen de la editorial',
      });
    }

    return alerts;
  }

  /**
   * Validaciones NAP (Name, Address, Phone)
   */
  static _validateNAP(schema, entityType) {
    const alerts = [];
    const napRequired = ['name', 'address', 'telephone'];

    napRequired.forEach(prop => {
      if (!this._propertyExists(schema, prop)) {
        alerts.push({
          severity: 'CRITICAL',
          type: 'NAP_CONSISTENCY_MISSING',
          property: prop,
          entityType,
          message: `Inconsistencia NAP: Falta '${prop}' en ${entityType}`,
          impact: 'Google Local no indexa correctamente sin NAP consistente',
          recommendation: `Asegúrate de que ${prop} coincide en todos los perfiles online (Google Business, directorios)`,
        });
      }
    });

    // Validar geo (geolocalización)
    if (!this._propertyExists(schema, 'geo')) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'GEO_MISSING',
        property: 'geo',
        entityType,
        message: `Optimización local incompleta: Falta 'geo' (coordenadas) en ${entityType}`,
        impact: 'Reduce precisión en búsquedas locales y mapas',
        recommendation: 'Agrega geo con latitude/longitude para mejorar indexación local',
      });
    }

    // Validar sameAs (identidad unificada)
    if (!this._propertyExists(schema, 'sameAs')) {
      alerts.push({
        severity: 'LOW',
        type: 'IDENTITY_MISSING',
        property: 'sameAs',
        entityType,
        message: `Identidad empresarial incompleta: Falta 'sameAs' en ${entityType}`,
        impact: 'No se valida la identidad en Google Knowledge Panel',
        recommendation: 'Agrega enlaces a Google Business Profile, redes sociales y directorios',
      });
    }

    return alerts;
  }

  /**
   * Validar Product
   */
  static _validateProduct(schema) {
    const alerts = [];

    // Offers es crítico para Google Shopping
    if (!this._propertyExists(schema, 'offers')) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'PRODUCT_NO_OFFERS',
        property: 'offers',
        entityType: 'Product',
        message: 'Producto sin ofertas: Falta propiedad offers',
        impact: 'No aparece en Google Shopping',
        recommendation: 'Estructura offers con price, priceCurrency (EUR), availability (InStock/OutOfStock)',
      });
    }

    // Validar estructura de offers
    if (schema.offers) {
      if (!this._propertyExists(schema.offers, 'price')) {
        alerts.push({
          severity: 'CRITICAL',
          type: 'OFFER_NO_PRICE',
          property: 'offers.price',
          entityType: 'Product',
          message: 'Oferta sin precio: Falta price en offers',
          impact: 'Google Shopping no puede mostrar el precio',
          recommendation: 'Especifica el precio exacto en offers.price',
        });
      }

      if (!this._propertyExists(schema.offers, 'priceCurrency')) {
        alerts.push({
          severity: 'CRITICAL',
          type: 'OFFER_NO_CURRENCY',
          property: 'offers.priceCurrency',
          entityType: 'Product',
          message: 'Oferta sin moneda: Falta priceCurrency',
          impact: 'El precio es ambiguo sin moneda',
          recommendation: 'Especifica priceCurrency (EUR, USD, etc.)',
        });
      }
    }

    // itemCondition es importante para productos de segunda mano
    if (!this._propertyExists(schema, 'itemCondition') && schema.offers) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'PRODUCT_NO_CONDITION',
        property: 'itemCondition',
        entityType: 'Product',
        message: 'Condición del producto no especificada',
        impact: 'Importante para SEO de productos de segunda mano',
        recommendation: 'Agrega itemCondition (https://schema.org/NewCondition o UsedCondition)',
      });
    }

    return alerts;
  }

  /**
   * Validar Article / BlogPosting
   */
  static _validateArticle(schema, entityType) {
    const alerts = [];

    // datePublished es obligatorio
    if (!this._propertyExists(schema, 'datePublished')) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'ARTICLE_NO_DATE_PUBLISHED',
        property: 'datePublished',
        entityType,
        message: `${entityType} sin fecha de publicación`,
        impact: 'Google no puede determinar cuándo fue publicado',
        recommendation: 'Agrega datePublished en formato ISO 8601 (YYYY-MM-DD)',
      });
    }

    return alerts;
  }

  /**
   * Validar LocalBusiness
   */
  static _validateLocalBusiness(schema, entityType) {
    const alerts = [];

    // address debe tener estructura
    if (this._propertyExists(schema, 'address')) {
      const address = schema.address;
      if (typeof address === 'string') {
        alerts.push({
          severity: 'MEDIUM',
          type: 'ADDRESS_NOT_STRUCTURED',
          property: 'address',
          entityType,
          message: 'Dirección sin estructura: debe ser PostalAddress object',
          impact: 'Google no puede parsear la dirección correctamente',
          recommendation: 'Estructura address como PostalAddress con streetAddress, addressLocality, postalCode',
        });
      }
    }

    return alerts;
  }

  /**
   * Validar FAQPage
   */
  static _validateFAQPage(schema) {
    const alerts = [];

    if (!this._propertyExists(schema, 'mainEntity')) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'FAQ_NO_MAIN_ENTITY',
        property: 'mainEntity',
        entityType: 'FAQPage',
        message: 'FAQPage sin preguntas: Falta mainEntity',
        impact: 'Google no puede generar featured snippets',
        recommendation: 'Estructura mainEntity como array de Question objects con acceptedAnswer',
      });
    }

    return alerts;
  }

  /**
   * Validar HowTo
   */
  static _validateHowTo(schema) {
    const alerts = [];

    if (!this._propertyExists(schema, 'step') || !Array.isArray(schema.step) || schema.step.length === 0) {
      alerts.push({
        severity: 'CRITICAL',
        type: 'HOWTO_NO_STEPS',
        property: 'step',
        entityType: 'HowTo',
        message: 'HowTo sin pasos: Falta array de step',
        impact: 'No aparece en featured snippets de búsqueda',
        recommendation: 'Define step como array con HowToStep objects (text, image, url)',
      });
    }

    return alerts;
  }

  /**
   * Validar BreadcrumbList
   */
  static _validateBreadcrumbList(schema) {
    const alerts = [];

    if (!this._propertyExists(schema, 'itemListElement') || !Array.isArray(schema.itemListElement)) {
      alerts.push({
        severity: 'HIGH',
        type: 'BREADCRUMB_NO_ITEMS',
        property: 'itemListElement',
        entityType: 'BreadcrumbList',
        message: 'BreadcrumbList sin elementos',
        impact: 'Las migas de pan no se muestran en SERP',
        recommendation: 'Estructura itemListElement como array de ListItem con position, name, item URL',
      });
    }

    return alerts;
  }

  /**
   * Validar VideoObject
   */
  static _validateVideoObject(schema) {
    const alerts = [];

    if (!this._propertyExists(schema, 'thumbnailUrl')) {
      alerts.push({
        severity: 'HIGH',
        type: 'VIDEO_NO_THUMBNAIL',
        property: 'thumbnailUrl',
        entityType: 'VideoObject',
        message: 'Vídeo sin thumbnail',
        impact: 'Google Video no puede mostrar vista previa',
        recommendation: 'Agrega thumbnailUrl con URL de imagen de miniatura',
      });
    }

    return alerts;
  }

  /**
   * Validar Person
   */
  static _validatePerson(schema) {
    const alerts = [];

    if (!this._propertyExists(schema, 'sameAs')) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'PERSON_NO_VERIFICATION',
        property: 'sameAs',
        entityType: 'Person',
        message: 'Persona sin verificación: Falta sameAs',
        impact: 'No se puede validar expertise del autor',
        recommendation: 'Agrega sameAs con enlaces a LinkedIn, Twitter o sitio personal del autor',
      });
    }

    return alerts;
  }

  /**
   * Verificar si una propiedad existe en el objeto
   */
  static _propertyExists(obj, propPath) {
    if (!obj || typeof obj !== 'object') return false;

    // Soporta paths anidados (ej: "offers.price")
    if (propPath.includes('.')) {
      const [first, ...rest] = propPath.split('.');
      return this._propertyExists(obj[first], rest.join('.'));
    }

    const value = obj[propPath];
    return value !== undefined && value !== null && value !== '';
  }

  /**
   * Obtener impacto de una propiedad faltante
   */
  static _getPropertyImpact(entityType, property) {
    const impacts = {
      // Product impacts
      'Product.offers': 'No aparece en Google Shopping',
      'Product.price': 'No se muestra precio en resultados',
      'Product.image': 'Sin imagen en SERP',

      // Article impacts
      'Article.datePublished': 'No se conoce la fecha de publicación',
      'Article.dateModified': 'Riesgo de contenido obsoleto',
      'Article.author': 'Falta información de autoría (E-E-A-T)',

      // LocalBusiness impacts
      'LocalBusiness.address': 'Búsquedas locales incompletas',
      'LocalBusiness.telephone': 'No hay contacto directo disponible',
      'LocalBusiness.geo': 'Localización imprecisa en mapas',

      // FAQPage impacts
      'FAQPage.mainEntity': 'No genera featured snippets',

      // HowTo impacts
      'HowTo.step': 'No aparece en featured snippets de "cómo"',
    };

    return impacts[`${entityType}.${property}`] || 'Información incompleta del schema';
  }
}

/**
 * Factory para uso rápido
 */
export function generateSchemaAlerts(schema, entityType) {
  return AlertGenerator.generateAlerts(schema, entityType);
}
