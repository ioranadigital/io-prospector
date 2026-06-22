/**
 * RECOMENDADOR DE SCHEMAS
 * Sugiere esquemas según el tipo de página detectado
 * ACTUALIZADO: Ahora usa TypologyDetector para mayor precisión
 */

import { TypologyDetector } from '../typology-detector.js';

export class SchemaRecommender {
  /**
   * Detectar tipo de página y recomendar schemas
   */
  static recommendSchemas(url, foundSchemas = [], htmlContent = '') {
    const pageType = this._detectPageType(url, htmlContent);
    const foundTypes = foundSchemas.map(s => s.type || s['@type']);

    const recommendations = this._getRecommendationsByType(pageType, foundTypes);

    return {
      pageType,
      recommendations,
      implementedCount: foundSchemas.length,
      recommendedCount: recommendations.length,
      completeness: Math.round((foundSchemas.length / (foundSchemas.length + recommendations.length)) * 100),
    };
  }

  /**
   * Detectar tipo de página usando TypologyDetector (mejorado)
   * Convierte tipologia a pageType para compatibilidad
   */
  static _detectPageType(url, htmlContent = '') {
    // Usar el detector mejorado de tipología
    const detection = TypologyDetector.detect(url, htmlContent);

    // Mapear tipologia a pageType para compatibilidad con recomendaciones existentes
    const tipoliaToPageType = {
      home: 'HOME_PAGE',
      seccion: 'SECTION_PAGE',
      subseccion: 'SUBSECTION_PAGE',
      categoria: 'SECTION_PAGE',   // legacy
      producto: 'PRODUCT_PAGE',
      blog: 'BLOG_PAGE',
      articulo: 'ARTICLE_PAGE',
      contacto: 'CONTACT_PAGE',
      about: 'ABOUT_PAGE',
      busqueda: 'GENERIC_PAGE',
      generica: 'GENERIC_PAGE',
    };

    const pageType = tipoliaToPageType[detection.tipologia] || 'GENERIC_PAGE';

    console.log(`📊 Tipología detectada: ${detection.tipologia} → ${pageType} (confianza: ${(detection.confidence * 100).toFixed(0)}%)`);

    return pageType;
  }

  /**
   * Obtener recomendaciones por tipo de página
   */
  static _getRecommendationsByType(pageType, foundTypes = []) {
    const recommendations = {
      PRODUCT_PAGE: [
        {
          type: 'Product',
          priority: 'CRITICAL',
          reason: 'Mejora visibilidad en Google Shopping',
          fields: ['name', 'image', 'offers', 'aggregateRating'],
        },
        {
          type: 'aggregateRating',
          priority: 'HIGH',
          reason: 'Muestra estrellas en SERP',
          fields: ['ratingValue', 'ratingCount'],
        },
        {
          type: 'Organization',
          priority: 'MEDIUM',
          reason: 'Identifica la tienda',
          fields: ['name', 'logo', 'url'],
        },
        {
          type: 'BreadcrumbList',
          priority: 'MEDIUM',
          reason: 'Mejora navegación en SERP',
        },
      ],
      SECTION_PAGE: [
        {
          type: 'CollectionPage',
          priority: 'CRITICAL',
          reason: 'Define la sección como colección de contenido/productos',
          fields: ['name', 'description', 'url'],
        },
        {
          type: 'ItemList',
          priority: 'HIGH',
          reason: 'Lista los elementos de la sección',
          fields: ['itemListElement', 'numberOfItems'],
        },
        {
          type: 'BreadcrumbList',
          priority: 'HIGH',
          reason: 'Navegación en SERP desde la raíz del sitio',
          fields: ['itemListElement'],
        },
        {
          type: 'WebSite',
          priority: 'MEDIUM',
          reason: 'Ancla la sección al sitio principal',
        },
      ],
      SUBSECTION_PAGE: [
        {
          type: 'CollectionPage',
          priority: 'CRITICAL',
          reason: 'Define la subsección como colección anidada',
          fields: ['name', 'description', 'url', 'isPartOf'],
        },
        {
          type: 'BreadcrumbList',
          priority: 'CRITICAL',
          reason: 'Esencial para mostrar jerarquía en SERP (Sección > Subsección)',
          fields: ['itemListElement'],
        },
        {
          type: 'ItemList',
          priority: 'HIGH',
          reason: 'Lista los productos o contenidos de la subsección',
          fields: ['itemListElement', 'numberOfItems'],
        },
        {
          type: 'Organization',
          priority: 'LOW',
          reason: 'Identifica la entidad propietaria',
        },
      ],
      CATEGORY_PAGE: [  // legacy alias → SECTION_PAGE
        {
          type: 'CollectionPage',
          priority: 'CRITICAL',
          reason: 'Define la sección como colección de contenido/productos',
          fields: ['name', 'description', 'url'],
        },
        {
          type: 'ItemList',
          priority: 'HIGH',
          reason: 'Lista los elementos de la sección',
          fields: ['itemListElement'],
        },
        {
          type: 'BreadcrumbList',
          priority: 'HIGH',
          reason: 'Navegación en SERP desde la raíz del sitio',
        },
      ],
      BLOG_PAGE: [
        {
          type: 'BlogPosting',
          priority: 'CRITICAL',
          reason: 'Esencial para autoridad de contenido (E-E-A-T)',
          fields: ['headline', 'image', 'datePublished', 'author', 'articleBody'],
        },
        {
          type: 'Article',
          priority: 'HIGH',
          reason: 'Alternativa a BlogPosting',
          fields: ['headline', 'datePublished', 'author'],
        },
        {
          type: 'Organization',
          priority: 'MEDIUM',
          reason: 'Identifica el autor/editorial',
        },
      ],
      ARTICLE_PAGE: [
        {
          type: 'NewsArticle',
          priority: 'CRITICAL',
          reason: 'Necesario para Google News',
          fields: ['headline', 'image', 'datePublished', 'author'],
        },
        {
          type: 'Article',
          priority: 'HIGH',
          reason: 'Datos genéricos del artículo',
          fields: ['headline', 'datePublished', 'author'],
        },
        {
          type: 'Organization',
          priority: 'MEDIUM',
          reason: 'Identifica el medio',
        },
      ],
      HOME_PAGE: [
        {
          type: 'Organization',
          priority: 'CRITICAL',
          reason: 'Identifica la empresa en Knowledge Graph',
          fields: ['name', 'logo', 'url', 'contactPoint', 'sameAs'],
        },
        {
          type: 'WebSite',
          priority: 'HIGH',
          reason: 'Datos del sitio con SearchAction',
          fields: ['name', 'url', 'potentialAction'],
        },
        {
          type: 'LocalBusiness',
          priority: 'MEDIUM',
          reason: 'Si tienes ubicación física',
          fields: ['name', 'address', 'telephone', 'geo'],
        },
      ],
      CONTACT_PAGE: [
        {
          type: 'Organization',
          priority: 'HIGH',
          reason: 'Información de contacto estructurada',
          fields: ['name', 'contactPoint', 'telephone', 'email'],
        },
        {
          type: 'LocalBusiness',
          priority: 'MEDIUM',
          reason: 'Si tienes oficina física',
          fields: ['name', 'address', 'telephone', 'geo'],
        },
      ],
      ABOUT_PAGE: [
        {
          type: 'Organization',
          priority: 'HIGH',
          reason: 'Información de la empresa',
          fields: ['name', 'logo', 'description', 'foundingDate', 'founder'],
        },
        {
          type: 'Person',
          priority: 'MEDIUM',
          reason: 'Si incluye biografías de equipo',
          fields: ['name', 'jobTitle', 'image'],
        },
      ],
      FAQ_PAGE: [
        {
          type: 'FAQPage',
          priority: 'CRITICAL',
          reason: 'Genera featured snippets',
          fields: ['mainEntity'],
        },
        {
          type: 'WebSite',
          priority: 'LOW',
          reason: 'Datos generales del sitio',
        },
      ],
      GENERIC_PAGE: [
        {
          type: 'WebSite',
          priority: 'MEDIUM',
          reason: 'Datos genéricos del sitio',
        },
        {
          type: 'Organization',
          priority: 'MEDIUM',
          reason: 'Información de la empresa',
        },
      ],
    };

    const recs = recommendations[pageType] || recommendations.GENERIC_PAGE;

    // Filtrar solo los que no están implementados
    return recs.filter(rec => !foundTypes.includes(rec.type));
  }

  /**
   * Detectores de tipo de página
   */
  static _isProductPage(url) {
    // Detecta URLs con 3+ segmentos en /tienda/ (tienda/categoria/subcategoria/producto)
    return /\/producto|\/product|\/item|\/sku|\/p\/|\/tienda\/[^/]+\/[^/]+\/[^/]+\/$/.test(url);
  }

  static _isCategoryPage(url) {
    // Detecta URLs con 1-2 segmentos en /tienda/ (tienda/categoria o tienda/categoria/subcategoria sin producto)
    const tiendasMatch = url.match(/\/tienda\/[^/]*\/[^/]*\/?$/);
    const isProduct = /\/tienda\/[^/]+\/[^/]+\/[^/]+\/$/.test(url);
    return (/\/categoria|\/category|\/catalogo|\/col|\/tienda\/[^/]+\/$/.test(url) || tiendasMatch) && !isProduct;
  }

  static _isBlogPage(url) {
    return /\/blog|\/articulo|\/post|\/entrada|\/news\//.test(url);
  }

  static _isArticlePage(url) {
    return /\/noticias|\/noticia|\/articulo-|\/news\//.test(url);
  }

  static _isHomePage(url) {
    return /^https?:\/\/[^/]+\/?$|\/\?|\/inicio|\/home$/.test(url);
  }

  static _isContactPage(url) {
    return /\/contacto|\/contact|\/contactenos|\/contact-us/.test(url);
  }

  static _isAboutPage(url) {
    return /\/acerca|\/about|\/nosotros|\/who-we-are/.test(url);
  }

  static _isFAQPage(url) {
    return /\/faq|\/preguntas|\/frequently-asked/.test(url);
  }
}
