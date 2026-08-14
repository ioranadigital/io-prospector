export const id     = 'local';
export const label  = 'SEO Local';
export const weight = 8;

// Cierra 2 de las 5 reglas "local.*" fantasma de io_pro_audit_rules. Las
// otras 3 se dejan fuera deliberadamente:
// - local.nap.consistency: comparar Nombre/Dirección/Teléfono contra Google/
//   Facebook/Yelp requiere scraping externo o una API de pago — ya señalado
//   como complejidad "Alta" en el informe de auditoría, no encaja en un
//   check de una sola página.
// - local.schema.business: ya lo cubre schema.local-business-complete en
//   schema.check.js — duplicarlo repetiría la misma causa raíz dos veces
//   (mismo problema que se corrigió para H1 en headings.check.js).
// - local.location.pages: solo tiene sentido para negocios con varias
//   sedes; para el perfil típico de esta herramienta (pymes de una sola
//   ubicación) sería un falso "fail" universal, no una señal real.
export function run(page) {
  return page.evaluate(() => {
    const telLinks = document.querySelectorAll('a[href^="tel:"]').length;
    const phonePattern = /(\+?\d[\d\s().-]{7,}\d)/;
    const bodyText = document.body?.innerText || '';
    const hasPhoneText = phonePattern.test(bodyText);
    const hasVisiblePhone = telLinks > 0 || hasPhoneText;

    const gmbLink = [...document.querySelectorAll('a[href]')].some(a =>
      /google\.com\/maps|g\.page|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(a.href)
    );
    const gmbEmbed = !!document.querySelector('iframe[src*="google.com/maps" i]');
    const hasGmbReference = gmbLink || gmbEmbed;

    const checks = [
      {
        id: 'local.phone.visible',
        label: 'Teléfono visible',
        status: hasVisiblePhone ? 'pass' : 'fail',
        value: telLinks > 0 ? `${telLinks} enlace(s) tel:` : hasPhoneText ? 'en texto' : null,
        detail: hasVisiblePhone
          ? (telLinks > 0 ? 'Teléfono con enlace tel: (clicable en móvil)' : 'Teléfono visible como texto, pero sin enlace tel: clicable')
          : 'No se detectó ningún teléfono visible — un negocio local sin teléfono a la vista pierde llamadas directas',
        fix: telLinks === 0 ? 'Añade el teléfono con <a href="tel:+34...">' : null,
      },
      {
        id: 'local.google.mybusiness',
        label: 'Enlace a Google Maps / Perfil de Negocio',
        status: hasGmbReference ? 'pass' : 'warn',
        value: hasGmbReference,
        detail: hasGmbReference
          ? 'Se encontró un enlace o mapa embebido a Google Maps'
          : 'Sin enlace ni mapa embebido a Google Maps/Perfil de Negocio — dificulta que el visitante encuentre la ubicación y deje reseñas',
        fix: hasGmbReference ? null : 'Enlaza tu ficha de Google Business Profile o embebe un mapa de Google Maps',
      },
    ];

    return checks;
  });
}
