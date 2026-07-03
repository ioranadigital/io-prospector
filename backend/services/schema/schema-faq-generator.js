/**
 * GENERADOR DE FAQs CONTEXTUAL
 * Auditoría y validación semántica de FAQs por tipología de página
 * Regla de Revisión y Validación Semántica: ESTRUCTURACIÓN DE FAQs
 */

export class SchemaFAQGenerator {
  /**
   * MÉTODO PRINCIPAL: Generar FAQs validadas por tipología
   * Aplica filtros de exclusión crítico y enfoque semántico por intención de búsqueda
   */
  static generateFAQs(pageType, url) {
    // FILTRO DE EXCLUSIÓN CRÍTICO
    if (this._isExcludedPageType(pageType)) {
      return [];
    }

    // ENFOQUE SEMÁNTICO POR TIPOLOGÍA
    switch (pageType) {
      case 'PRODUCT_PAGE':
        return this._generateProductFAQs(url);
      case 'CATEGORY_PAGE':
        return this._generateCategoryFAQs(url);
      case 'BLOG_PAGE':
        return this._generateBlogFAQs(url);
      case 'ARTICLE_PAGE':
        return this._generateArticleFAQs(url);
      default:
        return [];
    }
  }

  /**
   * FILTRO DE EXCLUSIÓN CRÍTICO
   * Retorna true si la página QUEDA TERMINANTEMENTE PROHIBIDO generar FAQs
   */
  static _isExcludedPageType(pageType) {
    const excludedTypes = ['HOME_PAGE', 'CONTACT_PAGE', 'ABOUT_PAGE'];
    return excludedTypes.includes(pageType);
  }

  /**
   * FAQs PARA PÁGINAS DE PRODUCTO
   * Nivel 5 - Transaccional: Romper objeciones de última milla y conversión
   * Validación: Especificaciones técnicas, tallajes, envíos, estado, garantías
   */
  static _generateProductFAQs(url) {
    const productName = this._extractProductName(url);

    return [
      {
        pregunta: `¿Cuáles son las especificaciones técnicas exactas de ${productName || 'este producto'}?`,
        respuesta: `Consulta la sección de "Especificaciones" en esta página para ver todos los detalles técnicos, dimensiones, materiales, pesos y características del producto. Si necesitas información adicional, no dudes en contactarnos.`,
      },
      {
        pregunta: `¿Qué política de envío y devolución se aplica a ${productName || 'este artículo'}?`,
        respuesta: `Ofrecemos envío rápido a toda España. Los productos pueden devolverse en un plazo de 30 días si no estás completamente satisfecho, sin hacer preguntas. Consulta nuestras políticas de envío para conocer los costes y plazos según tu ubicación.`,
      },
      {
        pregunta: `¿Incluye garantía ${productName || 'este producto'} y cuál es el período de cobertura?`,
        respuesta: `Sí, todos nuestros productos incluyen garantía de 2 años contra defectos de fabricación. La garantía cubre piezas defectuosas y problemas técnicos. El servicio técnico puede ser contactado a través de nuestra página de soporte.`,
      },
    ];
  }

  /**
   * FAQs PARA PÁGINAS DE CATEGORÍA
   * Niveles 1 y 4 - Guía de Elección: Criterios de selección, materiales, tendencias
   * Validación: Elección de gama, materiales, tendencias del sector
   */
  static _generateCategoryFAQs(url) {
    const categoryName = this._extractCategoryName(url);

    return [
      {
        pregunta: `¿Cómo elegir el ${categoryName || 'producto'} perfecto para mis necesidades?`,
        respuesta: `Para seleccionar el mejor ${categoryName || 'producto'}, considera: 1) Tu presupuesto disponible, 2) El uso que le darás, 3) El espacio disponible, 4) Tus preferencias de diseño. Navega por nuestras colecciones filtradas por precio, material y características para encontrar la opción ideal.`,
      },
      {
        pregunta: `¿Cuál es la diferencia entre los distintos materiales disponibles en esta categoría?`,
        respuesta: `Ofrecemos ${categoryName || 'productos'} en diversos materiales, cada uno con sus ventajas: Los materiales naturales son ecológicos y duraderos, los sintéticos ofrecen mayor variedad de colores, y los compuestos combinan lo mejor de ambos mundos. Revisa las fichas de producto para ver especificaciones detalladas de cada material.`,
      },
      {
        pregunta: `¿Cuáles son las tendencias actuales en ${categoryName || 'esta categoría'}?`,
        respuesta: `En 2026, las tendencias principales son: 1) Sostenibilidad y materiales ecológicos, 2) Diseño minimalista y funcional, 3) Colores naturales y neutros, 4) Versatilidad y multipropósito. Explora nuestras colecciones destacadas para ver cómo combinamos estilo, funcionalidad y responsabilidad ambiental.`,
      },
    ];
  }

  /**
   * FAQs PARA PÁGINAS DE BLOG
   * Niveles 3 y 4 - Resolución de Problemas: How-to, conceptos informativos
   * Validación: Problemas concretos, conceptos técnicos, respuestas tipo "How-to"
   */
  static _generateBlogFAQs(url) {
    const postTitle = this._extractPostTitle(url);

    return [
      {
        pregunta: `¿Cuál es el paso a paso que describes en este artículo?`,
        respuesta: `Este artículo proporciona una guía detallada paso a paso sobre: ${postTitle || 'el tema tratado'}. Recomendamos leer desde el inicio, aplicar cada paso en orden, y referirse a los ejemplos prácticos incluidos. Para consultas adicionales, consulta la sección de comentarios o contacta con nuestro equipo.`,
      },
      {
        pregunta: `¿Cuáles son los conceptos técnicos clave que necesito entender?`,
        respuesta: `En este artículo abordamos conceptos fundamentales como: definiciones, procesos clave, mejores prácticas y casos de uso. Cada concepto incluye explicaciones claras y ejemplos prácticos. Si algún término no está claro, consulta nuestro glosario o deja un comentario.`,
      },
      {
        pregunta: `¿Cómo puedo aplicar estos conceptos a mi situación específica?`,
        respuesta: `Los principios descritos aquí son adaptables a múltiples contextos. Identifica los pasos que se aplican a tu caso, personaliza según tus necesidades y recursos disponibles. Si necesitas asesoramiento personalizado, nuestro equipo de expertos está disponible para ayudarte.`,
      },
    ];
  }

  /**
   * FAQs PARA PÁGINAS DE ARTÍCULOS (NEWS/ARTICLE)
   * Niveles 3 y 4 - Contenido Informativo: Aclaraciones, contexto, profundización
   */
  static _generateArticleFAQs(url) {
    return [
      {
        pregunta: `¿Cuál es el contexto principal de este artículo?`,
        respuesta: `Este artículo analiza una situación actual con implicaciones importantes para nuestro sector. Lee la introducción y la sección de contexto para entender el panorama general. Esto te ayudará a evaluar el impacto en tu área específica.`,
      },
      {
        pregunta: `¿Cuáles son los puntos clave que debo retener?`,
        respuesta: `Los aspectos más importantes son: 1) Las conclusiones principales del análisis, 2) El impacto esperado en el sector, 3) Las recomendaciones de los expertos. Revisa la sección de "Conclusiones" para un resumen ejecutivo.`,
      },
      {
        pregunta: `¿Dónde puedo encontrar más información sobre este tema?`,
        respuesta: `Al final del artículo encontrarás referencias, enlaces a recursos relacionados y sugerencias de lectura complementaria. Nuestro equipo editorial selecciona cuidadosamente fuentes confiables y actualizadas para profundizar en el tema.`,
      },
    ];
  }

  /**
   * EXTRACTORES DE CONTEXTO
   * Extrae información de la URL para personalizar las FAQs
   */
  static _extractProductName(url) {
    const match = url.match(/\/([^/]+)\/$|\/producto\/([^/]+)/i);
    if (match) {
      const name = (match[1] || match[2]).replace(/[-_]/g, ' ');
      return this._capitalizeWords(name);
    }
    return null;
  }

  static _extractCategoryName(url) {
    const match = url.match(/\/tienda\/([^/]+)\/?$|\/categoria\/([^/]+)/i);
    if (match) {
      const name = (match[1] || match[2]).replace(/[-_]/g, ' ');
      return this._capitalizeWords(name);
    }
    return null;
  }

  static _extractPostTitle(url) {
    const match = url.match(/\/([^/]+)\/?$|\/post\/([^/]+)|\/blog\/([^/]+)/i);
    if (match) {
      const name = (match[1] || match[2] || match[3]).replace(/[-_]/g, ' ');
      return this._capitalizeWords(name);
    }
    return null;
  }

  static _capitalizeWords(str) {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
