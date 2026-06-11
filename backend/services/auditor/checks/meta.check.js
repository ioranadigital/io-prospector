export const id       = 'meta';
export const label    = 'Metadatos';
export const weight   = 25; // % del score total

export function run(page) {
  return page.evaluate(() => {
    const title       = document.title?.trim() || '';
    const metaDesc    = document.querySelector('meta[name="description"]')?.content?.trim() || '';
    const ogTitle     = document.querySelector('meta[property="og:title"]')?.content?.trim() || '';
    const ogDesc      = document.querySelector('meta[property="og:description"]')?.content?.trim() || '';
    const ogImage     = document.querySelector('meta[property="og:image"]')?.content?.trim() || '';
    const canonical   = document.querySelector('link[rel="canonical"]')?.href?.trim() || '';
    const robots      = document.querySelector('meta[name="robots"]')?.content?.trim() || '';
    const noindex     = /noindex/i.test(robots);
    const lang        = document.documentElement.lang?.trim() || '';
    const charset     = document.querySelector('meta[charset]')?.getAttribute('charset') || '';
    const viewport    = document.querySelector('meta[name="viewport"]')?.content?.trim() || '';
    const twitterCard = document.querySelector('meta[name="twitter:card"]')?.content?.trim() || '';
    const favicon     = !!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

    const checks = [
      {
        id: 'meta.title.exists',
        label: 'Title existe',
        status: title ? 'pass' : 'fail',
        value: title || null,
        detail: title ? `${title.length} caracteres` : 'Sin title tag',
        fix: 'Añade un <title> único y descriptivo',
      },
      {
        id: 'meta.title.length',
        label: 'Title longitud (30-60 chars)',
        status: title.length >= 30 && title.length <= 60 ? 'pass'
               : title.length > 0 ? 'warn' : 'fail',
        value: title.length || 0,
        detail: title.length > 60 ? 'Demasiado largo (Google trunca)' : title.length < 30 ? 'Demasiado corto' : 'Longitud óptima',
        fix: 'Mantén el title entre 30 y 60 caracteres',
      },
      {
        id: 'meta.description.exists',
        label: 'Meta description existe',
        status: metaDesc ? 'pass' : 'fail',
        value: metaDesc || null,
        detail: metaDesc ? `${metaDesc.length} caracteres` : 'Sin meta description',
        fix: 'Añade una meta description descriptiva',
      },
      {
        id: 'meta.description.length',
        label: 'Meta desc longitud (120-160 chars)',
        status: metaDesc.length >= 120 && metaDesc.length <= 160 ? 'pass'
               : metaDesc.length > 0 ? 'warn' : 'fail',
        value: metaDesc.length || 0,
        detail: metaDesc.length > 160 ? 'Demasiado larga (Google trunca)' : metaDesc.length < 120 && metaDesc.length > 0 ? 'Demasiado corta' : metaDesc.length === 0 ? 'No existe' : 'Longitud óptima',
        fix: 'Mantén la meta description entre 120 y 160 caracteres',
      },
      {
        id: 'meta.canonical',
        label: 'URL Canonical',
        status: canonical ? 'pass' : 'warn',
        value: canonical || null,
        detail: canonical ? 'Canonical definido' : 'Sin canonical — riesgo de contenido duplicado',
        fix: 'Añade <link rel="canonical" href="URL"> en el <head>',
      },
      {
        id: 'meta.noindex',
        label: 'Página indexable',
        status: noindex ? 'fail' : 'pass',
        value: robots || 'index, follow',
        detail: noindex ? '¡Página marcada como noindex! Google no la indexará' : 'Indexable correctamente',
        fix: 'Elimina "noindex" del meta robots o cambia a "index, follow"',
      },
      {
        id: 'meta.og.title',
        label: 'OG Title (redes sociales)',
        status: ogTitle ? 'pass' : 'warn',
        value: ogTitle || null,
        detail: ogTitle ? 'OG title configurado' : 'Sin OG title — compartir en redes mostrará datos incorrectos',
        fix: 'Añade <meta property="og:title" content="Tu título">',
      },
      {
        id: 'meta.og.image',
        label: 'OG Image (redes sociales)',
        status: ogImage ? 'pass' : 'warn',
        value: ogImage || null,
        detail: ogImage ? 'Imagen OG configurada' : 'Sin imagen OG — las publicaciones en redes no tendrán imagen',
        fix: 'Añade <meta property="og:image" content="URL-imagen">',
      },
      {
        id: 'meta.lang',
        label: 'Idioma declarado (lang)',
        status: lang ? 'pass' : 'warn',
        value: lang || null,
        detail: lang ? `lang="${lang}"` : 'Sin atributo lang en <html>',
        fix: 'Añade lang="es" (o el idioma correspondiente) a la etiqueta <html>',
      },
      {
        id: 'meta.viewport',
        label: 'Viewport para móvil',
        status: viewport ? 'pass' : 'fail',
        value: viewport || null,
        detail: viewport ? 'Viewport configurado' : 'Sin viewport — la página no es mobile-friendly',
        fix: 'Añade <meta name="viewport" content="width=device-width, initial-scale=1">',
      },
      {
        id: 'meta.favicon',
        label: 'Favicon',
        status: favicon ? 'pass' : 'warn',
        value: favicon,
        detail: favicon ? 'Favicon detectado' : 'Sin favicon',
        fix: 'Añade <link rel="icon" href="/favicon.ico">',
      },
      {
        id: 'meta.twitter',
        label: 'Twitter Card',
        status: twitterCard ? 'pass' : 'warn',
        value: twitterCard || null,
        detail: twitterCard ? `Twitter Card: ${twitterCard}` : 'Sin Twitter Card',
        fix: 'Añade <meta name="twitter:card" content="summary_large_image">',
      },
    ];

    return checks;
  });
}
