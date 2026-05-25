// backend/services/prospector.service.js
import { supabase } from '../config/supabase.js';
import { scraperService } from './scraper.service.js';
import { auditService } from './audit.service.js';
import { logger } from '../utils/logger.js';

const SKIP_DOMAINS = ['google.com','facebook.com','yelp.com','tripadvisor.com',
                      'instagram.com','twitter.com','linkedin.com','youtube.com',
                      'wikipedia.org','amazon.com','maps.google.com'];

export async function startProspection({ query, city, category, pagesFrom = 2, pagesTo = 4 }) {
  const { data: session, error } = await supabase
    .from('search_sessions')
    .insert({ query: `${query} ${city}`, city, category, pages_from: pagesFrom, pages_to: pagesTo, status: 'running' })
    .select().single();

  if (error) throw new Error(`Error creando sesión: ${error.message}`);

  const sessionId = session.id;
  const leads = [];

  try {
    for (let page = pagesFrom; page <= pagesTo; page++) {
      logger.info(`Buscando página ${page} para "${query} ${city}"`);
      const results = await fetchSerpPage({ query: `${query} ${city}`, page });

      for (const result of results) {
        try {
          const lead = await processResult({ result, sessionId, city, category });
          if (lead) leads.push(lead);
        } catch (err) {
          logger.error(`Error procesando ${result.title}: ${err.message}`);
        }
        await sleep(1500 + Math.random() * 1000);
      }
    }

    await supabase.from('search_sessions')
      .update({ status: 'done', total_found: leads.length, finished_at: new Date() })
      .eq('id', sessionId);

    logger.info(`✅ Sesión ${sessionId} completada: ${leads.length} leads`);
  } catch (err) {
    await supabase.from('search_sessions').update({ status: 'error' }).eq('id', sessionId);
    throw err;
  }

  return { sessionId, leadsFound: leads.length };
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

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`SerpAPI error ${res.status}`);
  const data = await res.json();

  return (data.organic_results || []).map((r, i) => ({
    title:    r.title,
    url:      r.link,
    position: start + i + 1,
    snippet:  r.snippet,
    page,
  }));
}

async function processResult({ result, sessionId, city, category }) {
  const isSkipped = !result.url || SKIP_DOMAINS.some(d => result.url.includes(d));
  const hasWebsite = !isSkipped;

  let leadData = {
    session_id:      sessionId,
    business_name:   result.title,
    website_url:     hasWebsite ? result.url : null,
    has_website:     hasWebsite,
    google_position: result.position,
    serp_page:       result.page,
    city,
    category,
    priority:        hasWebsite ? 'normal' : 'web_design',
    audit_score:     hasWebsite ? null : 0,
  };

  if (hasWebsite) {
    const scraped = await scraperService.scrape(result.url);
    leadData = { ...leadData, email: scraped.email, phone: scraped.phone, address: scraped.address };
    const audit = await auditService.run(scraped);
    leadData.audit_score = audit.score;
    leadData.audit_data  = audit.issues;
    leadData.priority    = audit.score < 50 ? 'seo' : 'normal';
  }

  const { data, error } = await supabase.from('leads').insert(leadData).select().single();
  if (error) { logger.error(`DB error: ${error.message}`); return null; }
  return data;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
