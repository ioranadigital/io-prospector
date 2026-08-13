export const id     = 'security';
export const label  = 'Seguridad';
export const weight = 10;

// Cierra las reglas "security.*" que ya existían en io_pro_audit_rules sin
// código detrás (ver docs/analysis/AUDITORIA-MODULO-AUDITORIA-SEO-2026-08-13.md).
// Usa ctx.responseHeaders (capturado en auditor/index.js desde la respuesta
// de page.goto()) porque varias de estas señales viven en cabeceras HTTP, no
// en el DOM — nunca se verían con un check basado solo en HTML.
export function run(page, ctx = {}) {
  const headers = ctx.responseHeaders || {};

  return page.evaluate(({ headers }) => {
    const isHTTPS = location.protocol === 'https:';
    const csp     = headers['content-security-policy'] || '';
    const hsts    = headers['strict-transport-security'] || '';
    const xfo     = headers['x-frame-options'] || '';
    const xcto    = headers['x-content-type-options'] || '';

    const mixedResources = [...document.querySelectorAll('img[src], script[src], link[href], iframe[src]')]
      .filter(el => (el.src || el.href || '').startsWith('http://'));

    const externalScriptsNoSri = [...document.querySelectorAll('script[src]')].filter(s => {
      try { return new URL(s.src).origin !== location.origin && !s.integrity; }
      catch { return false; }
    });

    const passwordFields = document.querySelectorAll('input[type="password"]').length;

    const checks = [
      {
        id: 'security.hsts',
        label: 'HSTS (Strict-Transport-Security)',
        status: !isHTTPS ? 'info' : hsts ? 'pass' : 'warn',
        value: hsts || null,
        detail: !isHTTPS ? 'No aplica — el sitio no usa HTTPS' : hsts ? 'HSTS configurado' : 'Sin cabecera HSTS — el navegador no fuerza HTTPS en visitas futuras',
        fix: 'Añade la cabecera Strict-Transport-Security: max-age=31536000; includeSubDomains',
      },
      {
        id: 'security.csp',
        label: 'Content-Security-Policy',
        status: csp ? 'pass' : 'warn',
        value: csp ? `${csp.slice(0, 80)}${csp.length > 80 ? '…' : ''}` : null,
        detail: csp ? 'CSP configurada' : 'Sin Content-Security-Policy — mayor superficie de ataque XSS',
        fix: 'Añade una cabecera Content-Security-Policy restrictiva (empezar por default-src \'self\')',
      },
      {
        id: 'security.x-frame-options',
        label: 'Protección contra clickjacking',
        status: (xfo || /frame-ancestors/i.test(csp)) ? 'pass' : 'warn',
        value: xfo || (csp && /frame-ancestors/i.test(csp) ? 'CSP frame-ancestors' : null),
        detail: (xfo || /frame-ancestors/i.test(csp)) ? 'Protegido frente a clickjacking' : 'Sin X-Frame-Options ni CSP frame-ancestors — la web puede embeberse en un iframe malicioso',
        fix: 'Añade X-Frame-Options: SAMEORIGIN o una CSP con frame-ancestors',
      },
      {
        id: 'security.x-content-type-options',
        label: 'X-Content-Type-Options',
        status: /nosniff/i.test(xcto) ? 'pass' : 'warn',
        value: xcto || null,
        detail: /nosniff/i.test(xcto) ? 'nosniff configurado' : 'Sin X-Content-Type-Options: nosniff — el navegador puede reinterpretar el tipo de archivo',
        fix: 'Añade la cabecera X-Content-Type-Options: nosniff',
      },
      {
        id: 'security.mixed-content',
        label: 'Sin contenido mixto (HTTP en página HTTPS)',
        status: !isHTTPS ? 'info' : mixedResources.length === 0 ? 'pass' : 'fail',
        value: mixedResources.length,
        detail: !isHTTPS
          ? 'No aplica — el sitio no usa HTTPS'
          : mixedResources.length > 0
            ? `${mixedResources.length} recurso(s) cargados por HTTP en una página HTTPS — el navegador los bloquea o avisa`
            : 'Sin contenido mixto',
        fix: 'Sirve todas las imágenes, scripts y CSS por HTTPS',
      },
      {
        id: 'security.sri',
        label: 'Subresource Integrity en scripts externos',
        status: externalScriptsNoSri.length === 0 ? 'pass' : externalScriptsNoSri.length <= 2 ? 'warn' : 'fail',
        value: externalScriptsNoSri.length,
        detail: externalScriptsNoSri.length > 0
          ? `${externalScriptsNoSri.length} script(s) externo(s) sin atributo integrity — si el CDN se compromete, se ejecuta código no verificado`
          : 'Scripts externos con integrity o sin scripts externos',
        fix: 'Añade el atributo integrity (Subresource Integrity) a los <script> externos',
      },
      {
        id: 'security.password.field',
        label: 'Formularios de contraseña sobre HTTPS',
        status: passwordFields > 0 && !isHTTPS ? 'fail' : 'pass',
        value: passwordFields,
        detail: passwordFields === 0
          ? 'Sin campos de contraseña en esta página'
          : isHTTPS
            ? 'Campo de contraseña detectado, servido por HTTPS'
            : '¡Campo de contraseña servido sin HTTPS! Las credenciales viajan en texto plano',
        fix: passwordFields > 0 && !isHTTPS ? 'Sirve cualquier formulario de login/contraseña siempre por HTTPS' : null,
      },
    ];

    return checks;
  }, { headers });
}
