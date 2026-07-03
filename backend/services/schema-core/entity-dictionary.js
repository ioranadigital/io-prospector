/**
 * DICCIONARIO JERÁRQUICO DE ENTIDADES SCHEMA.ORG
 * Arquitectura de Contexto - Rama de Heredamiento: Thing -> CreativeWork/Organization/Product
 *
 * Esta es la fuente de verdad para todas las entidades Schema.org soportadas
 * Incluye jerarquía, propiedades requeridas, recomendadas y patrones de validación
 */

export const ENTITY_DICTIONARY = {
  // ════════════════════════════════════════════════════════════════════════════
  // RAÍZ: Thing (Base de toda entidad en Schema.org)
  // ════════════════════════════════════════════════════════════════════════════

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA A: CreativeWork -> Article (Contenido, Blogs & E-E-A-T)
  // ════════════════════════════════════════════════════════════════════════════

  Article: {
    hierarchy: 'CreativeWork',
    description: 'Artículos genéricos (noticias, blogs, contenido editorial)',
    required: ['headline', 'image'],
    recommended: ['datePublished', 'dateModified', 'author', 'publisher', 'description', 'articleBody'],
    eeatRisk: true,
    seoCategory: 'CONTENIDO',
    seoImpact: 'ALTO - Crítico para E-E-A-T y freshness',
  },

  BlogPosting: {
    hierarchy: 'CreativeWork -> Article',
    description: 'Entradas de blog estándar con autoría',
    required: ['headline', 'image', 'datePublished'],
    recommended: ['dateModified', 'author', 'publisher', 'articleBody', 'keywords'],
    eeatRisk: true,
    seoCategory: 'CONTENIDO',
    seoImpact: 'MUY ALTO - Esencial para autoridad de contenido',
  },

  NewsArticle: {
    hierarchy: 'CreativeWork -> Article',
    description: 'Artículos de prensa y noticias de actualidad',
    required: ['headline', 'image', 'datePublished', 'author'],
    recommended: ['dateModified', 'articleBody', 'publisher'],
    eeatRisk: true,
    seoCategory: 'CONTENIDO',
    seoImpact: 'MUY ALTO - Necesario para Google News',
  },

  TechArticle: {
    hierarchy: 'CreativeWork -> Article',
    description: 'Documentación técnica, guías y tutoriales',
    required: ['headline', 'datePublished'],
    recommended: ['dateModified', 'author', 'proficiencyLevel', 'keywords'],
    eeatRisk: true,
    seoCategory: 'CONTENIDO',
    seoImpact: 'MEDIO - Mejora credibilidad técnica',
  },

  APIReference: {
    hierarchy: 'CreativeWork -> Article',
    description: 'Documentación de código, APIs y endpoints (Crucial para SaaS)',
    required: ['name', 'description'],
    recommended: ['author', 'datePublished', 'dateModified'],
    eeatRisk: true,
    seoCategory: 'CONTENIDO',
    seoImpact: 'ALTO - Vital para SaaS y desarrolladores',
  },

  MedicalWebPage: {
    hierarchy: 'CreativeWork -> Article',
    description: 'Contenido médico certificado (Sector YMYL)',
    required: ['headline', 'author', 'datePublished'],
    recommended: ['dateModified', 'medicalAudience', 'reviewedBy'],
    eeatRisk: true,
    seoCategory: 'CONTENIDO_MEDICO',
    seoImpact: 'CRÍTICO - Sector YMYL requiere EBM y certificaciones',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA B: CreativeWork -> WebPage (Tipología de URLs)
  // ════════════════════════════════════════════════════════════════════════════

  WebPage: {
    hierarchy: 'CreativeWork',
    description: 'Página web estática genérica',
    required: ['name'],
    recommended: ['description', 'url', 'image'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'MEDIO - Base de cualquier página web',
  },

  AboutPage: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Página Quiénes Somos - VITAL para validación E-E-A-T',
    required: ['name', 'description'],
    recommended: ['author', 'publisher', 'image', 'datePublished'],
    eeatRisk: true,
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'MUY ALTO - Fundamental para Trust & E-A-T',
  },

  ContactPage: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Página de contacto e información de negocio',
    required: ['name'],
    recommended: ['telephone', 'email', 'address'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'MEDIO - Mejora contactabilidad',
  },

  CollectionPage: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Páginas de categorías, etiquetas y listados de colecciones',
    required: ['name'],
    recommended: ['description', 'url', 'mainEntity'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'ALTO - Organiza jerarquía de contenido',
  },

  ImageGallery: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Portafolios, galerías fotográficas y colecciones de imágenes',
    required: ['name'],
    recommended: ['image', 'author'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'MEDIO - Mejora indexación de imágenes',
  },

  ProfilePage: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Página de perfil de autor, consultor o expert',
    required: ['name'],
    recommended: ['description', 'image', 'author'],
    eeatRisk: true,
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'ALTO - Valida Expertise en E-E-A-T',
  },

  SearchResultsPage: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Páginas de resultados del buscador interno',
    required: ['name'],
    recommended: ['url'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'BAJO - Buscador interno mejora UX',
  },

  ItemPage: {
    hierarchy: 'CreativeWork -> WebPage',
    description: 'Ficha específica de un elemento individual (producto, artículo, etc)',
    required: ['name'],
    recommended: ['description', 'mainEntity'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'ALTO - Página de detalle de contenido',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA C: CreativeWork -> AI Magnets, Snippets & Conversión (GEO Core)
  // ════════════════════════════════════════════════════════════════════════════

  FAQPage: {
    hierarchy: 'CreativeWork',
    description: 'Preguntas frecuentes con acordeones y estructura de Q&A',
    required: ['mainEntity'],
    recommended: [],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'MUY ALTO - Genera featured snippets y GEO',
  },

  HowTo: {
    hierarchy: 'CreativeWork',
    description: 'Tutoriales paso a paso con requerimientos y duración',
    required: ['name', 'step'],
    recommended: ['image', 'totalTime', 'estimatedCost', 'tool'],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'MUY ALTO - Domina featured snippets en "cómo"',
  },

  Recipe: {
    hierarchy: 'CreativeWork',
    description: 'Recetas de cocina con ingredientes y pasos',
    required: ['name', 'recipeIngredient', 'recipeInstructions'],
    recommended: ['cookTime', 'prepTime', 'totalTime', 'recipeYield', 'aggregateRating'],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'ALTO - Domina búsquedas de cocina',
  },

  Review: {
    hierarchy: 'CreativeWork',
    description: 'Reseña individual de un producto, servicio o contenido',
    required: ['reviewBody', 'reviewRating'],
    recommended: ['author', 'datePublished', 'itemReviewed'],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'MEDIO - Valida credibilidad de productos',
  },

  AggregateRating: {
    hierarchy: 'CreativeWork',
    description: 'Rating acumulado y agregado de reseñas',
    required: ['ratingValue', 'ratingCount'],
    recommended: ['bestRating', 'worstRating', 'reviewCount'],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'ALTO - Muestra estrellas en SERP',
  },

  QAPage: {
    hierarchy: 'CreativeWork',
    description: 'Página de Q&A comunitaria con respuestas votadas',
    required: ['mainEntity'],
    recommended: [],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'ALTO - Foros con respuestas de usuarios',
  },

  JobPosting: {
    hierarchy: 'CreativeWork',
    description: 'Ofertas de empleo para Google Jobs y plataformas',
    required: ['title', 'hiringOrganization', 'jobLocation', 'baseSalary'],
    recommended: ['jobStartDate', 'employmentType', 'description'],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'MEDIO - Google Jobs indexa automáticamente',
  },

  Course: {
    hierarchy: 'CreativeWork',
    description: 'Cursos formativos, infoproductos y entrenamientos',
    required: ['name', 'description'],
    recommended: ['provider', 'hasCourseInstance', 'aggregateRating'],
    seoCategory: 'IA_MAGNET',
    seoImpact: 'MEDIO - Vital para educación online',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA D: CreativeWork -> MediaObject (Indexación Multimedia)
  // ════════════════════════════════════════════════════════════════════════════

  MediaObject: {
    hierarchy: 'CreativeWork',
    description: 'Objeto multimedia genérico (imágenes, vídeos, audio)',
    required: ['name'],
    recommended: ['description', 'contentUrl', 'thumbnailUrl'],
    seoCategory: 'MULTIMEDIA',
    seoImpact: 'MEDIO - Base para multimedia',
  },

  VideoObject: {
    hierarchy: 'CreativeWork -> MediaObject',
    description: 'Vídeos incrustados de YouTube, Vimeo o nativos',
    required: ['name', 'description', 'thumbnailUrl'],
    recommended: ['uploadDate', 'duration', 'contentUrl', 'embedUrl'],
    seoCategory: 'MULTIMEDIA',
    seoImpact: 'ALTO - Google Video y búsqueda visual',
  },

  ImageObject: {
    hierarchy: 'CreativeWork -> MediaObject',
    description: 'Infografías e imágenes con metadatos de autoría',
    required: ['name', 'url'],
    recommended: ['caption', 'author', 'datePublished'],
    seoCategory: 'MULTIMEDIA',
    seoImpact: 'MEDIO - Google Images indexa automáticamente',
  },

  AudioObject: {
    hierarchy: 'CreativeWork -> MediaObject',
    description: 'Podcasts y archivos de audio alojados',
    required: ['name', 'contentUrl'],
    recommended: ['description', 'duration', 'uploadDate'],
    seoCategory: 'MULTIMEDIA',
    seoImpact: 'MEDIO - Google Podcasts',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA E: Organization & LocalBusiness (Confianza y SEO Local)
  // ════════════════════════════════════════════════════════════════════════════

  Organization: {
    hierarchy: 'Thing',
    description: 'Marcas o empresas genéricas (sin localización física)',
    required: ['name', 'url'],
    recommended: ['logo', 'contactPoint', 'sameAs', 'founder'],
    seoCategory: 'ORGANIZACION',
    seoImpact: 'ALTO - Base de identidad corporativa',
  },

  Corporation: {
    hierarchy: 'Organization',
    description: 'Empresas corporativas, S.A., S.L. o entidades financieras',
    required: ['name', 'url'],
    recommended: ['foundingDate', 'founder', 'numberOfEmployees'],
    seoCategory: 'ORGANIZACION',
    seoImpact: 'ALTO - Entidades empresariales grandes',
  },

  EducationalOrganization: {
    hierarchy: 'Organization',
    description: 'Escuelas, academias, universidades',
    required: ['name'],
    recommended: ['url', 'address', 'contactPoint'],
    seoCategory: 'ORGANIZACION',
    seoImpact: 'MEDIO - Instituciones educativas',
  },

  NGO: {
    hierarchy: 'Organization',
    description: 'Organizaciones sin fines de lucro',
    required: ['name'],
    recommended: ['url', 'mission', 'contactPoint'],
    seoCategory: 'ORGANIZACION',
    seoImpact: 'BAJO - ONGs y asociaciones',
  },

  LocalBusiness: {
    hierarchy: 'Organization -> Place',
    description: 'Negocios físicos con localización geográfica',
    required: ['name', 'address', 'telephone'],
    recommended: ['geo', 'openingHoursSpecification', 'image', 'sameAs'],
    napConsistency: true, // Validar NAP (Name, Address, Phone)
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'MUY ALTO - Crítico para búsquedas locales',
  },

  ProfessionalService: {
    hierarchy: 'LocalBusiness',
    description: 'Consultorías, agencias, abogados, asesores',
    required: ['name', 'address', 'telephone'],
    recommended: ['areaServed', 'priceRange', 'aggregateRating'],
    napConsistency: true,
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'ALTO - Servicios profesionales locales',
  },

  Store: {
    hierarchy: 'LocalBusiness',
    description: 'Tiendas físicas minoristas',
    required: ['name', 'address', 'telephone'],
    recommended: ['openingHoursSpecification', 'image', 'geo'],
    napConsistency: true,
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'ALTO - Retail físico',
  },

  Restaurant: {
    hierarchy: 'LocalBusiness -> FoodEstablishment',
    description: 'Restaurantes y establecimientos de comida',
    required: ['name', 'address', 'telephone'],
    recommended: ['menu', 'priceRange', 'aggregateRating', 'servesCuisine'],
    napConsistency: true,
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'ALTO - Búsquedas de gastronomía',
  },

  MedicalBusiness: {
    hierarchy: 'LocalBusiness',
    description: 'Clínicas, dentistas, psicólogos (Sector YMYL crítico)',
    required: ['name', 'address', 'telephone'],
    recommended: ['medicalSpecialty', 'knowsAbout', 'aggregateRating'],
    napConsistency: true,
    eeatRisk: true,
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'CRÍTICO - YMYL: requiere certificaciones médicas',
  },

  AutomotiveBusiness: {
    hierarchy: 'LocalBusiness',
    description: 'Talleres, concesionarios y servicios automotrices',
    required: ['name', 'address', 'telephone'],
    recommended: ['knowsAbout', 'priceRange'],
    napConsistency: true,
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'MEDIO - Sector automotor',
  },

  HomeAndConstructionBusiness: {
    hierarchy: 'LocalBusiness',
    description: 'Reformas, fontaneros, construcción y servicios del hogar',
    required: ['name', 'address', 'telephone'],
    recommended: ['areaServed', 'knowsAbout'],
    napConsistency: true,
    seoCategory: 'SEO_LOCAL',
    seoImpact: 'MEDIO - Servicios de construcción y reforma',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA F: Product & Transacciones (E-commerce)
  // ════════════════════════════════════════════════════════════════════════════

  Product: {
    hierarchy: 'Thing',
    description: 'Ficha de producto individual',
    required: ['name', 'image'],
    recommended: ['offers', 'aggregateRating', 'description', 'brand', 'sku'],
    seoCategory: 'TRANSACCIONAL',
    seoImpact: 'ALTO - Google Shopping y rich snippets',
  },

  ProductGroup: {
    hierarchy: 'Product',
    description: 'Variantes de productos (colores, tallas, SKU agrupados)',
    required: ['name', 'image'],
    recommended: ['hasVariant', 'offers', 'aggregateRating'],
    seoCategory: 'TRANSACCIONAL',
    seoImpact: 'MEDIO - Agrupa variantes de productos',
  },

  Offer: {
    hierarchy: 'Thing',
    description: 'Estructura de precios, monedas y disponibilidad',
    required: ['price', 'priceCurrency'],
    recommended: ['availability', 'url', 'itemCondition', 'seller'],
    seoCategory: 'TRANSACCIONAL',
    seoImpact: 'CRÍTICO - Determina visibilidad en Google Shopping',
  },

  AggregateOffer: {
    hierarchy: 'Offer',
    description: 'Agregación de múltiples ofertas de diferentes vendedores',
    required: ['lowPrice', 'highPrice', 'priceCurrency'],
    recommended: ['offerCount', 'offers'],
    seoCategory: 'TRANSACCIONAL',
    seoImpact: 'ALTO - Marketplaces con múltiples vendedores',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RAMA G: Estructural (Obligatorios en infraestructura de rastreo)
  // ════════════════════════════════════════════════════════════════════════════

  BreadcrumbList: {
    hierarchy: 'Thing',
    description: 'Migas de pan y jerarquía de navegación',
    required: ['itemListElement'],
    recommended: [],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'ALTO - Mejora navegación en SERP',
  },

  WebSite: {
    hierarchy: 'Thing',
    description: 'Datos globales del sitio y buscador interno',
    required: ['name', 'url'],
    recommended: ['potentialAction', 'image'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'ALTO - SearchAction activa sitelinks',
  },

  Person: {
    hierarchy: 'Thing',
    description: 'Datos de autores, expertos e individuos',
    required: ['name'],
    recommended: ['url', 'image', 'sameAs'],
    eeatRisk: true,
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'ALTO - Valida autoría y Expertise en E-E-A-T',
  },

  Event: {
    hierarchy: 'Thing',
    description: 'Eventos físicos, conciertos, webinars y conferencias',
    required: ['name', 'startDate', 'location'],
    recommended: ['endDate', 'description', 'image', 'url'],
    seoCategory: 'ESTRUCTURA',
    seoImpact: 'MEDIO - Google Events indexa automáticamente',
  },
};

/**
 * Mapeo inverso: @type -> Configuración
 * Facilita búsquedas rápidas por tipo de schema
 */
export const ENTITY_BY_TYPE = Object.fromEntries(
  Object.entries(ENTITY_DICTIONARY).map(([type, config]) => [type, config])
);

/**
 * Obtener configuración de entidad
 */
export function getEntityConfig(entityType) {
  return ENTITY_BY_TYPE[entityType] || null;
}

/**
 * Categorías SEO para agrupación
 */
export const CATEGORIES = {
  CONTENIDO: 'Contenido Editorial y Blogs (E-E-A-T)',
  CONTENIDO_MEDICO: 'Contenido Médico (YMYL)',
  ESTRUCTURA: 'Estructura y Navegación',
  IA_MAGNET: 'Imanes de IA y Featured Snippets',
  MULTIMEDIA: 'Indexación Multimedia',
  ORGANIZACION: 'Datos Organizacionales',
  SEO_LOCAL: 'SEO Local y Ubicación',
  TRANSACCIONAL: 'Transacciones y E-commerce',
};

/**
 * Validación rápida: ¿Requiere E-E-A-T?
 */
export function requiresEEAT(entityType) {
  const config = getEntityConfig(entityType);
  return config?.eeatRisk === true;
}

/**
 * Validación rápida: ¿Es crítico para local?
 */
export function requiresNAP(entityType) {
  const config = getEntityConfig(entityType);
  return config?.napConsistency === true;
}
