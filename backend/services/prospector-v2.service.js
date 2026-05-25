// backend/services/prospector-v2.service.js
// Versión 2: Scraping completo con exportación a CSV local
// Flujo: SerpAPI → ContactExtractor → GMBScraper → CSV

import { contactExtractorService } from './contact-extractor.service.js';
import { gmbScraperService } from './gmb-scraper.service.js';
import { csvExportService } from './csv-export.service.js';
import { logger } from '../utils/logger.js';

const SKIP_DOMAINS = [
  'google.com', 'facebook.com', 'yelp.com', 'tripadvisor.com',
  'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com',
  'wikipedia.org', 'amazon.com', 'maps.google.com', 'reddit.com'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function startProspectionV2({ query, city, category, pagesFrom = 2, pagesTo = 4 }) {
  const leads = [];
  const startTime = Date.now();

  logger.info(`🚀 Iniciando prospección: "${query}" en ${city} (pág ${pagesFrom}-${pagesTo})`);

  try {
    // 1. Buscar en Google con SerpAPI
    for (let page = pagesFrom; page <= pagesTo; page++) {
      logger.info(`📖 Buscando página ${page}...`);
      const results = await fetchSerpPage({ query: `${query} ${city}`, page });
      logger.info(`   Resultados encontrados: ${results.length}`);

      if (results.length === 0) {
        logger.warn(`   ⚠️  No results for page ${page}`);
      }

      // 2. Procesar cada resultado
      for (const result of results) {
        try {
          const lead = await processResultV2({ result, city, category });
          if (lead) {
            leads.push(lead);
            logger.info(`   ✅ ${lead.company_name}`);
          } else {
            logger.warn(`   ⚠️  Lead processing returned null for ${result.title}`);
          }
        } catch (err) {
          logger.warn(`   ⚠️  Error procesando ${result.title}: ${err.message}`);
        }

        // Rate limiting
        await sleep(1500 + Math.random() * 1000);
      }
    }

    // 3. Exportar a CSV
    logger.info(`\n📊 Exportando ${leads.length} leads a CSV...`);
    const exportResult = await csvExportService.saveLeadsToCSV(leads, {
      query,
      city,
      category,
    });

    logger.info(`✅ CSV guardado: ${exportResult.filename}`);
    logger.info(`   Path: ${exportResult.path}`);

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

async function fetchSerpPage({ query, page }) {
  const start = (page - 1) * 10;
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'es');
  url.searchParams.set('gl', 'es');
  url.searchParams.set('num', '10');
  url.searchParams.set('start', String(start));
  url.searchParams.set('api_key', process.env.SERP_API_KEY);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`SerpAPI error ${res.status}`);
    const data = await res.json();

    return (data.organic_results || []).map((r, i) => ({
      title: r.title,
      url: r.link,
      position: start + i + 1,
      snippet: r.snippet,
      page,
    }));
  } catch (error) {
    logger.error(`SerpAPI fetch error: ${error.message}`);
    return [];
  }
}

async function processResultV2({ result, city, category }) {
  const isSkipped = !result.url || SKIP_DOMAINS.some(d => result.url.includes(d));

  // Información básica
  const lead = {
    company_name: result.title,
    first_name: 'propietario',
    website: isSkipped ? null : result.url,
    google_position: result.position,
    serp_page: result.page,
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

  // Extraer datos de contacto del website
  logger.info(`   🌐 Scrapeando ${result.url.substring(0, 50)}...`);
  const contacted = await contactExtractorService.extract(result.url);
  lead.email = contacted.email;
  lead.phone = contacted.phone;
  lead.ssl_active = contacted.isHTTPS;
  lead.load_time_ms = contacted.load_time_ms;
  lead.is_mobile_responsive = contacted.is_mobile_responsive;
  lead.has_schema = contacted.has_schema;
  lead.broken_links_count = contacted.broken_links_count;

  // Intentar obtener datos de Google Maps (best-effort)
  logger.info(`   📍 Intentando obtener GMB data...`);
  const gmb = await gmbScraperService.scrapeGoogleMaps(result.title, city);
  lead.gmb_rating = gmb.gmb_rating;
  lead.review_count = gmb.review_count;
  lead.gmb_claimed = gmb.gmb_claimed;
  lead.photo_count = gmb.photo_count;
  lead.gmb_description = gmb.description;
  lead.gmb_has_hours = gmb.has_hours;
  lead.gmb_hours_updated = gmb.hours_updated_recently;

  return lead;
}

export default { startProspectionV2 };
