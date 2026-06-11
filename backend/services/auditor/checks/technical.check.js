export const id     = 'technical';
export const label  = 'SEO Técnico';
export const weight = 20;

export function run(page, { url, robotsTxt, ttfb }) {
  return page.evaluate(({ isHTTPS, robotsTxt, ttfb }) => {
    const schema     = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const schemaData = schema.map(s => { try { return JSON.parse(s.textContent); } catch { return null; } }).filter(Boolean);
    const hasSchema  = schemaData.length > 0;
    const schemaTypes = schemaData.map(s => s['@type']).filter(Boolean);

    const hasRobots    = !!robotsTxt && !robotsTxt.includes('Disallow: /');
    const hasRobotsAll = robotsTxt?.includes('Disallow: /') || false;

    const inlineScripts = document.querySelectorAll('script:not([src])').length;
    const inlineStyles  = document.querySelectorAll('style').length;
    const hasDoctype    = document.doctype !== null;

    const iframes = document.querySelectorAll('iframe').length;
    const flash   = document.querySelectorAll('object, embed').length;

    const hreflang = [...document.querySelectorAll('link[hreflang]')].map(l => l.hreflang);
    const ampLink  = !!document.querySelector('link[rel="amphtml"]');
    const rssLink  = !!document.querySelector('link[type="application/rss+xml"]');

    const checks = [
      {
        id: 'technical.ssl',
        label: 'HTTPS / SSL activo',
        status: isHTTPS ? 'pass' : 'fail',
        value: isHTTPS,
        detail: isHTTPS ? 'Sitio seguro con HTTPS' : '¡Sitio sin HTTPS! Google penaliza los sitios sin SSL',
        fix: 'Instala un certificado SSL (Let\'s Encrypt es gratuito) y redirige HTTP → HTTPS',
      },
      {
        id: 'technical.schema',
        label: 'Schema Markup (JSON-LD)',
        status: hasSchema ? 'pass' : 'warn',
        value: schemaTypes.join(', ') || null,
        detail: hasSchema ? `Schema tipos: ${schemaTypes.join(', ')}` : 'Sin schema markup — Google no puede enriquecer los resultados',
        fix: 'Añade JSON-LD con schema.org/LocalBusiness (o el tipo apropiado)',
      },
      {
        id: 'technical.doctype',
        label: 'DOCTYPE declarado',
        status: hasDoctype ? 'pass' : 'fail',
        value: hasDoctype,
        detail: hasDoctype ? 'DOCTYPE correcto' : 'Sin DOCTYPE — el navegador entra en quirks mode',
        fix: 'Añade <!DOCTYPE html> como primera línea del HTML',
      },
      {
        id: 'technical.robots',
        label: 'Robots.txt accesible',
        status: robotsTxt ? (hasRobotsAll ? 'fail' : 'pass') : 'warn',
        value: robotsTxt ? (hasRobotsAll ? 'Disallow: /' : 'OK') : 'No encontrado',
        detail: !robotsTxt ? 'robots.txt no accesible' : hasRobotsAll ? '¡robots.txt bloquea todo el sitio!' : 'robots.txt correcto',
        fix: 'Crea un robots.txt en la raíz del dominio con reglas de rastreo',
      },
      {
        id: 'technical.inline',
        label: 'CSS/JS inline mínimo',
        status: inlineScripts <= 3 && inlineStyles <= 2 ? 'pass' : inlineScripts <= 8 ? 'warn' : 'fail',
        value: `${inlineScripts} scripts, ${inlineStyles} estilos inline`,
        detail: `${inlineScripts} scripts inline, ${inlineStyles} estilos inline`,
        fix: 'Mueve CSS y JS inline a archivos externos para mejorar caché y mantenibilidad',
      },
      {
        id: 'technical.iframes',
        label: 'Sin iframes excesivos',
        status: iframes === 0 ? 'pass' : iframes <= 2 ? 'warn' : 'fail',
        value: iframes,
        detail: iframes > 0 ? `${iframes} iframe(s) — Google no indexa bien el contenido en iframes` : 'Sin iframes',
        fix: 'Minimiza el uso de iframes, especialmente para contenido indexable',
      },
      {
        id: 'technical.flash',
        label: 'Sin Flash/Object',
        status: flash === 0 ? 'pass' : 'fail',
        value: flash,
        detail: flash > 0 ? `${flash} elemento(s) Flash/Object — tecnología obsoleta y no indexable` : 'Sin Flash',
        fix: 'Reemplaza elementos Flash con HTML5/CSS/JavaScript',
      },
      {
        id: 'technical.hreflang',
        label: 'Hreflang (multilingual)',
        status: hreflang.length > 0 ? 'pass' : 'info',
        value: hreflang.join(', ') || null,
        detail: hreflang.length > 0 ? `Idiomas: ${hreflang.join(', ')}` : 'Sin hreflang (solo relevante si es sitio multiidioma)',
        fix: 'Si el sitio tiene múltiples idiomas, añade hreflang para cada versión',
      },
    ];

    return checks;
  }, { isHTTPS: url.startsWith('https'), robotsTxt, ttfb });
}
