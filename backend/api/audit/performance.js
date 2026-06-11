import { performanceAuditService } from '../../services/seo-technical/performance-audit.service.js';
import { supabase } from '../../config/supabase.js';
import { logger } from '../../utils/logger.js';

export async function POST(req, res) {
  const { url, prospection_id } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  logger.info(`Starting performance audit for: ${url}`);

  try {
    // Ejecutar auditoría
    const auditResult = await performanceAuditService.auditPerformanceAndCanonical(url);

    // Guardar en BD
    const { data, error } = await supabase
      .from('io_pro_scraping_raw')
      .update({
        ttfb_ms: auditResult.ttfb_ms,
        lcp_ms: auditResult.largest_contentful_paint_ms,
        cls: auditResult.cumulative_layout_shift,
        canonical_url: auditResult.canonical_url,
        canonical_is_valid: auditResult.canonical_is_valid,
        h1_count: auditResult.h1_count,
        h1_is_unique: auditResult.h1_is_unique,
        robots_txt_status: auditResult.robots_txt_status,
        has_noindex: auditResult.has_noindex,
        top_issue: auditResult.top_issue,
        top_issue_severity: auditResult.top_issue_severity,
        updated_at: new Date().toISOString()
      })
      .eq('website', url)
      .select();

    if (error) throw error;

    logger.info(`Performance audit completed for ${url}`);

    res.json({
      success: true,
      url,
      prospection_id,
      audit: auditResult,
      saved: !!data?.length,
    });
  } catch (error) {
    logger.error('Performance audit endpoint error:', error.message);
    res.status(500).json({
      error: 'Audit failed',
      details: error.message,
    });
  }
}
