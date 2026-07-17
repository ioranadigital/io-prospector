// backend/services/prospector-v2.service.js
// v3: Google Places API + deduplicación + query variaciones + rate limiting mejorado

import { contactExtractorService } from './contact-extractor.service.js';
import { googlePlacesService } from './google-places.service.js';
import { csvExportService } from './csv-export.service.js';
import { performanceAuditService } from './seo-technical/performance-audit.service.js';
import { techDetectionService } from './tech-stack/tech-detection.service.js';
import { pickMissingService } from './sector-services.util.js';
import { fetchWithRetry } from '../utils/fetch-with-retry.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// HARD_DROP: nunca son un prospecto real (redes sociales, institucional, grandes
// cadenas nacionales) — la fila se descarta por completo, no se guarda ni como
// "negocio sin web".
const HARD_DROP_DOMAINS = [
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com',
  'youtube.com', 'tiktok.com', 'pinterest.com',
  '.gob.es', '.gub.es', 'sede.', 'ayuntamiento',
  'leroymerlin.es', 'elcorteingles.es', 'ikea.com', 'mediamarkt.es',
  'carrefour.es', 'decathlon.es', 'worten.es', 'amazon.com', 'amazon.es',
  'google.com', 'maps.google.com', 'bing.com', 'yahoo.com', 'wikipedia.org', 'reddit.com',
  // Encontrados en pruebas reales — grandes compañías de servicios (no son
  // pymes locales) y fundaciones/entes sectoriales.
  'homeserve.es', 'flc.es',
  // Portales de empleo genéricos (bolsas de trabajo, no negocios)
  'gestionandote.com', 'trabajastur.asturias.es',
  // Dominios oficiales de comunidades autónomas — variantes que no siguen el
  // patrón .gob.es (cada CCAA tiene su propio dominio institucional)
  'asturias.es', 'madrid.org', 'gencat.cat', 'xunta.gal', 'euskadi.eus',
  'jccm.es', 'juntadeandalucia.es', 'gobiernodecanarias.org', 'larioja.org',
  'navarra.es', 'aragon.es', 'gobex.es', 'cantabria.es', 'carm.es',
  'gobiernodecanarias.es', 'caib.es',
];

// SOFT_SKIP: directorios/guías de empresas — no es la web real del negocio, pero
// la entidad detrás puede seguir siendo un prospecto válido ("no tiene web
// propia" es en sí mismo un ángulo de venta ya usado en el icebreaker).
const SOFT_SKIP_DOMAINS = [
  'yelp.com', 'tripadvisor.com', 'booking.com', 'idealista.com', 'fotocasa.es',
  'infojobs.net', 'indeed.com', 'paginas-amarillas.com', 'paginasamarillas.es',
  'qdq.com', 'qdq.es', 'habitaclia.com', 'wallapop.com', 'milanuncios.com',
  'einforma.com', 'empresite.com', 'axesor.es', 'infoisinfo.es',
  'guiadeltrabajador.com', 'cylex.es', 'europages.es',
  // Marketplaces de servicios — encontrado en pruebas reales (habitissimo)
  'habitissimo.es', 'habitissimo.com',
];

// Portales de empleo — ruta con estas palabras nunca es un negocio local, es
// una bolsa de trabajo (encontrado en pruebas reales: gestionandote.com,
// trabajastur.asturias.es). Solo se mira el path, no el hostname completo,
// para no descartar negocios reales cuyo nombre incluya "trabajo/trabajos"
// (frecuente en construcción: "Trabajos Verticales", "Trabajos en Altura"...).
const JOB_BOARD_PATTERN = /\/(ofertas?-de-empleo|ofertas?-empleo|ofertas-ptpr-de-|bolsa-de-trabajo|bolsa-trabajo)\b/i;

function looksLikeJobBoard(url) {
  try {
    return JOB_BOARD_PATTERN.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

// Dominios excluidos directamente en la query de Google (-site:) — el filtro
// más efectivo es no dejar que Google los devuelva, en vez de descartarlos
// después de recibirlos. Subconjunto de HARD_DROP/SOFT_SKIP más frecuentes.
const SITE_EXCLUSIONS = [
  'paginasamarillas.es', 'paginas-amarillas.com', 'qdq.com', 'qdq.es',
  'cylex.es', 'europages.es', 'einforma.com', 'empresite.com',
  'milanuncios.com', 'wallapop.com',
  'facebook.com', 'instagram.com', 'youtube.com', 'linkedin.com',
  'leroymerlin.es', 'elcorteingles.es', 'ikea.com',
  'habitissimo.es', 'homeserve.es',
];

function buildSiteExclusionClause() {
  return SITE_EXCLUSIONS.map(d => `-site:${d}`).join(' ');
}

// Modificadores de intención comercial local por tipo de categoría — se
// combinan en las variaciones de query para que Google priorice negocios
// reales ("empresa de fontanería en Gijón") sobre listados genéricos.
const INTENT_MODIFIERS_BY_KEYWORD = [
  { match: /hogar|construcci[oó]n|reformas|fontaner|electric|carpinter|cerrajer|jardin/i,
    modifiers: ['empresa de', 'servicio de', 'instaladores de'] },
  { match: /salud|cl[ií]nica|dentista|fisioterap|m[eé]dic|veterinari|psicolog/i,
    modifiers: ['clínica de', 'consulta de', 'centro de'] },
  { match: /abogad|legal|jur[ií]dic/i,
    modifiers: ['despacho de', 'bufete de', 'abogados de'] },
  { match: /belleza|est[eé]tica|peluquer|barber|manicura|depilaci[oó]n/i,
    modifiers: ['salón de', 'centro de', 'estudio de'] },
  { match: /retail|negocio|comercio|tienda|taller|mec[aá]nico|inmobiliari/i,
    modifiers: ['tienda de', 'taller de', 'comercio de'] },
  { match: /hosteler[ií]a|restaurant|bar|catering|panader/i,
    modifiers: ['restaurante de', 'servicio de', 'especialistas en'] },
  { match: /educaci[oó]n|formaci[oó]n|academia|autoescuela/i,
    modifiers: ['academia de', 'centro de', 'escuela de'] },
  { match: /turismo|surf|alquiler|vacacion/i,
    modifiers: ['empresa de', 'servicio de', 'alquiler de'] },
];
const DEFAULT_INTENT_MODIFIERS = ['empresa de', 'servicio de', 'profesional de'];

function getIntentModifiers(category) {
  if (!category) return DEFAULT_INTENT_MODIFIERS;
  const found = INTENT_MODIFIERS_BY_KEYWORD.find(({ match }) => match.test(category));
  return found ? found.modifiers : DEFAULT_INTENT_MODIFIERS;
}

// Variaciones de query por página, con modificador de intención comercial
// adaptado a la categoría. IMPORTANTE: cada variación usa UN solo término de
// `terms`, rotando — no se concatenan todos los términos en la misma query.
// Google trata las palabras separadas por espacio como AND implícito, así que
// pedir "Carpintería carpintero muebles a medida" a la vez sobre-restringe la
// búsqueda (una web real rara vez tiene las tres frases literalmente). Rotar
// un término por página cubre el mismo terreno sin diluir cada búsqueda.
function buildQueryVariations(category, terms, excludeTerms = []) {
  const [mod1, mod2, mod3] = getIntentModifiers(category);
  const excludeClause = excludeTerms.map(t => `-${t}`).join(' ');
  const templates = [
    (q, c) => `${q} ${c}`,
    (q, c) => `${q} en ${c}`,
    (q, c) => `${mod1} ${q} ${c}`,
    (q, c) => `${mod2} ${q} ${c}`,
    (q, c) => `${q} ${mod3} ${c}`,
  ];
  return templates.map((tpl, i) => {
    const term = terms[i % terms.length];
    return (city) => [tpl(term, city), excludeClause].filter(Boolean).join(' ');
  });
}

// Si una búsqueda en el municipio devuelve muy pocos resultados, es probable
// que sea demasiado pequeño para que Google tenga inventario local suficiente
// — se amplía a la provincia para esa página.
const MIN_RESULTS_BEFORE_WIDENING = 3;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Patrón genérico para fichas de directorio/asociación local (ACEPA, guías
// sectoriales, etc.). Una lista de dominios nunca cubre el long-tail de
// asociaciones de comerciantes municipales — esto detecta la FORMA típica
// de esas URLs en vez de intentar enumerar cada dominio.
// Bounded por / a cada lado pero con [a-z0-9-]* alrededor de la palabra clave,
// para capturar segmentos compuestos como "directorio-empresas-reformas"
// (visto en pruebas reales; el match exacto de solo "directorio" no lo pillaba).
const DIRECTORY_URL_PATTERN = /\/[a-z0-9-]*(listing|ficha|directorio|perfil-empresa|empresa-id)[a-z0-9-]*\//i;
const DIRECTORY_HOST_PATTERN = /(^|\.)(guia|directorio|listado|catalogo)[a-z0-9-]*\./i;

function looksLikeDirectoryListing(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return DIRECTORY_URL_PATTERN.test(pathname) || DIRECTORY_HOST_PATTERN.test(hostname);
  } catch {
    return false;
  }
}

// Competidor principal: reutiliza el SERP ya obtenido (coste de red cero) — el
// resultado mejor posicionado de la misma página que no sea el propio lead ni
// un dominio de HARD_DROP_DOMAINS/SOFT_SKIP_DOMAINS.
function pickMainCompetitor(pageResults, currentResult) {
  const rival = (pageResults || []).find(r =>
    r.position !== currentResult.position &&
    r.url && !HARD_DROP_DOMAINS.some(d => r.url.includes(d)) && !SOFT_SKIP_DOMAINS.some(d => r.url.includes(d))
  );
  if (!rival) return null;
  return rival.title.replace(/\s*[-|–]\s*.*$/, '').trim() || null;
}

// Verificar si un dominio ya existe en BD para no procesar duplicados
async function isDuplicate(url, sessionId) {
  if (!url) return false;
  const domain = extractDomain(url);
  if (!domain) return false;

  try {
    const { data } = await supabase
      .from('io_pro_leads')
      .select('id')
      .ilike('website', `%${domain}%`)
      .neq('session_id', sessionId)
      .limit(1);
    return data && data.length > 0;
  } catch {
    return false; // Si falla la consulta, procesamos igualmente
  }
}

export async function startProspectionV2({ query, includeTerms, excludeTerms, city, provincia, category, pagesFrom = 2, pagesTo = 4, sessionId }) {
  const leads = [];
  const seenDomains = new Set(); // dedup dentro de la misma sesión
  const startTime = Date.now();
  // Fallback a [query] para llamadas antiguas (CLI, scripts) que no mandan
  // includeTerms — mantiene el comportamiento previo para esos casos.
  const terms = (includeTerms && includeTerms.length > 0) ? includeTerms : [query];
  const queryVariations = buildQueryVariations(category, terms, excludeTerms || []);

  logger.info(`🚀 Iniciando prospección v3: "${query}" en ${city} (pág ${pagesFrom}-${pagesTo})`);
  logger.info(`   Términos a rotar: ${terms.join(' · ')}`);
  logger.info(`   Google Places API: ${process.env.GOOGLE_PLACES_API_KEY ? '✅ activa' : '⚠️ no configurada (usando scraper)'}`);

  try {
    for (let page = pagesFrom; page <= pagesTo; page++) {
      // Rotar variación de query por página para diversificar resultados
      const variationFn = queryVariations[(page - pagesFrom) % queryVariations.length];
      const queryVariant = variationFn(city);

      logger.info(`📖 Buscando página ${page} con query: "${queryVariant}"`);
      let results = await fetchSerpPage({ query: queryVariant, city, page });
      logger.info(`   Resultados: ${results.length}`);

      // Municipio probablemente demasiado pequeño para inventario local de
      // Google — ampliar a la provincia para esta página.
      if (results.length < MIN_RESULTS_BEFORE_WIDENING && provincia && provincia !== city) {
        logger.info(`   🔎 Pocos resultados en "${city}", ampliando a provincia "${provincia}"`);
        const widerResults = await fetchSerpPage({ query: variationFn(provincia), city: provincia, page });
        if (widerResults.length > results.length) {
          results = widerResults;
          logger.info(`   Resultados tras ampliar: ${results.length}`);
        }
      }

      if (results.length === 0) {
        logger.warn(`   ⚠️  Sin resultados en página ${page}`);
        continue;
      }

      for (const result of results) {
        try {
          // Deduplicación por dominio
          const domain = extractDomain(result.url);
          if (domain && seenDomains.has(domain)) {
            logger.debug(`   ⏭️  Duplicado (sesión): ${domain}`);
            continue;
          }
          if (domain && await isDuplicate(result.url, sessionId)) {
            logger.info(`   ⏭️  Ya existe en BD: ${domain}`);
            seenDomains.add(domain);
            continue;
          }
          if (domain) seenDomains.add(domain);

          const lead = await processResult({ result, city, category, pageResults: results });
          if (lead) {
            leads.push(lead);
            logger.info(`   ✅ ${lead.company_name}${lead.email ? ` — ${lead.email}` : ''}${lead.gmb_rating ? ` ⭐${lead.gmb_rating}` : ''}`);
          }
        } catch (err) {
          logger.warn(`   ⚠️  Error procesando ${result.title}: ${err.message}`);
        }

        // Rate limiting adaptativo: más espera entre páginas para evitar bloqueos
        const delay = 1500 + Math.random() * 1500;
        await sleep(delay);
      }

      // Pausa extra entre páginas
      if (page < pagesTo) {
        await sleep(2000 + Math.random() * 1000);
      }
    }

    logger.info(`\n📊 Exportando ${leads.length} leads a CSV...`);
    const exportResult = await csvExportService.saveLeadsToCSV(leads, { query, city, category });
    logger.info(`✅ CSV guardado: ${exportResult.filename}`);

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    logger.info(`⏱️  Tiempo total: ${duration} minutos`);

    return {
      success: true,
      leadsFound: leads.length,
      csvPath: exportResult.path,
      csvUrl: exportResult.url,
      csvFilename: exportResult.filename,
    };
  } catch (error) {
    logger.error(`❌ Prospección fallida: ${error.message}`);
    throw error;
  }
}

async function fetchSerpPage({ query, city, page }) {
  const start = (page - 1) * 10;
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('q', `${query} ${buildSiteExclusionClause()}`);
  url.searchParams.set('hl', 'es');
  url.searchParams.set('gl', 'es');
  // Parámetro location mejora resultados locales vs. mezclar en el texto
  url.searchParams.set('location', `${city}, Spain`);
  url.searchParams.set('num', '10');
  url.searchParams.set('start', String(start));
  url.searchParams.set('api_key', process.env.SERP_API_KEY);

  try {
    const res = await fetchWithRetry(url.toString(), { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`SerpAPI error ${res.status}`);
    const data = await res.json();

    if (data.error) {
      logger.error(`SerpAPI error: ${data.error}`);
      return [];
    }

    return (data.organic_results || []).map((r, i) => ({
      title: r.title,
      url: r.link,
      position: start + i + 1,
      snippet: r.snippet || '',
      page,
    }));
  } catch (error) {
    logger.error(`SerpAPI fetch error: ${error.message}`);
    return [];
  }
}

async function processResult({ result, city, category, pageResults }) {
  // HARD_DROP: ni siquiera se guarda la fila — redes sociales, institucional,
  // portales de empleo o grandes cadenas nunca son un prospecto real.
  if (result.url && (HARD_DROP_DOMAINS.some(d => result.url.includes(d)) || looksLikeJobBoard(result.url))) {
    logger.debug(`   🚫 Descartado (hard drop): ${result.url}`);
    return null;
  }

  const isSkipped = !result.url
    || SOFT_SKIP_DOMAINS.some(d => result.url.includes(d))
    || looksLikeDirectoryListing(result.url);

  const lead = {
    company_name: result.title,
    first_name: 'propietario',
    website: isSkipped ? null : result.url,
    google_position: result.position,
    serp_page: result.page,
    serp_snippet: result.snippet,
    city,
    category,
    has_website: !isSkipped,
    main_competitor: null,
    missing_service: null,
    icebreaker: null,
    seo_gap: null,
  };

  if (!lead.has_website) {
    lead.ssl_active = false;
    lead.gmb_rating = null;
    lead.review_count = null;
    lead.gmb_claimed = null;
    lead.email = null;
    lead.phone = null;
    lead.main_competitor = pickMainCompetitor(pageResults, result);
    lead.icebreaker = lead.main_competitor
      ? `He visto que ${lead.main_competitor} te está ganando en Google en ${city} — y tú ni siquiera tienes web propia todavía.`
      : null;
    return lead;
  }

  // Contacto: Playwright mejorado
  logger.info(`   🌐 Extrayendo contacto: ${result.url.substring(0, 60)}...`);
  const contacted = await contactExtractorService.extract(result.url);
  lead.email = contacted.email;
  lead.phone = contacted.phone;
  lead.ssl_active = contacted.isHTTPS;
  lead.load_time_ms = contacted.load_time_ms;
  lead.is_mobile_responsive = contacted.is_mobile_responsive;
  lead.has_schema = contacted.has_schema;
  lead.broken_links_count = contacted.broken_links_count;

  // GMB: Google Places API (con fallback automático al scraper si no hay clave)
  logger.info(`   📍 Consultando Google Places: "${result.title}"...`);
  const gmb = await googlePlacesService.getBusinessData(result.title, city);
  lead.gmb_rating = gmb.gmb_rating;
  lead.review_count = gmb.review_count;
  lead.gmb_claimed = gmb.gmb_claimed;
  lead.photo_count = gmb.photo_count;
  lead.gmb_description = gmb.description;
  lead.gmb_has_hours = gmb.has_hours;
  lead.gmb_hours_updated = gmb.hours_updated_recently;
  lead.gmb_url = gmb.gmb_url;

  // Si GMB devuelve teléfono y no lo encontramos en la web, usarlo
  if (!lead.phone && gmb.phone_gmb) {
    lead.phone = gmb.phone_gmb;
  }

  // Auditorías técnicas — se esperan para que sus datos lleguen al CSV/BD
  // (antes eran fire-and-forget: el lead se devolvía antes de que resolvieran
  // y el resultado se perdía siempre).
  const [perfResult, techResult] = await Promise.allSettled([
    performanceAuditService.auditPerformanceAndCanonical(result.url),
    techDetectionService.detectTechStack(result.url, contacted.html || ''),
  ]);

  if (perfResult.status === 'fulfilled') {
    const a = perfResult.value;
    lead.ttfb_ms = a.ttfb_ms;
    lead.lcp_ms = a.largest_contentful_paint_ms;
    lead.cls = a.cumulative_layout_shift;
    lead.canonical_url = a.canonical_url;
    lead.h1_count = a.h1_count;
    lead.top_issue = a.top_issue;
    lead.top_issue_severity = a.top_issue_severity;
    lead.seo_gap = [
      !lead.has_schema && 'sin datos estructurados (Schema.org)',
      a.canonical_url && !a.canonical_is_valid && 'canonical mal configurado',
      a.h1_count !== 1 && 'etiquetas H1 duplicadas o ausentes',
      a.robots_txt_blocks_indexing && 'robots.txt bloqueando indexación',
    ].filter(Boolean).join('; ') || null;
  } else {
    logger.warn(`Performance audit error: ${perfResult.reason?.message}`);
  }

  if (techResult.status === 'fulfilled') {
    const t = techResult.value;
    lead.tech_cms = t.cms?.join(',') || null;
    lead.tech_ecommerce = t.ecommerce;
    lead.tech_analytics = t.analytics?.join(',') || null;
    lead.tech_server = t.server;
    lead.tech_risks = t.risks?.join(',') || null;
  } else {
    logger.warn(`Tech detection error: ${techResult.reason?.message}`);
  }

  lead.main_competitor = pickMainCompetitor(pageResults, result);
  lead.missing_service = pickMissingService(category, `${result.snippet || ''} ${contacted.html || ''}`);
  lead.icebreaker = lead.main_competitor
    ? `He visto que ${lead.main_competitor} te está ganando en Google en ${city}.${lead.seo_gap ? ` Además tu web tiene: ${lead.seo_gap}.` : ''}`
    : null;

  return lead;
}

export default { startProspectionV2 };
