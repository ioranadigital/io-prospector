export const id     = 'schema';
export const label  = 'Datos Estructurados';
export const weight = 12;

export function run(page) {
  return page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const schemas = [];
    const errors = [];

    scripts.forEach((script, idx) => {
      try {
        const data = JSON.parse(script.textContent);
        const schemaType = data['@type'] || data.type || 'Unknown';

        if (data['@graph'] && Array.isArray(data['@graph'])) {
          data['@graph'].forEach(item => {
            schemas.push({
              type: item['@type'] || item.type || 'Unknown',
              data: item,
            });
          });
        } else {
          schemas.push({ type: schemaType, data });
        }
      } catch (err) {
        errors.push({ index: idx, error: err.message });
      }
    });

    const checks = [];

    // Check 1: Presencia de schema
    checks.push({
      id: 'schema.present',
      label: 'Presencia de Schema.org',
      status: schemas.length > 0 ? 'pass' : 'fail',
      value: schemas.length,
      detail: schemas.length > 0
        ? `${schemas.length} schema(s) detectado(s): ${[...new Set(schemas.map(s => s.type))].join(', ')}`
        : 'Sin Schema.org JSON-LD detectado',
      fix: 'Implementa al menos Schema.org/LocalBusiness o /Product según tu negocio',
    });

    // Check 2: JSON válido
    if (errors.length > 0) {
      checks.push({
        id: 'schema.valid-json',
        label: 'JSON-LD válido',
        status: 'fail',
        value: `${errors.length} error(es)`,
        detail: errors.map((e, i) => `Script ${e.index}: ${e.error}`).join('; '),
        fix: 'Valida el JSON-LD con https://jsonlint.com o en la consola del navegador',
      });
    } else if (scripts.length > 0) {
      checks.push({
        id: 'schema.valid-json',
        label: 'JSON-LD válido',
        status: 'pass',
        value: `${scripts.length} script(s)`,
        detail: 'Todo el JSON-LD es válido',
        fix: null,
      });
    }

    // Check 3: LocalBusiness (si existe)
    const localBusiness = schemas.find(s => s.type === 'LocalBusiness');
    if (localBusiness) {
      const required = ['name', 'telephone', 'address'];
      const missing = required.filter(f => !localBusiness.data[f]);

      checks.push({
        id: 'schema.local-business-complete',
        label: 'LocalBusiness completo',
        status: missing.length === 0 ? 'pass' : missing.length < 2 ? 'warn' : 'fail',
        value: `${required.length - missing.length}/${required.length}`,
        detail: missing.length === 0
          ? 'LocalBusiness tiene campos críticos'
          : `Faltan: ${missing.join(', ')}`,
        fix: missing.length > 0 ? `Agrega: ${missing.join(', ')}` : null,
      });

      // Check geo
      checks.push({
        id: 'schema.local-business-geo',
        label: 'LocalBusiness con coordenadas',
        status: localBusiness.data.geo ? 'pass' : 'warn',
        value: localBusiness.data.geo ? 'Sí' : 'No',
        detail: localBusiness.data.geo
          ? 'Coordenadas geográficas presentes'
          : 'Sin coordenadas (mejora SEO Local)',
        fix: localBusiness.data.geo ? null : 'Agrega "geo": { "@type": "GeoCoordinates", "latitude": X, "longitude": Y }',
      });

      // Check opening hours
      checks.push({
        id: 'schema.local-business-hours',
        label: 'Horario de apertura',
        status: localBusiness.data.openingHoursSpecification ? 'pass' : 'warn',
        value: localBusiness.data.openingHoursSpecification ? 'Sí' : 'No',
        detail: localBusiness.data.openingHoursSpecification
          ? 'Horarios definidos'
          : 'Sin horarios (importante para rich snippets)',
        fix: localBusiness.data.openingHoursSpecification ? null : 'Agrega openingHoursSpecification con días y horarios',
      });
    }

    // Check 4: Product (si existe)
    const product = schemas.find(s => s.type === 'Product');
    if (product) {
      const required = ['name', 'price'];
      const missing = required.filter(f => !product.data[f]);

      checks.push({
        id: 'schema.product-complete',
        label: 'Product schema completo',
        status: missing.length === 0 ? 'pass' : 'fail',
        value: `${required.length - missing.length}/${required.length}`,
        detail: missing.length === 0
          ? 'Product tiene campos críticos'
          : `Faltan: ${missing.join(', ')}`,
        fix: missing.length > 0 ? `Agrega: ${missing.join(', ')}` : null,
      });

      // Check rating
      checks.push({
        id: 'schema.product-rating',
        label: 'Product con rating',
        status: product.data.aggregateRating ? 'pass' : 'warn',
        value: product.data.aggregateRating ? 'Sí' : 'No',
        detail: product.data.aggregateRating
          ? 'Rating presente'
          : 'Sin rating (reduce CTR en SERP)',
        fix: product.data.aggregateRating ? null : 'Agrega aggregateRating con ratingValue y ratingCount',
      });
    }

    // Check 5: FAQPage
    const faqPage = schemas.find(s => s.type === 'FAQPage');
    if (faqPage) {
      const faqItems = faqPage.data.mainEntity?.length || 0;
      checks.push({
        id: 'schema.faq-present',
        label: 'FAQPage schema',
        status: faqItems > 0 ? 'pass' : 'warn',
        value: `${faqItems} preguntas`,
        detail: faqItems > 0
          ? `${faqItems} FAQs detectadas`
          : 'FAQPage sin mainEntity',
        fix: faqItems > 0 ? null : 'Estructura: { "mainEntity": [{ "question": "...", "acceptedAnswer": { "text": "..." } }] }',
      });
    }

    // Check 6: Recomendación general
    if (schemas.length === 0) {
      checks.push({
        id: 'schema.recommendation',
        label: 'Esquema recomendado',
        status: 'info',
        value: 'Sin schema',
        detail: 'Implementa Schema.org para mejorar visibilidad en Google',
        fix: 'Usa el tipo apropiado: LocalBusiness (tiendas), Product (e-commerce), FAQPage (FAQs)',
      });
    }

    return checks;
  });
}
