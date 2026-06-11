export const id     = 'performance';
export const label  = 'Velocidad & Performance';
export const weight = 20;

// Nota: esta función recibe métricas ya medidas fuera del evaluate (TTFB, LCP, CLS)
export function run(page, { ttfb, lcp, cls, fcp, domSize, resourceCount }) {
  return page.evaluate(({ ttfb, lcp, cls, fcp, domSize, resourceCount }) => {
    const scripts     = document.querySelectorAll('script[src]').length;
    const cssFiles    = document.querySelectorAll('link[rel="stylesheet"]').length;
    const totalLinks  = document.querySelectorAll('a').length;

    const checks = [
      {
        id: 'perf.ttfb',
        label: 'TTFB (Time to First Byte)',
        status: ttfb === null ? 'info' : ttfb < 200 ? 'pass' : ttfb < 500 ? 'warn' : 'fail',
        value: ttfb !== null ? `${ttfb}ms` : null,
        detail: ttfb === null ? 'No medido' : ttfb < 200 ? `${ttfb}ms — Excelente` : ttfb < 500 ? `${ttfb}ms — Mejorable` : `${ttfb}ms — Lento (servidor lento o sin caché)`,
        fix: 'Activa caché del servidor, usa CDN, o mejora el hosting',
      },
      {
        id: 'perf.lcp',
        label: 'LCP (Largest Contentful Paint)',
        status: lcp === null ? 'info' : lcp < 2500 ? 'pass' : lcp < 4000 ? 'warn' : 'fail',
        value: lcp !== null ? `${lcp}ms` : null,
        detail: lcp === null ? 'No medido' : lcp < 2500 ? `${lcp}ms — Bueno` : lcp < 4000 ? `${lcp}ms — Necesita mejora` : `${lcp}ms — Pobre (afecta ranking)`,
        fix: 'Optimiza imágenes, usa lazy loading, activa compresión Gzip/Brotli',
      },
      {
        id: 'perf.cls',
        label: 'CLS (Cumulative Layout Shift)',
        status: cls === null ? 'info' : cls < 0.1 ? 'pass' : cls < 0.25 ? 'warn' : 'fail',
        value: cls !== null ? cls.toFixed(3) : null,
        detail: cls === null ? 'No medido' : cls < 0.1 ? `CLS: ${cls.toFixed(3)} — Estable` : cls < 0.25 ? `CLS: ${cls.toFixed(3)} — Inestable` : `CLS: ${cls.toFixed(3)} — Muy inestable (elementos que saltan)`,
        fix: 'Define dimensiones explícitas en imágenes y elementos dinámicos',
      },
      {
        id: 'perf.fcp',
        label: 'FCP (First Contentful Paint)',
        status: fcp === null ? 'info' : fcp < 1800 ? 'pass' : fcp < 3000 ? 'warn' : 'fail',
        value: fcp !== null ? `${fcp}ms` : null,
        detail: fcp === null ? 'No medido' : fcp < 1800 ? `${fcp}ms — Rápido` : `${fcp}ms — Lento`,
        fix: 'Reduce el CSS bloqueante, elimina render-blocking resources',
      },
      {
        id: 'perf.scripts',
        label: 'Scripts externos',
        status: scripts <= 5 ? 'pass' : scripts <= 10 ? 'warn' : 'fail',
        value: scripts,
        detail: `${scripts} archivos JavaScript externos`,
        fix: 'Combina y minimiza scripts, usa defer/async para no-críticos',
      },
      {
        id: 'perf.css',
        label: 'Archivos CSS',
        status: cssFiles <= 3 ? 'pass' : cssFiles <= 6 ? 'warn' : 'fail',
        value: cssFiles,
        detail: `${cssFiles} archivos CSS externos`,
        fix: 'Combina los CSS en un solo archivo minimizado',
      },
      {
        id: 'perf.dom',
        label: 'Tamaño del DOM',
        status: domSize === null ? 'info' : domSize < 800 ? 'pass' : domSize < 1500 ? 'warn' : 'fail',
        value: domSize !== null ? `${domSize} nodos` : null,
        detail: domSize === null ? 'No medido' : domSize < 800 ? `${domSize} nodos — DOM ligero` : `${domSize} nodos — DOM excesivo (lentifica el navegador)`,
        fix: 'Simplifica el HTML, elimina wrappers innecesarios, usa virtual scroll',
      },
    ];

    return checks;
  }, { ttfb, lcp, cls, fcp, domSize, resourceCount });
}
