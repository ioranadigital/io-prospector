// backend/scripts/lead-analyzer.js
// Clasifica leads por urgencia y problemas detectados

export function analyzeLeads(leads) {
  return leads.map(lead => analyzeLeadScore(lead)).sort((a, b) => b.urgency_score - a.urgency_score);
}

function analyzeLeadScore(lead) {
  let urgency_score = 0;
  const issues = [];

  // 🔴 CRÍTICO: Sin GMB reclamado
  if (!lead.gmb_claimed) {
    urgency_score += 40;
    issues.push('GMB_NO_CLAIMED');
  }

  // 🔴 CRÍTICO: Sin web
  if (!lead.has_website) {
    urgency_score += 40;
    issues.push('NO_WEBSITE');
  }

  // 🟠 ALTO: Sin HTTPS
  if (lead.has_website && !lead.ssl_active) {
    urgency_score += 25;
    issues.push('NO_HTTPS');
  }

  // 🟠 ALTO: Reputación baja (< 4 estrellas con reseñas)
  if (lead.review_count > 0 && lead.gmb_rating < 4.0) {
    urgency_score += 25;
    issues.push('LOW_REPUTATION');
  }

  // 🟡 MEDIO: Sin reseñas pero con GMB
  if (lead.gmb_claimed && lead.review_count === 0) {
    urgency_score += 10;
    issues.push('NO_REVIEWS');
  }

  // 🟡 MEDIO: Sin servicio optimizado
  if (lead.missing_service) {
    urgency_score += 10;
    issues.push('MISSING_SERVICE');
  }

  // 🟡 MEDIO: Sitio lento (> 3 segundos)
  if (lead.has_website && lead.load_time_ms > 3000) {
    urgency_score += 15;
    issues.push('SLOW_SITE');
  }

  // 🟡 MEDIO: No es responsive (mobile)
  if (lead.has_website && !lead.is_mobile_responsive) {
    urgency_score += 20;
    issues.push('NOT_MOBILE_RESPONSIVE');
  }

  // 🟡 BAJO: Pocas fotos en GMB (< 5)
  if (lead.gmb_claimed && lead.photo_count < 5) {
    urgency_score += 8;
    issues.push('FEW_PHOTOS');
  }

  // 🟡 BAJO: Descripción muy corta (< 100 caracteres)
  if (lead.gmb_claimed && lead.gmb_description && lead.gmb_description.length < 100) {
    urgency_score += 5;
    issues.push('SHORT_DESCRIPTION');
  }

  // 🟠 ALTO: Sin Schema/JSON-LD
  if (lead.has_website && !lead.has_schema) {
    urgency_score += 18;
    issues.push('NO_SCHEMA');
  }

  // 🟠 ALTO: Enlaces rotos
  if (lead.has_website && lead.broken_links_count > 0) {
    urgency_score += 12;
    issues.push('BROKEN_LINKS');
  }

  // 🟡 MEDIO: Horarios no actualizados en GMB
  if (lead.gmb_claimed && !lead.gmb_hours_updated) {
    urgency_score += 10;
    issues.push('OUTDATED_HOURS');
  }

  // Determinar categoría de campaña
  let campaign_type = 'optimization';
  if (!lead.has_website) campaign_type = 'web_design';
  else if (!lead.ssl_active) campaign_type = 'ssl_upgrade';
  else if (!lead.is_mobile_responsive) campaign_type = 'optimization';
  else if (!lead.gmb_claimed) campaign_type = 'gmb_claim';
  else if (lead.gmb_rating < 4.0) campaign_type = 'reputation';

  return {
    ...lead,
    urgency_score: Math.min(100, urgency_score),
    issues,
    campaign_type,
    priority: urgency_score >= 50 ? 'HIGH' : urgency_score >= 25 ? 'MEDIUM' : 'LOW',
  };
}

export function summarizeIssues(leads) {
  const summary = {
    total_leads: leads.length,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
    issues_count: {},
  };

  const issueTypes = {
    GMB_NO_CLAIMED: 'Sin GMB reclamado',
    NO_WEBSITE: 'Sin página web',
    NO_HTTPS: 'Sin HTTPS activo',
    LOW_REPUTATION: 'Reputación baja (< 4⭐)',
    NO_REVIEWS: 'Sin reseñas en GMB',
    MISSING_SERVICE: 'Servicio no optimizado',
    SLOW_SITE: 'Sitio lento (> 3s)',
    NOT_MOBILE_RESPONSIVE: 'No responsive (mobile)',
    FEW_PHOTOS: 'Pocas fotos en GMB (< 5)',
    SHORT_DESCRIPTION: 'Descripción muy corta',
    NO_SCHEMA: 'Sin Schema/JSON-LD',
    BROKEN_LINKS: 'Enlaces rotos (404)',
    OUTDATED_HOURS: 'Horarios no actualizados',
  };

  leads.forEach(lead => {
    if (lead.priority === 'HIGH') summary.high_priority++;
    else if (lead.priority === 'MEDIUM') summary.medium_priority++;
    else summary.low_priority++;

    lead.issues.forEach(issue => {
      summary.issues_count[issueTypes[issue]] = (summary.issues_count[issueTypes[issue]] || 0) + 1;
    });
  });

  return summary;
}

export default { analyzeLeads, summarizeIssues };
