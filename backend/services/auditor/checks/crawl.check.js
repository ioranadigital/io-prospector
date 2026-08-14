import { supabase } from '../../../config/supabase.js';

export const id     = 'crawl';
export const label  = 'Rastreabilidad';
export const weight = 10;

async function checkSitemap(baseUrl, robotsTxt) {
  const sitemapMatch = (robotsTxt || '').match(/^Sitemap:\s*(\S+)/im);
  const candidates = [];
  if (sitemapMatch) candidates.push(sitemapMatch[1]);
  try {
    candidates.push(new URL('/sitemap.xml', baseUrl).href);
    candidates.push(new URL('/sitemap_index.xml', baseUrl).href);
  } catch { /* baseUrl inválida — se queda solo con lo que haya en robots.txt */ }

  for (const sitemapUrl of candidates) {
    try {
      const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const text = await res.text();
        return {
          found: true,
          url: sitemapUrl,
          valid: /<urlset|<sitemapindex/i.test(text),
          referencedInRobots: !!sitemapMatch,
        };
      }
    } catch { /* probar el siguiente candidato */ }
  }
  return { found: false, referencedInRobots: !!sitemapMatch };
}

function analyzeRobotsOptimization(robotsTxt) {
  if (!robotsTxt) return { hasSitemapRef: false, blocksAssets: false };
  return {
    hasSitemapRef: /^Sitemap:/im.test(robotsTxt),
    // Bloquear CSS/JS/temas impide que Googlebot renderice la página como la
    // ve un usuario real — penaliza el rastreo aunque el contenido no esté bloqueado.
    blocksAssets: /Disallow:\s*\/(wp-content\/themes|wp-content\/plugins|[^\n]*\.(js|css)\b)/i.test(robotsTxt),
  };
}

// Duplicado real de contenido requiere comparar varias páginas — con un
// motor que audita una URL a la vez, la señal más honesta disponible es
// comparar contra auditorías previas del mismo dominio ya guardadas en el
// histórico (io_pro_audit_logs), no inventar una heurística sobre una sola página.
async function findDuplicateTitle(currentUrl, title) {
  if (!title) return null;
  try {
    const domain = new URL(currentUrl).hostname;
    const { data, error } = await supabase
      .from('io_pro_audit_logs')
      .select('url, result_json')
      .ilike('url', `%${domain}%`)
      .order('created_at', { ascending: false })
      .limit(15);
    if (error || !data) return null;

    for (const row of data) {
      if (!row.result_json || row.url === currentUrl) continue;
      const rowTitle = row.result_json?.checks?.meta?.checks?.find(c => c.id === 'meta.title.exists')?.value;
      if (rowTitle && rowTitle === title) return row.url;
    }
    return null;
  } catch {
    return null;
  }
}

export async function run(page, ctx = {}) {
  const { url, robotsTxt, redirectChainLength = 0 } = ctx;

  const domResult = await page.evaluate(() => ({
    relNext: !!document.querySelector('link[rel="next"]'),
    relPrev: !!document.querySelector('link[rel="prev"]'),
    looksLikePaginated:
      !!document.querySelector('.pagination, .pager, nav[aria-label*="pagina" i], nav[aria-label*="pagination" i]') ||
      /[?&](page|paged|p)=\d+/i.test(location.search),
    title: document.title?.trim() || '',
  }));

  const [sitemap, duplicateUrl] = await Promise.all([
    checkSitemap(url, robotsTxt),
    findDuplicateTitle(url, domResult.title),
  ]);
  const robotsOpt = analyzeRobotsOptimization(robotsTxt);

  const checks = [
    {
      id: 'crawl.sitemap',
      label: 'Sitemap.xml accesible',
      status: sitemap.found ? (sitemap.valid ? 'pass' : 'warn') : 'fail',
      value: sitemap.found ? sitemap.url : null,
      detail: !sitemap.found
        ? 'No se encontró sitemap.xml (ni referenciado en robots.txt ni en la ruta estándar) — Google tarda más en descubrir contenido nuevo'
        : sitemap.valid
          ? `Sitemap accesible en ${sitemap.url}`
          : `Se encontró ${sitemap.url} pero no parece un sitemap XML válido`,
      fix: !sitemap.found ? 'Genera un sitemap.xml y referencialo con "Sitemap: URL" en robots.txt' : null,
    },
    {
      id: 'crawl.robots.optimization',
      label: 'robots.txt optimizado',
      status: !robotsTxt ? 'info' : (robotsOpt.hasSitemapRef && !robotsOpt.blocksAssets) ? 'pass' : 'warn',
      value: robotsTxt ? `sitemap: ${robotsOpt.hasSitemapRef ? 'sí' : 'no'} · bloquea assets: ${robotsOpt.blocksAssets ? 'sí' : 'no'}` : null,
      detail: !robotsTxt
        ? 'Sin robots.txt para analizar'
        : robotsOpt.blocksAssets
          ? 'robots.txt bloquea CSS/JS/temas — Google no puede renderizar la página como la ve un usuario real'
          : !robotsOpt.hasSitemapRef
            ? 'robots.txt no referencia el sitemap — fácil de añadir'
            : 'robots.txt correctamente optimizado',
      fix: robotsOpt.blocksAssets
        ? 'Elimina las reglas Disallow sobre CSS/JS/temas'
        : !robotsOpt.hasSitemapRef ? 'Añade "Sitemap: https://tudominio.com/sitemap.xml" en robots.txt' : null,
    },
    {
      id: 'crawl.redirect.chains',
      label: 'Sin cadenas de redirección',
      status: redirectChainLength === 0 ? 'pass' : redirectChainLength === 1 ? 'warn' : 'fail',
      value: redirectChainLength,
      detail: redirectChainLength === 0
        ? 'La URL carga directamente, sin redirecciones'
        : `${redirectChainLength} redirección(es) antes de llegar a la página final — cada salto añade latencia y diluye autoridad SEO`,
      fix: redirectChainLength > 0 ? 'Enlaza directamente a la URL final en vez de depender de redirecciones' : null,
    },
    {
      id: 'crawl.duplicate.content',
      label: 'Sin indicios de contenido duplicado',
      status: duplicateUrl ? 'warn' : 'pass',
      value: duplicateUrl || null,
      detail: duplicateUrl
        ? `Mismo <title> que una auditoría previa de ${duplicateUrl} — posible contenido/plantilla duplicada entre páginas`
        : 'Sin coincidencias de título con auditorías previas del mismo dominio en el histórico',
      fix: duplicateUrl ? 'Diferencia el <title> (y el contenido) de cada página del sitio' : null,
    },
  ];

  // Solo penaliza la falta de rel=next/prev en páginas que realmente
  // parecen paginadas — exigirlo en toda página sería un falso positivo
  // universal para cualquier sitio sin listados paginados.
  if (domResult.looksLikePaginated) {
    checks.push({
      id: 'crawl.pagination',
      label: 'Paginación con rel=next/prev',
      status: (domResult.relNext || domResult.relPrev) ? 'pass' : 'warn',
      value: `next: ${domResult.relNext ? 'sí' : 'no'} · prev: ${domResult.relPrev ? 'sí' : 'no'}`,
      detail: (domResult.relNext || domResult.relPrev)
        ? 'Paginación correctamente marcada'
        : 'Página con pinta de estar paginada pero sin rel="next"/"prev" — Google puede indexar páginas de listado vacías en vez del contenido principal',
      fix: 'Añade <link rel="next" href="..."> y/o <link rel="prev" href="..."> en el <head>',
    });
  }

  return checks;
}
