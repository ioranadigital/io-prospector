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
};

export type InternalIssue = {
  checkId: string;
  label: string;
  status: 'fail' | 'warn';
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
  totalChecks: number;
  scorePercent: number;
  issues: InternalIssue[];
};

export type InternalReport = {
  url: string;
  domain: string;
  score: number;
  auditedAt: string;
  summary: { pass: number; warn: number; fail: number; info: number; total: number };
  performance: { ttfb: number | null; lcp: number | null; cls: number | null; fcp: number | null };
  categories: InternalCategoryReport[];
  totalIssues: number;
};

export function generateInternalReport(auditResult: any): InternalReport {
  const domain = (() => {
    try { return new URL(auditResult.url.startsWith('http') ? auditResult.url : `https://${auditResult.url}`).hostname; }
    catch { return auditResult.url; }
  })();

  const categories: InternalCategoryReport[] = Object.entries(auditResult.checks || {}).map(([catId, cat]: [string, any]) => {
    const checks = cat.checks || [];
    const passCount = checks.filter((c: any) => c.status === 'pass').length;
    const warnCount = checks.filter((c: any) => c.status === 'warn').length;
    const failCount = checks.filter((c: any) => c.status === 'fail').length;
    const issues: InternalIssue[] = checks
      .filter((c: any) => c.status === 'fail' || c.status === 'warn')
      .sort((a: any, b: any) => (a.status === 'fail' ? -1 : 0) - (b.status === 'fail' ? -1 : 0))
      .map((c: any) => ({
        checkId: c.id,
        label: c.label,
        status: c.status,
        value: c.value,
        detail: c.detail,
        fix: c.fix || null,
        example: CHECK_EXAMPLES[c.id] || null,
      }));

    return {
      id: catId,
      label: cat.label,
      passCount,
      warnCount,
      failCount,
      totalChecks: checks.length,
      scorePercent: checks.length > 0 ? Math.round((passCount / checks.length) * 100) : 0,
      issues,
    };
  });

  const totalIssues = categories.reduce((sum, c) => sum + c.issues.length, 0);

  return {
    url: auditResult.url,
    domain,
    score: auditResult.totalScore,
    auditedAt: auditResult.auditedAt,
    summary: auditResult.summary,
    performance: auditResult.performance,
    categories,
    totalIssues,
  };
}

// Genera una versión en texto plano (Markdown) del informe, pensada para pegar
// en Notion/Slack/un ticket interno — no para enviar al cliente.
export function internalReportToMarkdown(report: InternalReport): string {
  const lines: string[] = [];
  lines.push(`# Informe técnico interno — ${report.domain}`);
  lines.push('');
  lines.push(`URL: ${report.url}`);
  lines.push(`Score SEO: ${report.score}/100`);
  lines.push(`Correctos: ${report.summary.pass} · Avisos: ${report.summary.warn} · Errores: ${report.summary.fail}`);
  lines.push('');

  for (const cat of report.categories) {
    if (cat.issues.length === 0) continue;
    lines.push(`## ${cat.label} (${cat.scorePercent}% · ${cat.failCount} errores, ${cat.warnCount} avisos)`);
    lines.push('');
    for (const issue of cat.issues) {
      lines.push(`### ${issue.status === 'fail' ? '❌' : '⚠️'} ${issue.label}`);
      lines.push(`- Valor actual: \`${issue.value ?? '—'}\``);
      lines.push(`- Detalle: ${issue.detail}`);
      if (issue.fix) lines.push(`- Recomendación: ${issue.fix}`);
      if (issue.example) lines.push(`- Ejemplo:\n\`\`\`\n${issue.example}\n\`\`\``);
      lines.push('');
    }
  }

  return lines.join('\n');
}
