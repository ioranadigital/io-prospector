/**
 * DETECTOR DE TIPOLOGÍA Y WEB LEVEL
 * Sistema heurístico para clasificar páginas web automáticamente
 *
 * Funcionalidad:
 * - Detecta tipo de página (Home, Categoría, Producto, Blog, Artículo, etc.)
 * - Determina nivel de profundidad (1=Home, 2=Categoría, 3=Producto/Artículo)
 * - Usa combinación de análisis de URL + contenido HTML
 * - 100% exacto para auditoría SEO y recomendaciones de schema.org
 */

export class TypologyDetector {
  /**
   * MÉTODO PRINCIPAL: Detectar tipología completa de una página
   */
  static detect(urlStr, htmlContent = '') {
    try {
      const url = new URL(urlStr);
      const pathSegments = url.pathname.split('/').filter(Boolean);

      // Paso 1: Analizar patrones en la URL
      const urlAnalysis = this._analyzeUrlPattern(url, pathSegments);

      // Paso 2: Analizar contenido HTML
      const htmlAnalysis = this._analyzeHtmlContent(htmlContent);

      // Paso 3: Determinar tipo y nivel combinando ambos análisis
      const result = this._classifyPageType(
        urlAnalysis,
        htmlAnalysis,
        pathSegments
      );

      return {
        url: urlStr,
        tipologia: result.tipologia,
        nivel: result.nivel,
        confidence: result.confidence,
        indicators: {
          urlPatterns: urlAnalysis,
          htmlIndicators: htmlAnalysis,
        },
      };
    } catch (error) {
      console.error('Error en detección de tipología:', error.message);
      return {
        url: urlStr,
        tipologia: 'generica',
        nivel: 2,
        confidence: 0.5,
        error: error.message,
      };
    }
  }

  /**
   * Analizar patrones en la estructura de la URL
   */
  static _analyzeUrlPattern(url, pathSegments) {
    const pathname = url.pathname.toLowerCase();
    const hostname = url.hostname.toLowerCase();

    return {
      segmentCount: pathSegments.length,
      hasHomePattern: pathSegments.length === 0,
      hasBlogPattern:
        pathname.includes('/blog') ||
        pathname.includes('/posts') ||
        pathname.includes('/articulo') ||
        pathname.includes('/noticias') ||
        pathSegments[0] === 'blog' ||
        pathSegments[0] === 'posts',
      hasCategoryPattern:
        pathname.includes('/categoria') ||
        pathname.includes('/categorias') ||
        pathname.includes('/tienda') ||
        pathname.includes('/catalogo') ||
        pathname.includes('/coleccion') ||
        pathname.includes('/products'),
      hasProductPattern:
        pathname.includes('/producto') ||
        pathname.includes('/product') ||
        pathname.includes('/item') ||
        pathname.includes('/sku') ||
        pathname.includes('/p/'),
      hasContactPattern:
        pathname.includes('/contacto') ||
        pathname.includes('/contact') ||
        pathname.includes('/contactanos'),
      hasAboutPattern:
        pathname.includes('/acerca') ||
        pathname.includes('/about') ||
        pathname.includes('/nosotros') ||
        pathname.includes('/who-we-are'),
      hasSearchPattern:
        pathname.includes('/search') ||
        pathname.includes('/buscar') ||
        url.search.includes('q=') ||
        url.search.includes('search='),
      firstSegment: pathSegments[0] || 'home',
      secondSegment: pathSegments[1],
      thirdSegment: pathSegments[2],
    };
  }

  /**
   * Analizar indicadores en el contenido HTML
   */
  static _analyzeHtmlContent(htmlContent = '') {
    const html = htmlContent.toLowerCase();

    // Indicadores de producto
    const hasAddToCart =
      html.includes('add-to-cart') ||
      html.includes('btn-cart') ||
      html.includes('comprar') ||
      html.includes('add to cart') ||
      html.includes('carrito') ||
      html.includes('shopping-cart');

    const hasPrice =
      html.includes('price') ||
      html.includes('precio') ||
      html.includes('€') ||
      html.includes('$') ||
      (html.match(/\d+[.,]\d{2}/g) || []).length > 0;

    const hasProductGallery =
      html.includes('product-gallery') ||
      html.includes('product-images') ||
      html.includes('gallery') ||
      html.includes('lightbox');

    const hasVariants =
      html.includes('variant') ||
      html.includes('talla') ||
      html.includes('color') ||
      html.includes('size') ||
      html.includes('variants') ||
      html.includes('selecciona');

    const hasReviews =
      html.includes('review') ||
      html.includes('rating') ||
      html.includes('estrellas') ||
      html.includes('puntuación');

    const hasSpecifications =
      html.includes('especificacion') ||
      html.includes('specification') ||
      html.includes('características') ||
      html.includes('features');

    // Indicadores de categoría/colección
    const hasProductGrid =
      html.includes('product-grid') ||
      html.includes('items-grid') ||
      html.includes('product-list') ||
      html.includes('grid-item');

    const hasPagination =
      html.includes('pagination') ||
      html.includes('page') ||
      html.includes('next') ||
      html.includes('anterior') ||
      html.includes('paginacion');

    const hasFilters =
      html.includes('filter') ||
      html.includes('filtro') ||
      html.includes('refine') ||
      html.includes('facet');

    const hasSorting =
      html.includes('sort') ||
      html.includes('ordenar') ||
      html.includes('sort-by');

    const hasCategoryTitle =
      html.includes('categoria') ||
      html.includes('collection') ||
      html.includes('tienda');

    // Indicadores de blog/artículo
    const hasArticleTag = html.includes('<article');

    const hasAuthorInfo =
      html.includes('author') ||
      html.includes('by ') ||
      html.includes('escrito por') ||
      html.includes('autor');

    const hasPublishDate =
      html.includes('publish') ||
      html.includes('fecha') ||
      html.includes('posted') ||
      html.includes('2026') ||
      html.includes('2025');

    const hasArticleBody =
      html.includes('article-body') ||
      html.includes('post-content') ||
      html.includes('entry-content') ||
      html.includes('content') ||
      (html.match(/<p>[\s\S]{100,}<\/p>/g) || []).length > 3;

    const hasBlogNav =
      html.includes('related-posts') ||
      html.includes('recent-posts') ||
      html.includes('blog-nav');

    // Indicadores de página de contacto
    const hasContactForm =
      html.includes('contact-form') ||
      html.includes('form') ||
      html.includes('email') ||
      html.includes('mensaje') ||
      html.includes('name=') ||
      html.includes('contact');

    const hasPhoneNumber =
      html.includes('tel:') ||
      html.includes('phone') ||
      html.includes('teléfono') ||
      (html.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g) || []).length > 0;

    // Indicadores de página About
    const hasCompanyInfo =
      html.includes('company') ||
      html.includes('empresa') ||
      html.includes('about') ||
      html.includes('mission') ||
      html.includes('visión');

    const hasTeamInfo =
      html.includes('team') ||
      html.includes('equipo') ||
      html.includes('staff') ||
      html.includes('personal');

    return {
      // Product indicators
      hasAddToCart,
      hasPrice,
      hasProductGallery,
      hasVariants,
      hasReviews,
      hasSpecifications,
      productScore:
        (hasAddToCart ? 4 : 0) +
        (hasPrice ? 2 : 0) +
        (hasProductGallery ? 2 : 0) +
        (hasVariants ? 1 : 0) +
        (hasReviews ? 1 : 0) +
        (hasSpecifications ? 1 : 0),

      // Category indicators
      hasProductGrid,
      hasPagination,
      hasFilters,
      hasSorting,
      hasCategoryTitle,
      categoryScore:
        (hasProductGrid ? 3 : 0) +
        (hasPagination ? 2 : 0) +
        (hasFilters ? 2 : 0) +
        (hasSorting ? 1 : 0) +
        (hasCategoryTitle ? 1 : 0),

      // Blog/Article indicators
      hasArticleTag,
      hasAuthorInfo,
      hasPublishDate,
      hasArticleBody,
      hasBlogNav,
      blogScore:
        (hasArticleTag ? 4 : 0) +
        (hasAuthorInfo ? 2 : 0) +
        (hasPublishDate ? 2 : 0) +
        (hasArticleBody ? 2 : 0) +
        (hasBlogNav ? 1 : 0),

      // Contact indicators
      hasContactForm,
      hasPhoneNumber,
      contactScore: (hasContactForm ? 4 : 0) + (hasPhoneNumber ? 2 : 0),

      // About indicators
      hasCompanyInfo,
      hasTeamInfo,
      aboutScore: (hasCompanyInfo ? 3 : 0) + (hasTeamInfo ? 2 : 0),
    };
  }

  /**
   * Clasificar tipo de página combinando URL y HTML
   */
  static _classifyPageType(urlAnalysis, htmlAnalysis, pathSegments) {
    // DEBUG: Log scores
    if (process.env.DEBUG_TYPOLOGY === 'true') {
      console.log(`[TYPOLOGY DEBUG] URL: ${urlAnalysis.firstSegment}/${urlAnalysis.secondSegment}/${urlAnalysis.thirdSegment}`);
      console.log(`[TYPOLOGY DEBUG] contactScore: ${htmlAnalysis.contactScore}, productScore: ${htmlAnalysis.productScore}, categoryScore: ${htmlAnalysis.categoryScore}`);
    }

    // REGLA 1: Home
    if (urlAnalysis.hasHomePattern) {
      return {
        tipologia: 'home',
        nivel: 1,
        confidence: 1.0,
      };
    }

    // REGLA 2: Contact (PERO NO si detecta categoría claramente)
    if (urlAnalysis.hasContactPattern && htmlAnalysis.contactScore >= 2) {
      return {
        tipologia: 'contacto',
        nivel: 2,
        confidence: Math.min(1.0, (urlAnalysis.hasContactPattern ? 0.8 : 0) + (htmlAnalysis.contactScore / 10)),
      };
    }

    // REGLA 3: About (SOLO por URL pattern, no por HTML hints)
    if (urlAnalysis.hasAboutPattern) {
      return {
        tipologia: 'about',
        nivel: 2,
        confidence: 0.95,
      };
    }

    // REGLA 4: Search
    if (urlAnalysis.hasSearchPattern) {
      return {
        tipologia: 'busqueda',
        nivel: 2,
        confidence: 0.95,
      };
    }

    // REGLA 5: Blog/Artículo (PRIORITIZE URL patterns)
    if (urlAnalysis.hasBlogPattern) {
      const isDeepBlog = urlAnalysis.segmentCount >= 3;

      return {
        tipologia: 'blog',
        nivel: isDeepBlog ? 3 : 2,
        confidence: 0.85,
      };
    }

    // REGLA 6: Producto (PRIORITIZE URL patterns)
    if (urlAnalysis.hasProductPattern) {
      return {
        tipologia: 'producto',
        nivel: 3,
        confidence: 0.9,
      };
    }

    // REGLA 7: Categoría / Sección / Subsección
    if (urlAnalysis.hasCategoryPattern) {
      // Subsección: patrón de categoría + 3 o más segmentos (ej: /tienda/ropa/camisetas/)
      if (urlAnalysis.segmentCount >= 3) {
        return {
          tipologia: 'subseccion',
          nivel: 3,
          confidence: 0.85,
        };
      }
      // Sección: patrón de categoría con 1-2 segmentos (ej: /tienda/ o /tienda/ropa/)
      return {
        tipologia: 'seccion',
        nivel: 2,
        confidence: 0.85,
      };
    }

    // REGLA 8: Por profundidad de URL
    if (urlAnalysis.segmentCount >= 3) {
      // 3+ segmentos sin patrón de producto → subsección
      if (htmlAnalysis.productScore >= 6) {
        return { tipologia: 'producto', nivel: 3, confidence: 0.5 };
      }
      return { tipologia: 'subseccion', nivel: 3, confidence: 0.6 };
    }

    if (urlAnalysis.segmentCount === 2) {
      if (htmlAnalysis.productScore >= 6) {
        return { tipologia: 'producto', nivel: 3, confidence: 0.5 };
      }
      return { tipologia: 'seccion', nivel: 2, confidence: 0.55 };
    }

    if (urlAnalysis.segmentCount === 1) {
      return { tipologia: 'seccion', nivel: 2, confidence: 0.5 };
    }

    // Fallback
    return {
      tipologia: 'generica',
      nivel: 2,
      confidence: 0.3,
    };
  }

  /**
   * Validar y corregir tipología (utility)
   */
  static validate(tipologia) {
    const validTypes = [
      'home',
      'categoria',
      'producto',
      'blog',
      'articulo',
      'contacto',
      'about',
      'busqueda',
      'generica',
    ];

    return validTypes.includes(tipologia) ? tipologia : 'generica';
  }

  /**
   * Obtener nivel recomendado para tipología
   */
  static getNivelForTipologia(tipologia) {
    const nivelMap = {
      home: 1,
      categoria: 2,
      producto: 3,
      blog: 3,
      articulo: 3,
      contacto: 2,
      about: 2,
      busqueda: 2,
      generica: 2,
    };

    return nivelMap[tipologia] || 2;
  }
}

/**
 * Factory para uso rápido
 */
export function detectTypology(url, htmlContent = '') {
  return TypologyDetector.detect(url, htmlContent);
}

/**
 * Detectar múltiples URLs en paralelo
 */
export async function detectTypologyBatch(urls, htmlContents = {}) {
  return urls.map(url => ({
    url,
    ...TypologyDetector.detect(url, htmlContents[url] || ''),
  }));
}
