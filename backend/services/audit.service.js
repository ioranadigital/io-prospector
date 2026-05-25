// backend/services/audit.service.js
// Servicio independiente y pluggable. Añadir reglas sin tocar el resto.
import { supabase } from '../config/supabase.js';

let _cache = null;
let _cacheTs = 0;
const TTL = 5 * 60 * 1000;

async function getRules() {
  if (_cache && Date.now() - _cacheTs < TTL) return _cache;
  const { data } = await supabase.from('audit_rules').select('*').eq('enabled', true);
  _cache = data || [];
  _cacheTs = Date.now();
  return _cache;
}

// Para añadir una nueva regla: 1) INSERT en Supabase, 2) añadir evaluador aquí
const EVALUATORS = {
  no_h1:            (s) => !s.hasH1,
  no_https:         (s) => !s.isHTTPS,
  no_cta:           (s) => !s.hasCTAs || s.ctaCount < 2,
  no_meta_desc:     (s) => !s.hasMetaDesc || s.metaDescLength < 50,
  low_content:      (s) => s.wordCount < 300,
  not_mobile:       (s) => !s.hasViewport,
  no_og_tags:       (s) => !s.hasOG,
  no_schema_markup: (s) => !s.hasSchema,
  no_analytics:     (s) => !s.hasAnalytics,
  no_favicon:       (s) => !s.hasFavicon,
  broken_links:     (_) => false,  // Requiere check adicional
  slow_lcp:         (_) => false,  // Requiere Lighthouse
};

export const auditService = {
  async run(scraped) {
    const rules  = await getRules();
    const seo    = scraped.seo || {};
    const issues = {};
    let   score  = 100;

    for (const rule of rules) {
      const eval_ = EVALUATORS[rule.rule_key];
      if (!eval_) continue;
      const hasIssue = eval_(seo);
      issues[rule.rule_key] = hasIssue;
      if (hasIssue) score += rule.penalty;
    }

    return { score: Math.max(0, score), issues };
  },

  invalidateCache() { _cache = null; },
};
