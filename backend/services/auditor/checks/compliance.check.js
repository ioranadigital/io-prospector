export const id     = 'compliance';
export const label  = 'Cumplimiento Legal';
export const weight = 8;

// Cierra las reglas "compliance.*" que ya existían en io_pro_audit_rules sin
// código detrás. Son heurísticas de texto/DOM (banner de cookies, enlaces
// legales) — suficientes para una auditoría de prospección en frío; no
// sustituyen una revisión legal real.
const COOKIE_CMP_SIGNATURES = [
  'cookiebot', 'onetrust', 'cookieyes', 'iubenda', 'complianz',
  'borlabs', 'cookie-script', 'klaro', 'quantcast', 'cookieconsent',
  'cookie-law-info', 'termly',
];

export function run(page) {
  return page.evaluate((cmpSignatures) => {
    const scriptSrcs = [...document.querySelectorAll('script[src]')].map(s => s.src.toLowerCase());
    const hasKnownCMP = cmpSignatures.some(sig => scriptSrcs.some(src => src.includes(sig)));
    const hasCookieBannerMarkup = !!document.querySelector(
      '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i]'
    );
    const hasCookieBanner = hasKnownCMP || hasCookieBannerMarkup;

    const links = [...document.querySelectorAll('a')];
    const hasPrivacyLink = links.some(a =>
      /privacidad|privacy\s*policy|política de privacidad/i.test(a.textContent || '') ||
      /privac/i.test(a.getAttribute('href') || '')
    );
    const hasTermsLink = links.some(a =>
      /términos|terms of service|condiciones de uso|aviso legal|legal notice/i.test(a.textContent || '') ||
      /terms|legal/i.test(a.getAttribute('href') || '')
    );

    const checks = [
      {
        id: 'compliance.cookies',
        label: 'Aviso de cookies',
        status: hasCookieBanner ? 'pass' : 'warn',
        value: hasKnownCMP ? 'CMP detectado' : hasCookieBanner ? 'Banner detectado' : null,
        detail: hasCookieBanner
          ? 'Se detectó un banner o gestor de consentimiento de cookies'
          : 'No se detectó ningún banner de cookies — obligatorio en la UE si se usan cookies no esenciales',
        fix: 'Añade un gestor de consentimiento de cookies (ej. Cookiebot, CookieYes, Complianz)',
      },
      {
        id: 'compliance.privacy.policy',
        label: 'Política de privacidad',
        status: hasPrivacyLink ? 'pass' : 'warn',
        value: hasPrivacyLink,
        detail: hasPrivacyLink ? 'Enlace a política de privacidad detectado' : 'No se encontró un enlace a la política de privacidad',
        fix: 'Añade un enlace visible a tu política de privacidad (normalmente en el footer)',
      },
      {
        id: 'compliance.terms.service',
        label: 'Términos de uso / Aviso legal',
        status: hasTermsLink ? 'pass' : 'warn',
        value: hasTermsLink,
        detail: hasTermsLink ? 'Enlace a términos/aviso legal detectado' : 'No se encontró un enlace a términos de uso o aviso legal',
        fix: 'Añade un enlace visible a tus términos de uso / aviso legal (obligatorio en España)',
      },
      {
        id: 'compliance.gdpr',
        label: 'Cumplimiento RGPD (visión general)',
        status: hasCookieBanner && hasPrivacyLink ? 'pass' : (hasCookieBanner || hasPrivacyLink) ? 'warn' : 'fail',
        value: `cookies: ${hasCookieBanner ? 'sí' : 'no'} · privacidad: ${hasPrivacyLink ? 'sí' : 'no'}`,
        detail: hasCookieBanner && hasPrivacyLink
          ? 'Señales básicas de RGPD presentes (cookies + política de privacidad)'
          : 'Faltan señales básicas de RGPD — riesgo de sanción (hasta 20M€ o 4% de facturación)',
        fix: 'Implementa aviso de cookies y publica una política de privacidad conforme al RGPD',
      },
    ];

    return checks;
  }, COOKIE_CMP_SIGNATURES);
}
