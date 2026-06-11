import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/summary', async (req, res, next) => {
  try {
    // ── Prospecciones ──────────────────────────────────────
    const { data: sessions } = await supabase
      .from('io_pro_search_sessions')
      .select('id, total_found, category, city');

    const prospectionsData = sessions || [];
    const totalLeadsFound = prospectionsData.reduce((sum, s) => sum + (s.total_found || 0), 0);
    const totalSessions = prospectionsData.length;

    const topN = (rows, key) => {
      const map = {};
      rows.forEach(r => { if (r[key]) map[r[key]] = (map[r[key]] || 0) + 1; });
      return Object.entries(map)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([k, count]) => ({ [key]: k, count }));
    };
    const topCategories = topN(prospectionsData, 'category');
    const topCities = topN(prospectionsData, 'city');

    // ── Leads (CRM + SEO) ──────────────────────────────────
    const { data: leadsData } = await supabase
      .from('io_pro_leads')
      .select('crm_status, priority, email, phone, website, audit_score, seo_rating, ssl_active, is_mobile_responsive, has_schema, gmb_claimed, broken_links_count, gmb_rating')
      // Excluir candidatos del scraping (aún no promovidos a Leads)
      .or('status.is.null,status.neq.candidate');

    const leads = leadsData || [];
    const totalLeads = leads.length;
    const pct = (n) => (totalLeads > 0 ? Math.round((n / totalLeads) * 100) : 0);
    const countTrue = (field) => leads.filter(l => l[field] === true).length;

    // Funnel CRM
    const crmCounts = { new: 0, contacted: 0, interested: 0, reserved: 0, sold: 0, upselling: 0, lost: 0 };
    leads.forEach(l => { if (l.crm_status && crmCounts[l.crm_status] !== undefined) crmCounts[l.crm_status]++; });

    // Reparto por prioridad
    const priorityCounts = {};
    leads.forEach(l => { const p = l.priority || 'sin definir'; priorityCounts[p] = (priorityCounts[p] || 0) + 1; });

    // Contactabilidad
    const contactability = {
      with_email: leads.filter(l => !!l.email).length,
      with_phone: leads.filter(l => !!l.phone).length,
      with_website: leads.filter(l => !!l.website).length,
      pct_email: pct(leads.filter(l => !!l.email).length),
      pct_phone: pct(leads.filter(l => !!l.phone).length),
      pct_website: pct(leads.filter(l => !!l.website).length),
    };

    // ── SEO (desde leads) ──────────────────────────────────
    const scores = leads
      .map(l => (l.audit_score != null ? l.audit_score : l.seo_rating))
      .filter(s => s != null);
    const avgAuditScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const scoreDistribution = {
      excelente: scores.filter(s => s >= 80).length,
      mejorable: scores.filter(s => s >= 50 && s < 80).length,
      critico: scores.filter(s => s < 50).length,
    };
    const brokenLinks = leads.map(l => l.broken_links_count).filter(n => n != null);
    const gmbRatings = leads.map(l => l.gmb_rating).filter(n => n != null);

    const seoMetrics = {
      total_leads: totalLeads,
      scored_leads: scores.length,
      avg_audit_score: avgAuditScore,
      score_distribution: scoreDistribution,
      pct_has_website: pct(contactability.with_website),
      pct_ssl: pct(countTrue('ssl_active')),
      pct_mobile: pct(countTrue('is_mobile_responsive')),
      pct_schema: pct(countTrue('has_schema')),
      pct_gmb_claimed: pct(countTrue('gmb_claimed')),
      avg_broken_links: brokenLinks.length ? Math.round((brokenLinks.reduce((a, b) => a + b, 0) / brokenLinks.length) * 10) / 10 : 0,
      avg_gmb_rating: gmbRatings.length ? Math.round((gmbRatings.reduce((a, b) => a + b, 0) / gmbRatings.length) * 10) / 10 : 0,
    };

    // ── Auditorías guardadas (io_pro_audit_logs) ───────────
    const { data: auditLogs } = await supabase
      .from('io_pro_audit_logs')
      .select('total_score, pass_count, warn_count, fail_count, created_at');
    const audits = auditLogs || [];
    const auditScores = audits.map(a => a.total_score || 0);
    const auditSummary = {
      total_audits: audits.length,
      avg_score: auditScores.length ? Math.round(auditScores.reduce((a, b) => a + b, 0) / auditScores.length) : 0,
      total_pass: audits.reduce((s, a) => s + (a.pass_count || 0), 0),
      total_warn: audits.reduce((s, a) => s + (a.warn_count || 0), 0),
      total_fail: audits.reduce((s, a) => s + (a.fail_count || 0), 0),
    };

    // ── Actividad de contacto ──────────────────────────────
    const { data: activitiesData } = await supabase
      .from('io_pro_lead_activities')
      .select('type, created_at');
    const activities = activitiesData || [];
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activityCounts = {
      total_emails: activities.filter(a => a.type === 'email').length,
      total_whatsapp: activities.filter(a => a.type === 'whatsapp').length,
      total_calls: activities.filter(a => a.type === 'call').length,
      total_notes: activities.filter(a => a.type === 'note').length,
      recent_7d: activities.filter(a =>
        ['email', 'whatsapp', 'call'].includes(a.type) && new Date(a.created_at) >= since7d
      ).length,
    };

    res.json({
      crm: crmCounts,
      prospections: {
        total_sessions: totalSessions,
        total_leads_found: totalLeadsFound,
        avg_per_session: totalSessions > 0 ? Math.round(totalLeadsFound / totalSessions) : 0,
        top_categories: topCategories,
        top_cities: topCities,
      },
      leads: {
        total: totalLeads,
        priority: priorityCounts,
        contactability,
      },
      seo: seoMetrics,
      audits: auditSummary,
      activity: activityCounts,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
