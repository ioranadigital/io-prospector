/**
 * DICCIONARIO COMPLETO DE ENTIDADES SCHEMA.ORG
 * Mapea tipos, propiedades obligatorias y recomendadas
 */

export const SCHEMA_DICTIONARY = {
  // ═══════════════════════════════════════════════════════════════════════
  // COMERCIO / TRANSACCIONAL
  // ═══════════════════════════════════════════════════════════════════════
  Product: {
    category: 'TRANSACCIONAL',
    description: 'Producto de e-commerce o catálogo',
    required: ['name', 'image'],
    recommended: ['offers', 'aggregateRating', 'description', 'brand', 'url'],
    nested: {
      offers: { required: ['price', 'priceCurrency'], recommended: ['availability', 'url'] },
      aggregateRating: { required: ['ratingValue', 'ratingCount'], recommended: ['bestRating', 'worstRating'] },
      brand: { required: ['name'] },
    },
    seoImpact: 'ALTO - Mejora visibilidad en Google Shopping y rich snippets',
  },

  Service: {
    category: 'TRANSACCIONAL',
    description: 'Servicio ofrecido por una empresa',
    required: ['name', 'serviceType'],
    recommended: ['provider', 'areaServed', 'availableChannel', 'image'],
    seoImpact: 'MEDIO - Clarifica qué servicios ofreces',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONTENIDO / ARTICLES
  // ═══════════════════════════════════════════════════════════════════════
  Article: {
    category: 'CONTENIDO',
    description: 'Artículo genérico (noticia, blog, etc)',
    required: ['headline', 'image'],
    recommended: ['datePublished', 'dateModified', 'author', 'publisher', 'description'],
    nested: {
      author: { required: ['name'], recommended: ['url', '@type'] },
      publisher: { required: ['name', 'logo'], recommended: ['url'] },
    },
    eeatRisk: true, // E-E-A-T (Expertise, Authoritativeness, Trustworthiness)
    seoImpact: 'ALTO - Crítico para E-A-T y freshness',
  },

  BlogPosting: {
    category: 'CONTENIDO',
    description: 'Entrada de blog',
    required: ['headline', 'image', 'datePublished'],
    recommended: ['dateModified', 'author', 'publisher', 'articleBody', 'keywords'],
    nested: {
      author: { required: ['name'], recommended: ['url', '@type'] },
      publisher: { required: ['name', 'logo'] },
    },
    eeatRisk: true,
    seoImpact: 'ALTO - Esencial para autoridad de contenido',
  },

  NewsArticle: {
    category: 'CONTENIDO',
    description: 'Artículo de noticias',
    required: ['headline', 'image', 'datePublished', 'author'],
    recommended: ['dateModified', 'articleBody', 'publisher'],
    eeatRisk: true,
    seoImpact: 'MUY ALTO - Necesario para Google News',
  },

  TechArticle: {
    category: 'CONTENIDO',
    description: 'Artículo técnico',
    required: ['headline', 'datePublished'],
    recommended: ['dateModified', 'author', 'proficiencyLevel', 'keywords'],
    eeatRisk: true,
    seoImpact: 'MEDIO - Mejora credibilidad técnica',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // IMANES DE IA / FEATURED SNIPPETS
  // ═══════════════════════════════════════════════════════════════════════
  FAQPage: {
    category: 'IA_MAGNET',
    description: 'Página de preguntas frecuentes',
    required: ['mainEntity'],
    nested: {
      mainEntity: {
        required: ['@type', 'name'],
        subtypes: {
          Question: {
            required: ['name', 'acceptedAnswer'],
            nested: {
              acceptedAnswer: { required: ['text', '@type'] },
            },
          },
        },
      },
    },
    seoImpact: 'MUY ALTO - Genera featured snippets',
  },

  HowTo: {
    category: 'IA_MAGNET',
    description: 'Guía paso a paso',
    required: ['name', 'step'],
    recommended: ['image', 'totalTime', 'estimatedCost'],
    nested: {
      step: { required: ['text', 'url'], recommended: ['name', 'image'] },
    },
    seoImpact: 'MUY ALTO - Domina featured snippets',
  },

  Review: {
    category: 'IA_MAGNET',
    description: 'Reseña individual',
    required: ['author', 'reviewRating'],
    recommended: ['reviewBody', 'datePublished'],
    nested: {
      author: { required: ['name'] },
      reviewRating: { required: ['ratingValue'] },
    },
    seoImpact: 'MEDIO - Aumenta confianza',
  },

  AggregateRating: {
    category: 'IA_MAGNET',
    description: 'Rating agregado (múltiples reseñas)',
    required: ['ratingValue', 'ratingCount'],
    recommended: ['bestRating', 'worstRating'],
    seoImpact: 'ALTO - Genera estrellas en SERP',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ORGANIZACIÓN / SEO LOCAL
  // ═══════════════════════════════════════════════════════════════════════
  Organization: {
    category: 'ORGANIZACION',
    description: 'Organización genérica',
    required: ['name'],
    recommended: ['url', 'logo', 'sameAs', 'address', 'contactPoint', 'description'],
    nested: {
      address: { recommended: ['streetAddress', 'addressLocality', 'postalCode', 'addressCountry'] },
      contactPoint: { recommended: ['telephone', 'email', 'contactType'] },
    },
    seoImpact: 'MEDIO - Base para all other entities',
  },

  LocalBusiness: {
    category: 'SEO_LOCAL',
    description: 'Negocio local (subtipos: Restaurant, Store, Office, etc)',
    required: ['name', 'address', 'telephone'],
    recommended: ['geo', 'openingHoursSpecification', 'image', 'sameAs', 'priceRange', 'aggregateRating'],
    nested: {
      address: { required: ['streetAddress', 'addressLocality', 'postalCode'], recommended: ['addressCountry'] },
      geo: { required: ['latitude', 'longitude'] },
      openingHoursSpecification: { recommended: ['dayOfWeek', 'opens', 'closes'] },
      aggregateRating: { recommended: ['ratingValue', 'ratingCount'] },
    },
    napConsistency: true, // Verifica NAP (Nombre, Address, Phone)
    seoImpact: 'MUY ALTO - Crítico para búsquedas locales',
  },

  // Subtipos de LocalBusiness
  Restaurant: {
    parent: 'LocalBusiness',
    category: 'SEO_LOCAL',
    required: ['name', 'address', 'telephone'],
    recommended: ['menu', 'servesCuisine', 'acceptsReservations', 'priceRange'],
    seoImpact: 'MUY ALTO - Google Maps y búsquedas locales',
  },

  FoodEstablishment: {
    parent: 'LocalBusiness',
    category: 'SEO_LOCAL',
    required: ['name', 'address'],
    recommended: ['telephone', 'servesCuisine', 'priceRange'],
  },

  Store: {
    parent: 'LocalBusiness',
    category: 'SEO_LOCAL',
    required: ['name', 'address'],
    recommended: ['telephone', 'openingHoursSpecification'],
  },

  ProfessionalService: {
    parent: 'LocalBusiness',
    category: 'SEO_LOCAL',
    required: ['name', 'address'],
    recommended: ['telephone', 'areaServed', 'priceRange'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ESTRUCTURALES (SIEMPRE RECOMENDADOS)
  // ═══════════════════════════════════════════════════════════════════════
  BreadcrumbList: {
    category: 'ESTRUCTURAL',
    description: 'Navegación por migas de pan',
    required: ['itemListElement'],
    nested: {
      itemListElement: { required: ['position', 'name', 'item'] },
    },
    seoImpact: 'ALTO - Mejora navegación y CTR en SERP',
  },

  WebSite: {
    category: 'ESTRUCTURAL',
    description: 'Definición del sitio web',
    required: ['name', 'url'],
    recommended: ['potentialAction', 'image', 'sameAs'],
    nested: {
      potentialAction: { recommended: ['target', '@type'] },
    },
    seoImpact: 'MEDIO - Base de identidad digital',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // OTROS (Detectados pero no críticos)
  // ═══════════════════════════════════════════════════════════════════════
  Person: {
    category: 'OTROS',
    required: ['name'],
    recommended: ['url', 'sameAs', 'image', 'jobTitle'],
  },

  Event: {
    category: 'OTROS',
    required: ['name', 'startDate'],
    recommended: ['endDate', 'location', 'description', 'image', 'offers'],
  },

  VideoObject: {
    category: 'OTROS',
    required: ['name', 'contentUrl'],
    recommended: ['description', 'thumbnailUrl', 'uploadDate', 'duration'],
  },
};

/**
 * Categorías de riesgo para alertas
 */
export const RISK_LEVELS = {
  CRITICAL: {
    color: 'red',
    icon: '🚨',
    description: 'Impacta directamente visibilidad',
  },
  HIGH: {
    color: 'orange',
    icon: '⚠️',
    description: 'Riesgo importante de SEO',
  },
  MEDIUM: {
    color: 'yellow',
    icon: '💡',
    description: 'Oportunidad de mejora',
  },
  LOW: {
    color: 'blue',
    icon: 'ℹ️',
    description: 'Información',
  },
};

/**
 * Mapeo de categorías a tipos
 */
export const CATEGORY_MAPPING = {
  TRANSACCIONAL: ['Product', 'Service', 'Offer', 'AggregateOffer'],
  CONTENIDO: ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'],
  IA_MAGNET: ['FAQPage', 'HowTo', 'Review', 'AggregateRating'],
  SEO_LOCAL: ['LocalBusiness', 'Restaurant', 'Store', 'Organization'],
  ESTRUCTURAL: ['BreadcrumbList', 'WebSite'],
};

/**
 * Obtener definición de un tipo de schema
 */
export function getSchemaDefinition(type) {
  return SCHEMA_DICTIONARY[type] || null;
}

/**
 * Verificar si un tipo es anidado dentro de otro
 */
export function getNestedDefinition(parentType, nestedKey) {
  const parent = SCHEMA_DICTIONARY[parentType];
  if (!parent?.nested?.[nestedKey]) return null;
  return parent.nested[nestedKey];
}

/**
 * Obtener categoría de un tipo
 */
export function getCategory(type) {
  const def = SCHEMA_DICTIONARY[type];
  return def?.category || 'DESCONOCIDO';
}

/**
 * Verificar si es tipo padre (LocalBusiness) y tiene subtipos
 */
export function hasSubtypes(type) {
  const def = SCHEMA_DICTIONARY[type];
  return Object.values(SCHEMA_DICTIONARY).some(d => d.parent === type);
}
