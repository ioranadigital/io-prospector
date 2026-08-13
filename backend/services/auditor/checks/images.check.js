export const id     = 'images';
export const label  = 'Imágenes';
export const weight = 15;

export function run(page, ctx = {}) {
  // Content-Type real capturado en auditor/index.js vía page.on('response') —
  // se pasa como array de [url, contentType] porque es lo que cruza sin
  // ambigüedad la frontera page.evaluate() (browser realm).
  const contentTypeEntries = ctx.imageContentTypes ? [...ctx.imageContentTypes.entries()] : [];

  return page.evaluate((contentTypeEntries) => {
    const contentTypes = new Map(contentTypeEntries);
    const imgs = [...document.querySelectorAll('img')];
    const total = imgs.length;
    const missingAlt   = imgs.filter(i => !i.alt?.trim()).length;
    const emptyAlt     = imgs.filter(i => i.alt?.trim() === '').length;
    const withAlt      = imgs.filter(i => i.alt?.trim().length > 0).length;
    const lazyLoaded   = imgs.filter(i => i.loading === 'lazy').length;
    const svgInline    = document.querySelectorAll('svg').length;

    // Formato real vía Content-Type de red cuando está disponible — evita el
    // falso "no optimizado" de CDNs que sirven WebP sin ".webp" en la URL
    // (Cloudflare Polish, imgix con format=auto...). Si no se capturó la
    // respuesta (imagen cacheada, data URI), cae al heurístico por extensión.
    const MODERN_TYPES = ['image/webp', 'image/avif'];
    const unoptimized = imgs.filter(i => {
      const src = i.src || '';
      if (!src || src.startsWith('data:') || src.includes('.svg')) return false;
      const contentType = contentTypes.get(src);
      if (contentType) return !MODERN_TYPES.includes(contentType.split(';')[0].trim());
      return !src.includes('webp') && !src.includes('.avif');
    }).length;

    const checks = [
      {
        id: 'images.alt.missing',
        label: 'Imágenes con alt text',
        status: missingAlt === 0 ? 'pass' : missingAlt <= 2 ? 'warn' : 'fail',
        value: `${withAlt}/${total}`,
        detail: missingAlt > 0 ? `${missingAlt} imagen(es) sin alt text — Google no puede leerlas` : 'Todas las imágenes tienen alt',
        fix: 'Añade alt descriptivos a todas las imágenes: <img alt="descripción de la imagen">',
      },
      {
        id: 'images.lazy',
        label: 'Lazy loading activado',
        status: total === 0 ? 'pass' : lazyLoaded > 0 ? 'pass' : 'warn',
        value: `${lazyLoaded}/${total}`,
        detail: lazyLoaded > 0 ? `${lazyLoaded} de ${total} imágenes con lazy loading` : 'Ninguna imagen usa lazy loading — impacto en velocidad',
        fix: 'Añade loading="lazy" a las imágenes fuera del viewport inicial',
      },
      {
        id: 'images.format',
        label: 'Formato moderno (WebP/AVIF)',
        status: total === 0 ? 'pass' : unoptimized === 0 ? 'pass' : unoptimized <= total / 2 ? 'warn' : 'fail',
        value: `${total - unoptimized}/${total} modernos`,
        detail: unoptimized > 0 ? `${unoptimized} imagen(es) no usan WebP/AVIF — archivos más pesados` : 'Formatos modernos detectados',
        fix: 'Convierte imágenes a WebP o AVIF para reducir tamaño hasta un 30%',
      },
      {
        id: 'images.total',
        label: 'Cantidad de imágenes',
        status: total <= 30 ? 'pass' : total <= 60 ? 'warn' : 'fail',
        value: total,
        detail: `${total} imágenes en la página`,
        fix: total > 30 ? 'Demasiadas imágenes — considera usar CSS o sprites' : null,
      },
    ];

    return checks;
  });
}
