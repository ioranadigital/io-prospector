export const id     = 'images';
export const label  = 'Imágenes';
export const weight = 15;

export function run(page) {
  return page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const total = imgs.length;
    const missingAlt   = imgs.filter(i => !i.alt?.trim()).length;
    const emptyAlt     = imgs.filter(i => i.alt?.trim() === '').length;
    const withAlt      = imgs.filter(i => i.alt?.trim().length > 0).length;
    const lazyLoaded   = imgs.filter(i => i.loading === 'lazy').length;
    const svgInline    = document.querySelectorAll('svg').length;

    // Detecta imágenes grandes por src (heurístico)
    const unoptimized = imgs.filter(i => {
      const src = i.src || '';
      return src && !src.includes('.svg') && !src.includes('data:') &&
             !src.includes('webp') && !src.includes('.avif');
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
