/**
 * MOTOR DE REVISIÓN Y AUDITORÍA TÉCNICA/SEMÁNTICA
 * io-Semántico - Auditor de Arquitectura de Información y Datos Estructurados
 *
 * Función: Evaluar la arquitectura de la URL y dictar reglas de FAQs y Schema Markup
 * Salida: Informe JSON estructurado con requisitos (NO contenido generado)
 */

export class SchemaAuditEngine {
  /**
   * MÉTODO PRINCIPAL: Auditar URL y generar informe de requisitos
   */
  static auditUrl(url, analyzedSchemas = [], pageType = 'GENERIC_PAGE') {
    const faqs_review = this._auditFAQs(pageType);
    const schema_review = this._auditSchemas(pageType, analyzedSchemas);

    return {
      url_analizada: url,
      tipologia_detectada: this._mapPageTypeToSpanish(pageType),
      faqs_review,
      schema_review,
    };
  }

  /**
   * REGLA DE REVISIÓN 1: AUDITORÍA Y ESTRUCTURACIÓN DE FAQs
   */
  static _auditFAQs(pageType) {
    // FILTRO DE EXCLUSIÓN CRÍTICO
    const excludedTypes = ['HOME_PAGE', 'CONTACT_PAGE', 'ABOUT_PAGE'];

    if (excludedTypes.includes(pageType)) {
      return {
        requiere_faqs: false,
        enfoque_semantico_obligatorio: 'EXCLUIDO - Tipología prohibida para FAQs',
        faqs_required: [],
      };
    }

    // DIRECTRIZ POR TIPOLOGÍA
    const faqsConfig = {
      SECTION_PAGE: {
        requiere_faqs: true,
        enfoque_semantico_obligatorio: 'Criterios de elección de la sección, beneficios de la gama, guías de compra (Niveles 1 y 4)',
        faqs_required: [
          { numero: 1, intencion_pregunta: 'Guía de elección dentro de la sección', keywords_del_cliente_a_incluir: ['cómo elegir', 'qué es', 'diferencias'], nivel_seo: 'Nivel 1 - Información General' },
          { numero: 2, intencion_pregunta: 'Características y ventajas de la gama', keywords_del_cliente_a_incluir: ['características', 'ventajas', 'tipos'], nivel_seo: 'Nivel 4 - Profundización' },
          { numero: 3, intencion_pregunta: 'Comparativa de opciones dentro de la sección', keywords_del_cliente_a_incluir: ['comparativa', 'mejor', 'diferencias entre'], nivel_seo: 'Nivel 1 - Información General' },
        ],
      },
      SUBSECTION_PAGE: {
        requiere_faqs: true,
        enfoque_semantico_obligatorio: 'Consultas específicas de la subcategoría, dudas de compra, diferencias dentro del nicho (Niveles 3 y 5)',
        faqs_required: [
          { numero: 1, intencion_pregunta: 'Especificidad de la subcategoría: qué incluye y qué diferencia a estos productos', keywords_del_cliente_a_incluir: ['qué son', 'diferencia', 'subcategoría'], nivel_seo: 'Nivel 3 - Solución de Problemas' },
          { numero: 2, intencion_pregunta: 'Criterios de selección avanzados dentro del nicho', keywords_del_cliente_a_incluir: ['cómo elegir', 'criterios', 'mejor opción'], nivel_seo: 'Nivel 5 - Transaccional' },
          { numero: 3, intencion_pregunta: 'Dudas habituales de compra en esta subcategoría', keywords_del_cliente_a_incluir: ['precio', 'calidad', 'qué comprar'], nivel_seo: 'Nivel 5 - Transaccional' },
        ],
      },
      CATEGORY_PAGE: {
        requiere_faqs: true,
        enfoque_semantico_obligatorio: 'Criterios de elección de gama, materiales, tendencias del sector (Niveles 1 y 4)',
        faqs_required: [
          {
            numero: 1,
            intencion_pregunta: 'Guía de elección y criterios de selección de la gama',
            keywords_del_cliente_a_incluir: ['cómo elegir', 'diferencias', 'criterios'],
            nivel_seo: 'Nivel 1 - Información General',
          },
          {
            numero: 2,
            intencion_pregunta: 'Características técnicas y diferencias de materiales',
            keywords_del_cliente_a_incluir: ['materiales', 'características', 'especificaciones'],
            nivel_seo: 'Nivel 4 - Profundización',
          },
          {
            numero: 3,
            intencion_pregunta: 'Tendencias actuales y mejores prácticas del sector',
            keywords_del_cliente_a_incluir: ['tendencias', 'novedades', 'sector'],
            nivel_seo: 'Nivel 1 - Información General',
          },
        ],
      },
      PRODUCT_PAGE: {
        requiere_faqs: true,
        enfoque_semantico_obligatorio: 'Conversión pura: especificaciones técnicas, tallajes, envíos, estado, garantías (Nivel 5 - Transaccional)',
        faqs_required: [
          {
            numero: 1,
            intencion_pregunta: 'Especificaciones técnicas exactas del producto',
            keywords_del_cliente_a_incluir: ['especificaciones', 'dimensiones', 'técnicas'],
            nivel_seo: 'Nivel 5 - Transaccional',
          },
          {
            numero: 2,
            intencion_pregunta: 'Política de envío, devolución y garantía',
            keywords_del_cliente_a_incluir: ['envío', 'devolución', 'garantía', 'plazo'],
            nivel_seo: 'Nivel 5 - Transaccional',
          },
          {
            numero: 3,
            intencion_pregunta: 'Tallaje, disponibilidad y estado del artículo',
            keywords_del_cliente_a_incluir: ['talla', 'disponibilidad', 'estado', 'condición'],
            nivel_seo: 'Nivel 5 - Transaccional',
          },
        ],
      },
      BLOG_PAGE: {
        requiere_faqs: true,
        enfoque_semantico_obligatorio: 'Resolución de problemas, dudas informativos secundarias, respuestas How-to (Niveles 3 y 4)',
        faqs_required: [
          {
            numero: 1,
            intencion_pregunta: 'Paso a paso o procedimiento descrito en el artículo',
            keywords_del_cliente_a_incluir: ['cómo', 'paso a paso', 'tutorial', 'guía'],
            nivel_seo: 'Nivel 3 - Solución de Problemas',
          },
          {
            numero: 2,
            intencion_pregunta: 'Conceptos técnicos clave o términos fundamentales',
            keywords_del_cliente_a_incluir: ['concepto', 'definición', 'técnico', 'explicación'],
            nivel_seo: 'Nivel 4 - Profundización',
          },
          {
            numero: 3,
            intencion_pregunta: 'Aplicación práctica o casos de uso',
            keywords_del_cliente_a_incluir: ['aplicación', 'caso', 'ejemplo', 'cómo aplicar'],
            nivel_seo: 'Nivel 3 - Solución de Problemas',
          },
        ],
      },
      ARTICLE_PAGE: {
        requiere_faqs: true,
        enfoque_semantico_obligatorio: 'Aclaraciones, contexto y profundización informativa (Niveles 3 y 4)',
        faqs_required: [
          {
            numero: 1,
            intencion_pregunta: 'Contexto general y situación actual',
            keywords_del_cliente_a_incluir: ['contexto', 'antecedentes', 'situación', 'actualidad'],
            nivel_seo: 'Nivel 4 - Profundización',
          },
          {
            numero: 2,
            intencion_pregunta: 'Puntos clave y conclusiones del artículo',
            keywords_del_cliente_a_incluir: ['puntos clave', 'conclusión', 'resumen', 'principal'],
            nivel_seo: 'Nivel 4 - Profundización',
          },
          {
            numero: 3,
            intencion_pregunta: 'Recursos adicionales y referencias',
            keywords_del_cliente_a_incluir: ['referencias', 'recursos', 'más información', 'enlaces'],
            nivel_seo: 'Nivel 1 - Información General',
          },
        ],
      },
    };

    return faqsConfig[pageType] || {
      requiere_faqs: false,
      enfoque_semantico_obligatorio: 'No aplica para esta tipología',
      faqs_required: [],
    };
  }

  /**
   * REGLA DE REVISIÓN 2: AUDITORÍA DE SCHEMAS Y JSON-LD
   */
  static _auditSchemas(pageType, analyzedSchemas = []) {
    const schemasConfig = {
      HOME_PAGE: {
        esquemas_must_have: ['LocalBusiness', 'WebSite', 'Organization'],
        descripcion: 'Página de inicio: Requiere entidad local con datos de contacto, sitio web con buscador y organización corporativa',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'LocalBusiness',
              '@id': 'local-business-home',
              name: '[Nombre del Negocio]',
              image: '[URL Logo/Imagen]',
              description: '[Descripción corta del negocio]',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '[Calle y número]',
                addressLocality: '[Ciudad]',
                addressRegion: '[Comunidad Autónoma]',
                postalCode: '[CP]',
                addressCountry: 'ES',
              },
              telephone: '[Teléfono]',
              email: '[Email de contacto]',
              areaServed: [
                {
                  '@type': 'State',
                  name: '[Región 1, ej. Asturias]',
                },
                {
                  '@type': 'State',
                  name: '[Región 2, ej. Galicia]',
                },
              ],
              url: '[URL del sitio]',
              sameAs: ['[LinkedIn]', '[Google Business]'],
            },
            {
              '@type': 'WebSite',
              '@id': 'website-home',
              name: '[Nombre del Sitio Web]',
              url: '[URL del sitio]',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: '[URL del buscador]?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'Organization',
              '@id': 'organization-home',
              name: '[Nombre de la Organización]',
              logo: '[URL Logo]',
              url: '[URL del sitio]',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                telephone: '[Teléfono]',
                email: '[Email]',
              },
            },
          ],
        },
      },
      SECTION_PAGE: {
        esquemas_must_have: ['CollectionPage', 'ItemList', 'BreadcrumbList', 'WebSite'],
        descripcion: 'Sección principal: Colección raíz de contenido. Breadcrumb desde home + ItemList de subcategorías o productos.',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'CollectionPage', '@id': 'section-page', name: '[Nombre de la Sección]', description: '[Descripción]', url: '[URL Sección]', mainEntity: { '@id': 'itemlist-section' } },
            { '@type': 'ItemList', '@id': 'itemlist-section', name: '[Lista de la Sección]', numberOfItems: '[N]', itemListElement: [ { '@type': 'ListItem', position: 1, url: '[URL item]', name: '[Nombre item]' } ] },
            { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Inicio', item: '[URL Home]' }, { '@type': 'ListItem', position: 2, name: '[Sección]', item: '[URL Sección]' } ] },
            { '@type': 'WebSite', name: '[Sitio Web]', url: '[URL]' },
          ],
        },
      },
      SUBSECTION_PAGE: {
        esquemas_must_have: ['CollectionPage', 'BreadcrumbList', 'ItemList'],
        descripcion: 'Subsección: Requiere BreadcrumbList con jerarquía completa (Inicio > Sección > Subsección) para que Google muestre la ruta en SERP.',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'CollectionPage', '@id': 'subsection-page', name: '[Nombre de la Subsección]', description: '[Descripción]', url: '[URL Subsección]', isPartOf: { '@id': '[URL Sección Padre]' }, mainEntity: { '@id': 'itemlist-sub' } },
            { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Inicio', item: '[URL Home]' }, { '@type': 'ListItem', position: 2, name: '[Sección]', item: '[URL Sección]' }, { '@type': 'ListItem', position: 3, name: '[Subsección]', item: '[URL Subsección]' } ] },
            { '@type': 'ItemList', '@id': 'itemlist-sub', name: '[Lista Subsección]', numberOfItems: '[N]', itemListElement: [ { '@type': 'ListItem', position: 1, url: '[URL Producto]', name: '[Nombre Producto]' } ] },
          ],
        },
      },
      CATEGORY_PAGE: {
        esquemas_must_have: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
        descripcion: 'Página de categoría: Requiere estructura de colección con lista de productos y navegación',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': 'collection-category',
              name: '[Nombre de la Categoría]',
              description: '[Descripción de la categoría]',
              url: '[URL de la categoría]',
              mainEntity: {
                '@id': 'itemlist-category',
              },
            },
            {
              '@type': 'ItemList',
              '@id': 'itemlist-category',
              name: '[Nombre de la Colección]',
              numberOfItems: '[Cantidad de productos]',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  url: '[URL Producto 1]',
                  name: '[Nombre Producto 1]',
                  image: '[Imagen Producto 1]',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  url: '[URL Producto 2]',
                  name: '[Nombre Producto 2]',
                  image: '[Imagen Producto 2]',
                },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              '@id': 'breadcrumb-category',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Inicio',
                  item: '[URL Home]',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: '[Nombre Categoría]',
                  item: '[URL Categoría]',
                },
              ],
            },
          ],
        },
      },
      PRODUCT_PAGE: {
        esquemas_must_have: ['Product', 'Offer', 'AggregateRating', 'BreadcrumbList'],
        descripcion: 'Página de producto: Requiere datos comerciales con precio, disponibilidad, condición y ratings',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Product',
              '@id': 'product-main',
              name: '[Nombre del Producto]',
              description: '[Descripción completa del producto]',
              image: '[URL Imagen Principal]',
              brand: {
                '@type': 'Brand',
                name: '[Marca del Producto]',
              },
              sku: '[SKU]',
              offers: {
                '@type': 'Offer',
                price: '[Precio]',
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
                url: '[URL del Producto]',
                seller: {
                  '@type': 'Organization',
                  name: '[Nombre de la Tienda]',
                },
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '[Valor medio]',
                reviewCount: '[Cantidad de reseñas]',
                bestRating: '5',
                worstRating: '1',
              },
            },
            {
              '@type': 'BreadcrumbList',
              '@id': 'breadcrumb-product',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Inicio',
                  item: '[URL Home]',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: '[Categoría]',
                  item: '[URL Categoría]',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: '[Nombre Producto]',
                  item: '[URL Producto]',
                },
              ],
            },
          ],
        },
      },
      BLOG_PAGE: {
        esquemas_must_have: ['BlogPosting', 'Author', 'Organization'],
        descripcion: 'Página de blog: Requiere metadatos editoriales, autoría verificada y fechas de publicación',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              '@id': 'blog-post',
              headline: '[Título del Artículo]',
              description: '[Descripción corta]',
              image: '[URL Imagen Principal]',
              datePublished: '[Fecha Publicación YYYY-MM-DD]',
              dateModified: '[Fecha Última Modificación YYYY-MM-DD]',
              articleBody: '[Contenido del artículo...]',
              author: {
                '@type': 'Person',
                name: '[Nombre del Autor]',
                url: '[URL Perfil Autor]',
                sameAs: ['[LinkedIn Autor]', '[Twitter Autor]'],
              },
              publisher: {
                '@type': 'Organization',
                name: '[Nombre del Sitio]',
                logo: '[URL Logo]',
              },
            },
          ],
        },
      },
      ARTICLE_PAGE: {
        esquemas_must_have: ['NewsArticle', 'Author', 'Organization'],
        descripcion: 'Página de artículo: Requiere estructura NewsArticle con autoría e información editorial',
        schema_json_ld_template: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'NewsArticle',
              '@id': 'news-article',
              headline: '[Titular]',
              description: '[Descripción del artículo]',
              image: '[URL Imagen]',
              datePublished: '[Fecha Publicación YYYY-MM-DD]',
              dateModified: '[Fecha Última Modificación YYYY-MM-DD]',
              author: {
                '@type': 'Person',
                name: '[Nombre del Periodista]',
                url: '[URL Perfil]',
              },
              publisher: {
                '@type': 'Organization',
                name: '[Medio de Comunicación]',
                logo: '[URL Logo]',
              },
              articleBody: '[Cuerpo del artículo...]',
            },
          ],
        },
      },
    };

    const config = schemasConfig[pageType] || {
      esquemas_must_have: [],
      descripcion: 'Página genérica',
      schema_json_ld_template: {
        '@context': 'https://schema.org',
        '@graph': [],
      },
    };

    // Identificar schemas faltantes
    const foundSchemaTypes = analyzedSchemas.map(s => s.type || s['@type']);
    const missing_schemas = config.esquemas_must_have.filter(
      schema => !foundSchemaTypes.includes(schema)
    );

    return {
      esquemas_must_have: config.esquemas_must_have,
      esquemas_encontrados: foundSchemaTypes,
      esquemas_faltantes: missing_schemas,
      descripcion: config.descripcion,
      schema_json_ld_template: config.schema_json_ld_template,
    };
  }

  /**
   * Mapear tipo de página a español
   */
  static _mapPageTypeToSpanish(pageType) {
    const mapping = {
      HOME_PAGE: 'home',
      SECTION_PAGE: 'sección',
      SUBSECTION_PAGE: 'subsección',
      CATEGORY_PAGE: 'sección',   // legacy
      PRODUCT_PAGE: 'producto',
      BLOG_PAGE: 'blog',
      ARTICLE_PAGE: 'artículo',
      CONTACT_PAGE: 'contacto',
      ABOUT_PAGE: 'about',
      GENERIC_PAGE: 'genérica',
    };
    return mapping[pageType] || 'genérica';
  }
}
