// backend/services/prospector-v2.service.js
// v3: Google Places API + deduplicación + query variaciones + rate limiting mejorado

import { contactExtractorService } from './contact-extractor.service.js';
import { googlePlacesService } from './google-places.service.js';
import { csvExportService } from './csv-export.service.js';
import { performanceAuditService } from './seo-technical/performance-audit.service.js';
import { techDetectionService } from './tech-stack/tech-detection.service.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// Dominios a saltar — directórios/redes sociales/plataformas
const SKIP_DOMAINS = [
  'google.com', 'facebook.com', 'yelp.com', 'tripadvisor.com',
  'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
  'wikipedia.org', 'amazon.com', 'maps.google.com', 'reddit.com',
  'bing.com', 'yahoo.com', 'booking.com', 'idealista.com', 'fotocasa.es',
  'infojobs.net', 'indeed.com', 'paginas-amarillas.com', 'paginasamarillas.es',
  'habitaclia.com', 'wallapop.com', 'milanuncios.com',
];

// Variaciones de query por página para ampliar resultados y evitar duplicados
const QUERY_VARIATIONS = [
  (q, c) => `${q} ${c}`,
  (q, c) => `${q} en ${c}`,
  (q, c) => `empresa ${q} ${c}`,
  (q, c) => `servicio ${q} ${c}`,
  (q, c) => `${q} profesional ${c}`,
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
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

export async function startProspectionV2({ query, city, category, pagesFrom = 2, pagesTo = 4, sessionId }) {
  const leads = [];
  const seenDomains = new Set(); // dedup dentro de la misma sesión
  const startTime = Date.now();

  logger.info(`🚀 Iniciando prospección v3: "${query}" en ${city} (pág ${pagesFrom}-${pagesTo})`);
  logger.info(`   Google Places API: ${process.env.GOOGLE_PLACES_API_KEY ? '✅ activa' : '⚠️ no configurada (usando scraper)'}`);

  try {
    for (let page = pagesFrom; page <= pagesTo; page++) {
      // Rotar variación de query por página para diversificar resultados
      const variationFn = QUERY_VARIATIONS[(page - pagesFrom) % QUERY_VARIATIONS.length];
      const queryVariant = variationFn(query, city);

      logger.info(`📖 Buscando página ${page} con query: "${queryVariant}"`);
      const results = await fetchSerpPage({ query: queryVariant, city, page });
      logger.info(`   Resultados: ${results.length}`);

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

          const lead = await processResult({ result, city, category });
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
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'es');
  url.searchParams.set('gl', 'es');
  // Parámetro location mejora resultados locales vs. mezclar en el texto
  url.searchParams.set('location', `${city}, Spain`);
  url.searchParams.set('num', '10');
  url.searchParams.set('start', String(start));
  url.searchParams.set('api_key', process.env.SERP_API_KEY);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
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

async function processResult({ result, city, category }) {
  const isSkipped = !result.url || SKIP_DOMAINS.some(d => result.url.includes(d));

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

  // Auditorías técnicas en background
  performanceAuditService.auditPerformanceAndCanonical(result.url)
    .then(a => {
      lead.ttfb_ms = a.ttfb_ms;
      lead.lcp_ms = a.largest_contentful_paint_ms;
      lead.cls = a.cumulative_layout_shift;
      lead.canonical_url = a.canonical_url;
      lead.h1_count = a.h1_count;
      lead.top_issue = a.top_issue;
      lead.top_issue_severity = a.top_issue_severity;
    })
    .catch(e => logger.warn(`Performance audit error: ${e.message}`));

  techDetectionService.detectTechStack(result.url, '')
    .then(t => {
      lead.tech_cms = t.cms?.join(',') || null;
      lead.tech_ecommerce = t.ecommerce;
      lead.tech_analytics = t.analytics?.join(',') || null;
      lead.tech_server = t.server;
      lead.tech_risks = t.risks?.join(',') || null;
    })
    .catch(e => logger.warn(`Tech detection error: ${e.message}`));

  return lead;
}

export default { startProspectionV2 };
