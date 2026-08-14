// Informe interno (equipo) — a diferencia de audit-client-report.ts (que traduce
// a lenguaje comercial y se queda con el top 6 de issues), este informe es 100%
// técnico: incluye TODOS los checks con warn/fail, agrupados por categoría, con
// el detalle crudo del motor de auditoría (label/detail/fix/value) más un
// ejemplo de código/redacción cuando aplica, para que el equipo sepa exactamente
// qué tocar. Los ids usados aquí son los reales que emite
// backend/services/auditor/checks/*.check.js (ojo: no coinciden 1:1 con los ids
// legacy de CHECK_TO_CLIENT en audit-client-report.ts, que referencian
// categorías como "crawl"/"security"/"mobile" que no existen en el motor actual).

export const CHECK_EXAMPLES: Record<string, string> = {
  // Meta
  'meta.title.exists': '<title>Fontanería Pérez | Fontanero urgente en Getafe</title>',
  'meta.title.length': 'Fórmula: Servicio + Ciudad + Marca (30-60 caracteres).\nEj: "Reformas de baños en Alcalá de Henares | Reformas García"',
  'meta.description.exists': '<meta name="description" content="Fontanero urgente 24h en Getafe. Presupuesto sin compromiso. Más de 15 años de experiencia. Llama ahora.">',
  'meta.description.length': 'Objetivo 120-160 caracteres: incluye el servicio, la zona y una llamada a la acción.\nEj: "Reformas integrales en Alcalá de Henares. Presupuesto gratis en 24h. Más de 200 reformas realizadas. Pide tu cita."',
  'meta.canonical': '<link rel="canonical" href="https://midominio.com/pagina-actual/">',
  'meta.noindex': 'Cambiar:\n<meta name="robots" content="noindex, nofollow">\npor:\n<meta name="robots" content="index, follow">',
  'meta.og.title': '<meta property="og:title" content="Fontanería Pérez - Fontanero urgente en Getafe">',
  'meta.og.image': '<meta property="og:image" content="https://midominio.com/img/og-cover-1200x630.jpg">',
  'meta.lang': '<html lang="es">',
  'meta.viewport': '<meta name="viewport" content="width=device-width, initial-scale=1">',
  'meta.favicon': '<link rel="icon" href="/favicon.ico" type="image/x-icon">',
  'meta.twitter': '<meta name="twitter:card" content="summary_large_image">',

  // Headings
  'headings.h1.exists': '<h1>Fontanero urgente en Getafe – Fontanería Pérez</h1>',
  'headings.h1.unique': 'Dejar un único <h1> por página; el resto de títulos deben ser <h2>/<h3>.',
  'headings.h1.length': 'Entre 20 y 70 caracteres — incluye servicio + ciudad, evita repetir el nombre de la marca dos veces.',
  'headings.h2.exists': '<h2>Nuestros servicios de fontanería</h2>\n<h2>Zonas donde trabajamos</h2>\n<h2>Opiniones de clientes</h2>',
  'headings.hierarchy': 'Estructura correcta:\nH1 (1) → título principal de la página\n  H2 → secciones (Servicios, Zona, Contacto...)\n    H3 → subsecciones dentro de cada H2',
  'headings.keywords': 'Los H2 deben nombrar el servicio real, no genéricos.\nEj: en vez de "Lo que hacemos" → "Reparación de fugas de agua en Getafe"',

  // Images
  'images.alt.missing': '<img src="fontanero-getafe.jpg" alt="Fontanero reparando tubería en vivienda de Getafe">',
  'images.lazy': '<img src="foto-equipo.jpg" alt="Equipo de fontaneros" loading="lazy">',
  'images.format': 'Convertir a WebP/AVIF, por ejemplo con Squoosh (https://squoosh.app) o desde terminal:\ncwebp foto.jpg -o foto.webp -q 80',
  'images.total': 'Si hay más de 30-60 imágenes en una sola página, valorar paginar, usar un carrusel o cargar el resto bajo demanda.',

  // Links
  'links.internal': 'Enlazar entre páginas relacionadas con texto descriptivo:\n<a href="/servicios/reformas-bano/">reformas de baño</a>',
  'links.external.security': '<a href="https://proveedor-externo.com" target="_blank" rel="noopener noreferrer">Texto del enlace</a>',
  'links.empty': 'Cambiar:\n<a href="#">Ver más</a>\npor una URL real o un <button onclick="...">Ver más</button> si es una acción JS.',
  'links.anchor.text': 'Cambiar "Clic aquí" / "Leer más" por texto descriptivo:\n<a href="/servicios/">Ver catálogo de servicios de fontanería</a>',
  'links.ratio': 'Añadir más enlaces internos (a otras páginas del propio sitio) que externos, para no diluir la autoridad de la web.',

  // Technical
  'technical.ssl': 'Instalar SSL gratuito con Let\'s Encrypt/Certbot:\nsudo certbot --nginx -d midominio.com -d www.midominio.com\ny forzar redirección HTTP → HTTPS en el servidor web.',
  'technical.schema': `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Fontanería Pérez",
  "telephone": "+34600000000",
  "address": { "@type": "PostalAddress", "streetAddress": "Calle Mayor 1", "addressLocality": "Getafe" }
}
</script>`,
  'technical.doctype': '<!DOCTYPE html>\n<html lang="es">\n...\n</html>',
  'technical.robots': 'robots.txt de ejemplo:\nUser-agent: *\nDisallow:\nSitemap: https://midominio.com/sitemap.xml',
  'technical.inline': 'Mover el CSS/JS embebido en el HTML a archivos externos (styles.css, app.js) para que el navegador pueda cachearlos.',
  'technical.iframes': 'Evitar iframes para contenido que debería ser indexable (mapas, vídeos sí pueden ir en iframe).',
  'technical.flash': 'Sustituir <object>/<embed> por vídeo HTML5 (<video>) o componentes JS modernos.',
  'technical.hreflang': '<link rel="alternate" hreflang="es" href="https://midominio.com/">\n<link rel="alternate" hreflang="en" href="https://midominio.com/en/">',

  // Performance
  'perf.ttfb': 'Activar caché de página completa (ej: WP Rocket, Redis), usar un hosting/VPS con mejor CPU, o poner un CDN delante (Cloudflare).',
  'perf.lcp': 'Precargar la imagen principal:\n<link rel="preload" as="image" href="/hero.webp">\ny comprimir/servir en WebP.',
  'perf.cls': 'Reservar espacio para imágenes y banners con dimensiones fijas:\n<img src="foto.jpg" width="800" height="500" alt="...">',
  'perf.fcp': 'Eliminar CSS/JS que bloquea el render inicial: usar <link rel="preload"> para el CSS crítico y defer/async para scripts.',
  'perf.scripts': '<script src="app.js" defer></script> — combinar varios scripts en un solo bundle cuando sea posible.',
  'perf.css': 'Unificar los archivos CSS en uno solo minificado (ej: con un bundler o el propio CMS).',
  'perf.dom': 'Simplificar el HTML: quitar wrappers <div> anidados innecesarios, usar componentes más planos.',

  // Schema
  'schema.present': `<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "LocalBusiness", "name": "...", "telephone": "...", "address": {...} }
</script>`,
  'schema.valid-json': 'Validar el bloque JSON-LD en https://validator.schema.org o https://search.google.com/test/rich-results antes de publicar.',
  'schema.local-business-complete': `{
  "@type": "LocalBusiness",
  "name": "Fontanería Pérez",
  "telephone": "+34600000000",
  "address": { "@type": "PostalAddress", "streetAddress": "Calle Mayor 1", "addressLocality": "Getafe", "postalCode": "28901" }
}`,
  'schema.local-business-geo': `"geo": { "@type": "GeoCoordinates", "latitude": 40.3057, "longitude": -3.7327 }`,
  'schema.local-business-hours': `"openingHoursSpecification": [
  { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "19:00" }
]`,
  'schema.product-complete': `{ "@type": "Product", "name": "...", "offers": { "@type": "Offer", "price": "49.90", "priceCurrency": "EUR" } }`,
  'schema.product-rating': `"aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.7", "ratingCount": "38" }`,
  'schema.faq-present': `{ "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "¿Hacen presupuestos gratis?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, sin compromiso." } }] }`,
  'schema.recommendation': 'Elegir el tipo según el negocio: LocalBusiness (negocio físico/local), Product (ecommerce), FAQPage (preguntas frecuentes).',

  // Content
  'content.wordcount': 'Ampliar la página a 300+ palabras: añadir una sección de "Sobre nosotros", detalle de servicios, zona de cobertura o preguntas frecuentes.',
  'content.text_ratio': 'Reducir marcado HTML innecesario (wrappers, estilos inline) o añadir más contenido textual real.',
  'content.paragraphs': 'Dividir el texto en varios <p> con ideas concretas, en vez de un único bloque largo.',
  'content.long_paragraphs': 'Dividir párrafos de más de 150 palabras en 2-3 párrafos más cortos y escaneables.',
  'content.multimedia': 'Añadir una lista de servicios (<ul>), una tabla de precios o un vídeo corto de presentación.',

  // Technical (GEO)
  'technical.robots.ai-bots': 'Quitar del robots.txt las líneas Disallow que afecten a GPTBot, ClaudeBot, Google-Extended, PerplexityBot o ByteSpider si quieres que tu contenido pueda citarse en ChatGPT/Claude/Perplexity.',

  // Meta
  'meta.canonical.target': 'Corrige el canonical para que apunte a la propia URL:\n<link rel="canonical" href="https://midominio.com/esta-misma-pagina/">',

  // Security
  'security.hsts': 'Strict-Transport-Security: max-age=31536000; includeSubDomains',
  'security.csp': 'Content-Security-Policy: default-src \'self\'; script-src \'self\' https://www.googletagmanager.com',
  'security.x-frame-options': 'X-Frame-Options: SAMEORIGIN',
  'security.x-content-type-options': 'X-Content-Type-Options: nosniff',
  'security.mixed-content': 'Cambiar cualquier <img src="http://..."> o <script src="http://..."> a https://.',
  'security.sri': '<script src="https://cdn.ejemplo.com/lib.js" integrity="sha384-..." crossorigin="anonymous"></script>',
  'security.password.field': 'Servir el formulario de login/contraseña siempre bajo https:// — nunca en una página http://.',

  // Compliance
  'compliance.cookies': 'Instalar un gestor de consentimiento (ej. CookieYes, Complianz, Cookiebot) que bloquee cookies no esenciales hasta que el usuario acepte.',
  'compliance.privacy.policy': 'Añadir en el footer: <a href="/politica-de-privacidad/">Política de privacidad</a>',
  'compliance.terms.service': 'Añadir en el footer: <a href="/aviso-legal/">Aviso legal</a>',
  'compliance.gdpr': 'Combinar aviso de cookies + política de privacidad publicada — son los dos requisitos básicos para reducir el riesgo de sanción RGPD.',

  // Crawl
  'crawl.sitemap': 'Genera el sitemap y referéncialo en robots.txt:\nSitemap: https://midominio.com/sitemap.xml',
  'crawl.robots.optimization': 'User-agent: *\nDisallow:\nSitemap: https://midominio.com/sitemap.xml',
  'crawl.redirect.chains': 'Actualiza los enlaces internos para que apunten directamente a la URL final, sin pasar por redirecciones intermedias.',
  'crawl.duplicate.content': 'Reescribe el <title> (y el contenido) de esta página para que sea único frente a las demás páginas del sitio.',
  'crawl.pagination': '<link rel="next" href="https://midominio.com/blog/pagina/3/">\n<link rel="prev" href="https://midominio.com/blog/pagina/1/">',

  // Analytics
  'analytics.ga4': '<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());gtag(\'config\',\'G-XXXXXXX\');</script>',
  'analytics.utm.consistency': 'Cambiar enlaces internos como <a href="/contacto?utm_source=home"> por <a href="/contacto"> — los UTM son solo para campañas externas.',

  // Local
  'local.phone.visible': '<a href="tel:+34600000000">600 00 00 00</a>',
  'local.google.mybusiness': '<a href="https://maps.app.goo.gl/tu-negocio" target="_blank" rel="noopener">Cómo llegar</a>',
};

export type InternalCheckItem = {
  checkId: string;
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  value: string | number | boolean | null;
  detail: string;
  fix: string | null;
  example: string | null;
};

export type InternalCategoryReport = {
  id: string;
  label: string;
  passCount: number;
  warnCount: number;
  failCount: number;
  infoCount: number;
  totalChecks: number;
  scorePercent: number;
  // Todos los checks de la categoría (pass + warn + fail + info), en el mismo
  // orden en que los emite el motor — los problemas primero, los puntos
  // correctos al final, para que el informe se lea "de lo urgente a lo bien hecho".
  checks: InternalCheckItem[];
};

export type InternalReport = {
  url: string;
  domain: string;
  score: number;
  duration: number | null;
  auditedAt: string;
  summary: { pass: number; warn: number; fail: number; info: number; total: number };
  performance: { ttfb: number | null; lcp: number | null; cls: number | null; fcp: number | null };
  categories: InternalCategoryReport[];
  totalIssues: number;
};

// Misma escala de etiquetas que ScoreCircle en /audit-resultados — se replica
// aquí para que el número y la etiqueta ("Mejorable"...) coincidan siempre
// con lo que se ve en pantalla.
export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excelente', color: '#22c55e' };
  if (score >= 50) return { label: 'Mejorable', color: '#eab308' };
  return { label: 'Crítico', color: '#ef4444' };
}

const STATUS_ORDER: Record<string, number> = { fail: 0, warn: 1, info: 2, pass: 3 };

export function generateInternalReport(auditResult: any): InternalReport {
  const domain = (() => {
    try { return new URL(auditResult.url.startsWith('http') ? auditResult.url : `https://${auditResult.url}`).hostname; }
    catch { return auditResult.url; }
  })();

  const categories: InternalCategoryReport[] = Object.entries(auditResult.checks || {}).map(([catId, cat]: [string, any]) => {
    const rawChecks = cat.checks || [];
    const passCount = rawChecks.filter((c: any) => c.status === 'pass').length;
    const warnCount = rawChecks.filter((c: any) => c.status === 'warn').length;
    const failCount = rawChecks.filter((c: any) => c.status === 'fail').length;
    const infoCount = rawChecks.filter((c: any) => c.status === 'info').length;

    const checks: InternalCheckItem[] = rawChecks
      .slice()
      .sort((a: any, b: any) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
      .map((c: any) => ({
        checkId: c.id,
        label: c.label,
        status: c.status,
        value: c.value,
        detail: c.detail,
        fix: c.status === 'pass' ? null : (c.fix || null),
        example: c.status === 'pass' ? null : (CHECK_EXAMPLES[c.id] || null),
      }));

    return {
      id: catId,
      label: cat.label,
      passCount,
      warnCount,
      failCount,
      infoCount,
      totalChecks: rawChecks.length,
      scorePercent: rawChecks.length > 0 ? Math.round((passCount / rawChecks.length) * 100) : 0,
      checks,
    };
  });

  const totalIssues = categories.reduce((sum, c) => sum + c.failCount + c.warnCount, 0);

  return {
    url: auditResult.url,
    domain,
    score: auditResult.totalScore,
    duration: auditResult.duration ?? null,
    auditedAt: auditResult.auditedAt,
    summary: auditResult.summary,
    performance: auditResult.performance,
    categories,
    totalIssues,
  };
}

const STATUS_EMOJI: Record<string, string> = { fail: '❌', warn: '⚠️', info: 'ℹ️', pass: '✅' };
const STATUS_WORD: Record<string, string> = { fail: 'Error', warn: 'Aviso', info: 'Info', pass: 'Correcto' };

// Genera una versión en texto plano (Markdown) del informe, pensada para pegar
// en Notion/Slack/un ticket interno — no para enviar al cliente.
export function internalReportToMarkdown(report: InternalReport): string {
  const lines: string[] = [];
  lines.push(`# Informe técnico interno — ${report.domain}`);
  lines.push('');
  const scoreMeta = getScoreLabel(report.score);
  lines.push(`URL: ${report.url}`);
  lines.push(`Score SEO: ${report.score}/100 · ${scoreMeta.label}${report.duration !== null ? ` · ${report.duration}ms` : ''}`);
  lines.push(`Correctos: ${report.summary.pass} · Avisos: ${report.summary.warn} · Errores: ${report.summary.fail}`);
  lines.push(`Core Web Vitals: TTFB (Time to First Byte) ${report.performance?.ttfb ?? '—'}ms · FCP (First Contentful Paint) ${report.performance?.fcp ?? '—'}s · LCP (Largest Contentful Paint) ${report.performance?.lcp ?? '—'}s · CLS (Cumulative Layout Shift) ${report.performance?.cls ?? '—'}`);
  lines.push('');

  for (const cat of report.categories) {
    lines.push(`## ${cat.label} (${cat.scorePercent}% · ${cat.failCount} errores, ${cat.warnCount} avisos, ${cat.passCount} correctos)`);
    lines.push('');
    for (const check of cat.checks) {
      lines.push(`### ${STATUS_EMOJI[check.status]} ${check.label} — ${STATUS_WORD[check.status]}`);
      lines.push(`- Valor actual: \`${check.value ?? '—'}\``);
      lines.push(`- Detalle: ${check.detail}`);
      if (check.fix) lines.push(`- Recomendación: ${check.fix}`);
      if (check.example) lines.push(`- Ejemplo:\n\`\`\`\n${check.example}\n\`\`\``);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// Documento HTML autocontenido y maquetado — sirve como base tanto para
// "Imprimir / Guardar como PDF" (window.print) como para "Descargar Word"
// (mismo HTML servido con mime type de Word, que Word abre como documento).
// Usa tablas y estilos inline porque es lo que mejor interpreta el motor de
// renderizado HTML de Word.
export function internalReportToHtml(report: InternalReport): string {
  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };
  const scoreMeta = getScoreLabel(report.score);
  const vitals = [
    { label: 'TTFB', full: 'Time to First Byte',       value: report.performance?.ttfb, unit: 'ms' },
    { label: 'FCP',  full: 'First Contentful Paint',   value: report.performance?.fcp,  unit: 's' },
    { label: 'LCP',  full: 'Largest Contentful Paint', value: report.performance?.lcp,  unit: 's' },
    { label: 'CLS',  full: 'Cumulative Layout Shift',  value: report.performance?.cls,  unit: '' },
  ];
  const STATUS_COLOR: Record<string, string> = { fail: '#dc2626', warn: '#ca8a04', info: '#2563eb', pass: '#16a34a' };
  const STATUS_BG: Record<string, string> = { fail: '#fef2f2', warn: '#fefce8', info: '#eff6ff', pass: '#f0fdf4' };
  const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const categoriesHtml = report.categories.map(cat => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #e4e4e7;border-radius:8px;">
      <tr>
        <td style="background:#18181b;padding:14px 18px;border-radius:8px 8px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="color:#ffffff;font-size:16px;font-weight:700;">${esc(cat.label)}</td>
            <td align="right" style="color:#a1a1aa;font-size:12px;">
              ${cat.scorePercent}% correcto · ${cat.failCount} errores · ${cat.warnCount} avisos · ${cat.passCount} OK
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${cat.checks.map(check => `
          <tr>
            <td style="padding:12px 18px;border-bottom:1px solid #f4f4f5;background:${STATUS_BG[check.status]};">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="width:24px;vertical-align:top;font-size:14px;">${STATUS_EMOJI[check.status]}</td>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:13.5px;font-weight:700;color:${STATUS_COLOR[check.status]};">${esc(check.label)}</p>
                  <p style="margin:3px 0 0;font-size:12.5px;color:#3f3f46;">${esc(check.detail)}</p>
                  ${check.value !== null && check.value !== undefined && check.value !== '' && typeof check.value !== 'boolean' ? `<p style="margin:4px 0 0;font-size:11.5px;color:#71717a;font-family:monospace;">Valor: ${esc(String(check.value))}</p>` : ''}
                  ${check.fix ? `<p style="margin:6px 0 0;font-size:12px;color:#3f3f46;">💡 <strong>Recomendación:</strong> ${esc(check.fix)}</p>` : ''}
                  ${check.example ? `<pre style="margin:6px 0 0;font-size:11px;color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:8px 10px;white-space:pre-wrap;font-family:monospace;">${esc(check.example)}</pre>` : ''}
                </td>
              </tr></table>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>
    </table>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Informe técnico interno — ${esc(report.domain)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
<!-- El motor HTML de Word ignora max-width y centra mal con margin:0 auto en
     una tabla al 100%. <center> + una tabla de ancho fijo + align="center"
     es la técnica que sí respeta (la misma que se usa para centrar emails
     HTML en Outlook, que comparte motor de render con Word). -->
<center>
<table align="center" width="760" cellpadding="0" cellspacing="0" style="width:760px;margin:0 auto;padding:32px 20px;">
  <tr><td>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:22px;font-weight:700;color:#18181b;">Informe técnico interno</td>
        <td align="right" style="font-size:12px;color:#71717a;">Iorana Digital · Uso interno</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td>
          <p style="margin:0 0 2px;font-size:18px;font-weight:700;">${esc(report.domain)}</p>
          <p style="margin:0;font-size:12px;color:#71717a;">${esc(report.url)} · Auditado el ${esc(fmtDate(report.auditedAt))}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="25%" valign="top" style="padding-right:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;height:100%;">
            <tr><td align="center" style="padding:20px 12px;">
              <p style="margin:0;font-size:34px;font-weight:700;color:${scoreMeta.color};">${report.score}<span style="font-size:14px;color:#a1a1aa;">/100</span></p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:${scoreMeta.color};">${scoreMeta.label}</p>
              ${report.duration !== null ? `<p style="margin:6px 0 0;font-size:11px;color:#a1a1aa;">${report.duration}ms</p>` : ''}
            </td></tr>
          </table>
        </td>
        <td width="25%" valign="top" style="padding:0 4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;height:100%;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Resultados</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:2px 0;font-size:13px;color:#3f3f46;">Correctos</td><td align="right" style="font-size:15px;font-weight:700;color:#16a34a;">${report.summary.pass}</td></tr>
                <tr><td style="padding:2px 0;font-size:13px;color:#3f3f46;">Avisos</td><td align="right" style="font-size:15px;font-weight:700;color:#ca8a04;">${report.summary.warn}</td></tr>
                <tr><td style="padding:2px 0;font-size:13px;color:#3f3f46;">Errores</td><td align="right" style="font-size:15px;font-weight:700;color:#dc2626;">${report.summary.fail}</td></tr>
              </table>
            </td></tr>
          </table>
        </td>
        <td width="50%" valign="top" style="padding-left:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;height:100%;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Core Web Vitals</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${vitals.map(v => `
                <tr>
                  <td style="padding:2px 10px 2px 0;font-size:12px;color:#3f3f46;">${v.label} <span style="color:#a1a1aa;">(${v.full})</span></td>
                  <td align="right" style="padding:2px 0;font-size:13px;font-weight:700;color:#18181b;white-space:nowrap;">${v.value !== null && v.value !== undefined ? `${v.value}${v.unit}` : '—'}</td>
                </tr>`).join('')}
              </table>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    ${categoriesHtml}

    <p style="margin:24px 0 0;font-size:11px;color:#a1a1aa;text-align:center;">
      Generado automáticamente desde Prospector · Solo para uso interno del equipo
    </p>

  </td></tr>
</table>
</center>
</body>
</html>`;
}
