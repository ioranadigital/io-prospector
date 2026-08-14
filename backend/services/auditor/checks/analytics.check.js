export const id     = 'analytics';
export const label  = 'Analytics';
export const weight = 6;

export function run(page) {
  return page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script')];

    const hasGtagScript = scripts.some(s => s.src && /googletagmanager\.com\/gtag\/js\?id=G-/i.test(s.src));
    const inlineGA4Config = scripts.some(s => !s.src && /gtag\(\s*['"]config['"]\s*,\s*['"]G-[A-Z0-9]+['"]/i.test(s.textContent || ''));
    const hasGA4 = hasGtagScript || inlineGA4Config;

    const hasGtmScript = scripts.some(s => s.src && /googletagmanager\.com\/gtm\.js\?id=GTM-/i.test(s.src));
    const hasGtmNoscript = !!document.querySelector('iframe[src*="googletagmanager.com/ns.html?id=GTM-" i]');
    const hasGtm = hasGtmScript || hasGtmNoscript;

    // Los UTM son para medir tráfico externo (campañas, ads, email) — un
    // enlace interno con UTM reescribe la sesión del visitante en Analytics
    // como si viniera de una campaña nueva, rompiendo la atribución real.
    const internalLinksWithUtm = [...document.querySelectorAll('a[href]')].filter(a => {
      try {
        const target = new URL(a.href);
        return target.hostname === location.hostname && /utm_(source|medium|campaign)/i.test(target.search);
      } catch { return false; }
    });

    const checks = [
      {
        id: 'analytics.ga4',
        label: 'Google Analytics 4',
        status: hasGA4 ? 'pass' : 'warn',
        value: hasGA4,
        detail: hasGA4 ? 'GA4 detectado (gtag.js)' : 'Sin Google Analytics 4 — no hay medición de visitas ni de qué hacen los usuarios en la web',
        fix: 'Añade Google Analytics 4 (gtag.js) para medir tráfico y conversiones',
      },
      {
        id: 'analytics.gtm',
        label: 'Google Tag Manager',
        status: hasGtm ? 'pass' : 'info',
        value: hasGtm,
        detail: hasGtm ? 'GTM detectado' : 'Sin Google Tag Manager (opcional si GA4/píxeles ya están instalados directamente)',
        fix: hasGtm ? null : 'Considera usar GTM para gestionar todos los píxeles de analítica/publicidad sin tocar código',
      },
      {
        id: 'analytics.utm.consistency',
        label: 'Enlaces internos sin UTM',
        status: internalLinksWithUtm.length === 0 ? 'pass' : internalLinksWithUtm.length <= 2 ? 'warn' : 'fail',
        value: internalLinksWithUtm.length,
        detail: internalLinksWithUtm.length > 0
          ? `${internalLinksWithUtm.length} enlace(s) internos con parámetros UTM — contaminan la atribución de sesiones reales en Analytics`
          : 'Los enlaces internos no llevan parámetros UTM (correcto — UTM es solo para tráfico externo)',
        fix: internalLinksWithUtm.length > 0 ? 'Quita los parámetros utm_* de los enlaces que apuntan dentro del propio sitio' : null,
      },
    ];

    return checks;
  });
}
