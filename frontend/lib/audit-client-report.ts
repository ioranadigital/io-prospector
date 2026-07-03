// Mapeo de checks técnicos → lenguaje cliente
export const CHECK_TO_CLIENT: Record<string, { title: string; impact: string }> = {
  // Technical
  'technical.ssl':              { title: 'Sin certificado de seguridad (HTTPS)', impact: 'Los visitantes ven un aviso de "sitio no seguro". Esto genera desconfianza y reduce las ventas directamente.' },
  'technical.doctype':          { title: 'Web mal configurada para navegadores', impact: 'Tu web puede verse rota en algunos dispositivos y Google la penaliza en el ranking.' },
  'technical.robots':           { title: 'Google no puede rastrear tu web', impact: 'Si Google no puede leer tu web, no puede posicionarte. Estás invisible para nuevos clientes.' },
  'technical.hreflang':         { title: 'Configuración de idiomas incorrecta', impact: 'Tu web puede aparecer en el país o idioma equivocado en los resultados de búsqueda.' },
  'technical.iframes':          { title: 'Contenido bloqueado para buscadores', impact: 'Parte de tu contenido está oculto para Google y no contribuye a tu posicionamiento.' },
  'technical.flash':            { title: 'Tecnología obsoleta en tu web', impact: 'Flash ya no funciona en ningún dispositivo moderno. Los usuarios ven páginas en blanco.' },
  'technical.inline.scripts':   { title: 'Código que ralentiza tu web', impact: 'Fragmentos de código mal optimizados hacen que tu web cargue más despacio de lo necesario.' },
  // Crawl
  'crawl.sitemap':              { title: 'Google no sabe qué páginas tienes', impact: 'Sin mapa del sitio, Google puede tardar semanas en descubrir tu contenido nuevo.' },
  'crawl.robots.optimization':  { title: 'Mapa de rastreo mal configurado', impact: 'Algunas páginas importantes pueden estar bloqueadas para los buscadores sin que lo sepas.' },
  'crawl.redirect.chains':      { title: 'Redirecciones que ralentizan tu web', impact: 'Cada redirección añade tiempo de carga y dispersa la autoridad de tu web en Google.' },
  'crawl.duplicate.content':    { title: 'Contenido duplicado detectado', impact: 'Google puede penalizarte por tener la misma información repetida. Pierdes posiciones.' },
  'crawl.pagination':           { title: 'Paginación mal configurada', impact: 'Google puede indexar páginas vacías en lugar de tu contenido más valioso.' },
  // Security
  'security.csp':               { title: 'Web vulnerable a ataques externos', impact: 'Tu sitio puede ser hackeado más fácilmente. Google penaliza las webs comprometidas.' },
  'security.mixed-content':     { title: 'Contenido inseguro mezclado', impact: 'Algunos recursos de tu web se cargan sin cifrado. Los navegadores los bloquean o muestran alertas.' },
  'security.sri':               { title: 'Archivos externos sin verificar', impact: 'Recursos de terceros sin verificar pueden ser modificados maliciosamente.' },
  'security.x-frame-options':   { title: 'Web susceptible de suplantación', impact: 'Tu web podría ser embebida en sitios maliciosos para engañar a tus usuarios.' },
  // Meta
  'meta.title.missing':         { title: 'Sin título en Google', impact: 'Sin título, Google muestra texto aleatorio en los resultados. Pierdes clics de potenciales clientes.' },
  'meta.title.length':          { title: 'Título mal optimizado', impact: 'Tu título se corta o es demasiado corto. Los usuarios no entienden qué ofreces antes de entrar.' },
  'meta.description.missing':   { title: 'Sin descripción en resultados de Google', impact: 'Google genera la descripción automáticamente. Pierdes el control de tu mensaje y los clics caen hasta un 30%.' },
  'meta.canonical':             { title: 'URL principal no definida', impact: 'Google puede indexar varias versiones de tu web, dividiendo tu autoridad.' },
  'meta.og.tags':               { title: 'Mal aspecto al compartir en redes sociales', impact: 'Cuando alguien comparte tu web, aparece sin imagen ni título correcto. Pierdes impacto.' },
  'meta.robots.noindex':        { title: '¡Tu web está oculta en Google!', impact: 'CRÍTICO: Tu web tiene una instrucción que le dice a Google que no la muestre. Eres invisible.' },
  // Headings
  'headings.h1.missing':        { title: 'Sin título principal en la página', impact: 'Google no sabe de qué trata tu página. No puede posicionarte para tus palabras clave.' },
  'headings.h1.multiple':       { title: 'Estructura de títulos confusa', impact: 'Tener varios títulos principales confunde a Google sobre el tema principal de tu página.' },
  'headings.hierarchy':         { title: 'Estructura de contenido desordenada', impact: 'Tu contenido no está organizado como Google espera. Afecta a tu posicionamiento y legibilidad.' },
  // Content
  'content.thin':               { title: 'Páginas con poco contenido', impact: 'Google prefiere webs con contenido útil y completo. Las páginas vacías no posicionan.' },
  'content.keyword.stuffing':   { title: 'Uso excesivo de palabras clave', impact: 'Repetir demasiado las mismas palabras puede ser penalizado por Google como spam.' },
  'content.readability':        { title: 'Texto difícil de leer', impact: 'Un texto poco claro hace que los usuarios abandonen tu web rápidamente, lo que penaliza tu ranking.' },
  // Images
  'images.alt.missing':         { title: 'Imágenes sin descripción para Google', impact: 'Google no puede "ver" tus imágenes sin texto alternativo. Pierdes tráfico de Google Imágenes.' },
  'images.oversized':           { title: 'Imágenes que ralentizan tu web', impact: 'Imágenes demasiado pesadas son la causa nº1 de webs lentas. Los usuarios se van antes de que carguen.' },
  'images.format':              { title: 'Formato de imágenes obsoleto', impact: 'Usar formatos modernos (WebP) puede hacer tu web hasta 3 veces más rápida.' },
  // Links
  'links.broken':               { title: 'Enlaces rotos en tu web', impact: 'Los visitantes encuentran páginas de error. Google también los detecta y penaliza tu autoridad.' },
  'links.internal':             { title: 'Mala estructura de navegación interna', impact: 'Google no puede descubrir todas tus páginas si no están bien enlazadas entre sí.' },
  // Performance
  'performance.ttfb':           { title: 'Servidor lento', impact: 'Tu servidor tarda demasiado en responder. Google penaliza las webs lentas y los usuarios se van.' },
  'performance.lcp':            { title: 'Web lenta (tiempo de carga alto)', impact: 'El 53% de usuarios abandona si la web tarda más de 3 segundos. Estás perdiendo más de la mitad.' },
  'performance.cls':            { title: 'Web inestable visualmente', impact: 'Los elementos saltan mientras cargas la página. Esto frustra a los usuarios y Google lo penaliza.' },
  'performance.fcp':            { title: 'La web tarda en mostrarse', impact: 'Los usuarios ven pantalla en blanco demasiado tiempo. La primera impresión es fundamental.' },
  'performance.render.blocking':{ title: 'Recursos que bloquean la carga', impact: 'Archivos CSS o JavaScript bloquean que la web se muestre rápidamente.' },
  // Mobile
  'mobile.viewport':            { title: 'Web no adaptada a móvil', impact: 'Más del 60% del tráfico es móvil. Si tu web no se ve bien en el teléfono, pierdes la mayoría de visitas.' },
  'mobile.font.size':           { title: 'Texto demasiado pequeño en móvil', impact: 'Los usuarios tienen que hacer zoom para leer. La experiencia es frustrante y abandonan.' },
  'mobile.tap.targets':         { title: 'Botones difíciles de pulsar en móvil', impact: 'Los botones son demasiado pequeños o están muy juntos en pantallas táctiles.' },
  // Schema
  'schema.missing':             { title: 'Sin datos enriquecidos para Google', impact: 'Tus competidores aparecen con estrellas, precios y fotos en Google. Tú no. Pierdes clics.' },
  'schema.invalid':             { title: 'Datos estructurados con errores', impact: 'Tienes datos enriquecidos pero con errores. Google los ignora y no mejoran tu visibilidad.' },
  // Analytics
  'analytics.ga.missing':       { title: 'Sin medición de visitas', impact: 'No sabes cuánta gente visita tu web ni de dónde viene. No puedes mejorar lo que no mides.' },
  'analytics.events':           { title: 'Sin seguimiento de conversiones', impact: 'No sabes si tus visitantes llaman, compran o contactan. No puedes optimizar tu inversión.' },
  // Local
  'local.nap.consistency':      { title: 'Datos de contacto inconsistentes', impact: 'Google compara tu nombre, dirección y teléfono en toda la web. Si no coinciden, pierdes posicionamiento local.' },
  'local.schema':               { title: 'Sin optimización para búsquedas locales', impact: 'No apareces bien en "restaurants cerca de mí" o búsquedas locales. Pierdes clientes de tu zona.' },
  // Compliance
  'compliance.cookies':         { title: 'Sin aviso de cookies (ilegal en Europa)', impact: 'Puedes recibir una multa de hasta 20 millones € por no cumplir el RGPD.' },
  'compliance.privacy.policy':  { title: 'Sin política de privacidad', impact: 'Obligatorio por ley. Puedes ser sancionado y los usuarios desconfían de webs sin ella.' },
  'compliance.legal.notice':    { title: 'Sin aviso legal', impact: 'Requisito legal en España. Tu empresa queda sin identificar ante los usuarios.' },
};

export const SCORE_LABELS: Record<string, { label: string; color: string; emoji: string; hook: string }> = {
  excellent: { label: 'Excelente',           color: '#22c55e', emoji: '🟢', hook: 'Tu web está bien optimizada, aunque siempre hay margen de mejora.' },
  good:      { label: 'Buena',               color: '#84cc16', emoji: '🟡', hook: 'Tu web está en buen estado, pero tiene puntos débiles que tus competidores pueden aprovechar.' },
  average:   { label: 'Mejorable',           color: '#eab308', emoji: '🟠', hook: 'Tu web tiene problemas importantes que están frenando tu crecimiento en Google.' },
  poor:      { label: 'Necesita mejoras',    color: '#f97316', emoji: '🔴', hook: 'Tu web tiene problemas serios que te hacen invisible para nuevos clientes.' },
  critical:  { label: 'Estado crítico',      color: '#ef4444', emoji: '🔴', hook: 'Tu web está perdiendo clientes cada día. Estos problemas requieren atención urgente.' },
};

export function getScoreLevel(score: number) {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  if (score >= 30) return 'poor';
  return 'critical';
}

export type ClientIssue = {
  checkId: string;
  title: string;
  impact: string;
  severity: 'critical' | 'warning';
};

export type ClientReport = {
  url: string;
  domain: string;
  score: number;
  scoreLevel: string;
  scoreLabel: string;
  hook: string;
  issues: ClientIssue[];
  totalChecks: number;
  passCount: number;
};

export function generateClientReport(auditResult: any): ClientReport {
  const domain = (() => {
    try { return new URL(auditResult.url.startsWith('http') ? auditResult.url : `https://${auditResult.url}`).hostname; }
    catch { return auditResult.url; }
  })();

  const scoreLevel = getScoreLevel(auditResult.totalScore);
  const scoreMeta = SCORE_LABELS[scoreLevel];

  // Recoger todos los checks fallidos/con aviso
  const issues: ClientIssue[] = [];
  for (const [, cat] of Object.entries(auditResult.checks || {})) {
    const category = cat as any;
    for (const check of (category.checks || [])) {
      if (check.status === 'fail' || check.status === 'warn') {
        const mapping = CHECK_TO_CLIENT[check.id];
        if (mapping) {
          issues.push({
            checkId: check.id,
            title: mapping.title,
            impact: mapping.impact,
            severity: check.status === 'fail' ? 'critical' : 'warning',
          });
        }
      }
    }
  }

  // Ordenar: críticos primero, luego por impacto
  issues.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return 0;
  });

  return {
    url: auditResult.url,
    domain,
    score: auditResult.totalScore,
    scoreLevel,
    scoreLabel: scoreMeta.label,
    hook: scoreMeta.hook,
    issues: issues.slice(0, 6), // Top 6 más impactantes
    totalChecks: auditResult.summary?.total || 0,
    passCount: auditResult.summary?.pass || 0,
  };
}
