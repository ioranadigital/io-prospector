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
  // TIER 1: Críticos
  no_phone:         (s) => !s.hasPhone,
  no_email:         (s) => !s.hasEmail,
  no_contact_form:  (s) => !s.hasContactForm,
  no_gmb:           (s) => !s.hasGMB,
  no_address:       (s) => !s.hasAddress,
  no_ssl:           (s) => !s.isHTTPS,
  no_privacy_policy:(s) => !s.hasPrivacyPolicy,
  no_trust_badges:  (s) => !s.hasTrustBadges,

  // TIER 2: Conversión
  no_h1:            (s) => !s.hasH1,
  no_cta:           (s) => !s.hasCTAs || s.ctaCount < 2,
  no_meta_desc:     (s) => !s.hasMetaDesc || s.metaDescLength < 50,
  low_content:      (s) => s.wordCount < 300,
  not_mobile:       (s) => !s.hasViewport,
  no_og_tags:       (s) => !s.hasOG,
  no_schema_markup: (s) => !s.hasSchema,
  no_analytics:     (s) => !s.hasAnalytics,
  no_favicon:       (s) => !s.hasFavicon,

  // TIER 3: Credibilidad & Presencia
  no_gallery:       (s) => !s.hasGallery,
  no_social_links:  (s) => !s.hasSocialLinks,
  no_blog:          (s) => !s.hasBlog,
  no_certifications:(s) => !s.hasCertifications,

  // TIER 4: Rendimiento & Técnico
  no_map:           (s) => !s.hasMapIntegrated,
  no_image_optimization: (s) => !s.hasCompressedImages,

  // TIER 5: Engagement & Social
  no_share_buttons: (s) => !s.hasShareButtons,
  no_newsletter:    (s) => !s.hasNewsletter,
  no_whatsapp:      (s) => !s.hasWhatsApp,
  no_multiple_forms:(s) => !s.hasMultipleForms,

  broken_links:     (_) => false,
  slow_lcp:         (_) => false,
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
