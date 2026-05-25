// backend/scripts/dashboard-generator.js
// Genera un Dashboard visual en Markdown con resumen y análisis de leads

import fs from 'fs';
import path from 'path';
import { summarizeIssues } from './lead-analyzer.js';
import { paths } from '../config/paths.js';

export function generateDashboard(leads, outputDir = null, prospectionId = null) {
  outputDir = outputDir || paths.dashboardsDir;
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0];
  const filePrefix = prospectionId ? `prospection-${prospectionId}` : `prospection-${timestamp}`;
  const filename = path.join(outputDir, `${filePrefix}.md`);

  const summary = summarizeIssues(leads);
  const markdown = buildMarkdown(leads, summary, timestamp);

  fs.writeFileSync(filename, markdown, 'utf8');
  console.log(`✅ Dashboard generado: ${filename}`);
  return { filename, summary };
}

function buildMarkdown(leads, summary, timestamp) {
  const highPriority = leads.filter(l => l.priority === 'HIGH');
  const mediumPriority = leads.filter(l => l.priority === 'MEDIUM');
  const lowPriority = leads.filter(l => l.priority === 'LOW');

  // Gráfico ASCII de distribución de problemas
  const issuesChart = buildIssuesChart(summary.issues_count);

  // Tabla resumen
  const html = `# 📊 DASHBOARD DE PROSPECCIÓN
**Generado:** ${new Date(timestamp).toLocaleDateString('es-ES')} · **Iorana Digital**

---

## 📈 RESUMEN EJECUTIVO

| Métrica | Valor | % |
|---------|-------|-----|
| **Total de leads** | ${summary.total_leads} | 100% |
| **🔴 Prioridad Alta** | ${summary.high_priority} | ${((summary.high_priority/summary.total_leads)*100).toFixed(0)}% |
| **🟠 Prioridad Media** | ${summary.medium_priority} | ${((summary.medium_priority/summary.total_leads)*100).toFixed(0)}% |
| **🟡 Prioridad Baja** | ${summary.low_priority} | ${((summary.low_priority/summary.total_leads)*100).toFixed(0)}% |

---

## 🔍 PROBLEMAS MÁS COMUNES

\`\`\`
${issuesChart}
\`\`\`

---

## 🎯 LEADS POR PRIORIDAD

### 🔴 PRIORIDAD ALTA (${summary.high_priority} leads)
*Estos son tus mejores oportunidades. Campaña inmediata recomendada.*

<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<thead style="background:#27272a;">
<tr>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Empresa</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Email</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Teléfono</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Sitio Web</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Problemas</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Puntuación</th>
</tr>
</thead>
<tbody>
${highPriority.slice(0, 20).map(l => `
<tr style="border:1px solid #27272a;">
<td style="padding:10px;border:1px solid #27272a;font-weight:600;">${l.company_name}</td>
<td style="padding:10px;border:1px solid #27272a;">${l.email || '—'}</td>
<td style="padding:10px;border:1px solid #27272a;">${l.phone || '—'}</td>
<td style="padding:10px;border:1px solid #27272a;">${l.website ? `<a href="${l.website}" target="_blank" style="color:#3b82f6;">🌐 Web</a>` : '❌'}</td>
<td style="padding:10px;border:1px solid #27272a;">${getIssuesDescription(l.issues)}</td>
<td style="padding:10px;border:1px solid #27272a;font-weight:600;">${l.urgency_score}/100</td>
</tr>
`).join('')}
</tbody>
</table>

${highPriority.length > 20 ? `\n*+ ${highPriority.length - 20} más...*\n` : ''}

### 🟠 PRIORIDAD MEDIA (${summary.medium_priority} leads)
*Oportunidades secundarias. Considera campañas orientadas a su tipo de problema.*

<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
<thead style="background:#27272a;">
<tr>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Empresa</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Email</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Teléfono</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Sitio Web</th>
<th style="padding:10px;text-align:left;border:1px solid #3f3f46;">Problemas</th>
</tr>
</thead>
<tbody>
${mediumPriority.slice(0, 15).map(l => `
<tr style="border:1px solid #27272a;">
<td style="padding:10px;border:1px solid #27272a;font-weight:600;">${l.company_name}</td>
<td style="padding:10px;border:1px solid #27272a;">${l.email || '—'}</td>
<td style="padding:10px;border:1px solid #27272a;">${l.phone || '—'}</td>
<td style="padding:10px;border:1px solid #27272a;">${l.website ? `<a href="${l.website}" target="_blank" style="color:#3b82f6;">🌐 Web</a>` : '❌'}</td>
<td style="padding:10px;border:1px solid #27272a;">${getIssuesDescription(l.issues)}</td>
</tr>
`).join('')}
</tbody>
</table>

${mediumPriority.length > 15 ? `\n*+ ${mediumPriority.length - 15} más...*\n` : ''}

### 🟡 PRIORIDAD BAJA (${summary.low_priority} leads)
*Leads con menos urgencia. Nutrición/seguimiento posterior.*

---

## 📋 ANÁLISIS DETALLADO

### Desglose por tipo de campaña

${buildCampaignBreakdown(leads)}

### Análisis Detallado de Problemas Detectados

${buildProblemsDetail(leads)}

### Reputación en Google Maps

| Rango | Cantidad | % |
|-------|----------|-----|
| ⭐⭐⭐⭐⭐ (4.5+) | ${leads.filter(l => l.gmb_rating >= 4.5).length} | ${((leads.filter(l => l.gmb_rating >= 4.5).length/summary.total_leads)*100).toFixed(0)}% |
| ⭐⭐⭐⭐ (4.0-4.5) | ${leads.filter(l => l.gmb_rating >= 4.0 && l.gmb_rating < 4.5).length} | ${((leads.filter(l => l.gmb_rating >= 4.0 && l.gmb_rating < 4.5).length/summary.total_leads)*100).toFixed(0)}% |
| ⭐⭐⭐ (3.0-4.0) | ${leads.filter(l => l.gmb_rating >= 3.0 && l.gmb_rating < 4.0).length} | ${((leads.filter(l => l.gmb_rating >= 3.0 && l.gmb_rating < 4.0).length/summary.total_leads)*100).toFixed(0)}% |
| ⭐⭐ o menos | ${leads.filter(l => l.gmb_rating < 3.0).length} | ${((leads.filter(l => l.gmb_rating < 3.0).length/summary.total_leads)*100).toFixed(0)}% |

---

## 🚀 PRÓXIMOS PASOS

1. **Generar correos personalizados** para cada lead de prioridad alta
2. **Definir icebreakers** basados en competencia y gaps detectados
3. **Programar envío escalonado** (máx 20/día para evitar spam filters)
4. **Monitorizar respuestas** y ajustar mensajes según feedback

---

*Dashboard generado automáticamente · Análisis técnico por Iorana Digital*
`;

  return html;
}

function buildIssuesChart(issuesCount) {
  let chart = '';
  const maxCount = Math.max(...Object.values(issuesCount));

  Object.entries(issuesCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([issue, count]) => {
      const percentage = ((count / maxCount) * 100).toFixed(0);
      const bars = '█'.repeat(Math.ceil(count / 5));
      chart += `${issue.padEnd(25)} ${bars} ${count}\n`;
    });

  return chart;
}

function getIssueIcon(issue) {
  const icons = {
    GMB_NO_CLAIMED: '📍',
    NO_WEBSITE: '🌐',
    NO_HTTPS: '🔒',
    LOW_REPUTATION: '⭐',
    NO_REVIEWS: '💬',
    MISSING_SERVICE: '⚙️',
    SLOW_SITE: '⚡',
    NOT_MOBILE_RESPONSIVE: '📱',
    FEW_PHOTOS: '📷',
    SHORT_DESCRIPTION: '📝',
    NO_SCHEMA: '🏷️',
    BROKEN_LINKS: '🔗',
    OUTDATED_HOURS: '⏰',
  };
  return icons[issue] || '❓';
}

function getIssuesDescription(issues) {
  if (!issues || issues.length === 0) {
    return '✅ Sin problemas';
  }

  const descriptions = {
    GMB_NO_CLAIMED: 'Sin GMB reclamado',
    NO_WEBSITE: 'Sin página web',
    NO_HTTPS: 'Sin HTTPS activo',
    LOW_REPUTATION: 'Reputación baja',
    NO_REVIEWS: 'Sin reseñas en GMB',
    MISSING_SERVICE: 'Servicio no optimizado',
    SLOW_SITE: 'Sitio lento',
    NOT_MOBILE_RESPONSIVE: 'No responsive',
    FEW_PHOTOS: 'Pocas fotos GMB',
    SHORT_DESCRIPTION: 'Descripción corta',
    NO_SCHEMA: 'Sin Schema',
    BROKEN_LINKS: 'Enlaces rotos',
    OUTDATED_HOURS: 'Horarios desactualizados',
  };

  const detailsList = issues
    .map(issue => `- ${getIssueIcon(issue)} ${descriptions[issue] || issue}`)
    .join('\n');

  const summary = issues.length === 1
    ? `1 problema`
    : `${issues.length} problemas detectados`;

  return `<details style="display:inline-block;cursor:pointer;user-select:none;">
<summary style="font-weight:600;padding:4px 8px;border-radius:4px;background:#27272a;color:#f4f4f5;border:1px solid #3f3f46;">
${summary}
</summary>
<div style="margin-top:8px;padding:8px;background:#18181b;border:1px solid #27272a;border-radius:4px;font-size:0.9em;">

${detailsList}

</div>
</details>`;
}

function buildCampaignBreakdown(leads) {
  const campaigns = {
    web_design: 'Diseño Web',
    ssl_upgrade: 'Actualización SSL',
    gmb_claim: 'Reclamación GMB',
    reputation: 'Gestión de Reputación',
    optimization: 'Optimización SEO',
  };

  let breakdown = '';
  Object.entries(campaigns).forEach(([type, label]) => {
    const count = leads.filter(l => l.campaign_type === type).length;
    if (count > 0) {
      breakdown += `- **${label}**: ${count} leads (${((count/leads.length)*100).toFixed(0)}%)\n`;
    }
  });

  return breakdown;
}

function buildProblemsDetail(leads) {
  const problems = [
    {
      code: 'NO_WEBSITE',
      icon: '🌐',
      nombre: 'Sin Página Web',
      impacto: '40 pts',
      severidad: '🔴 CRÍTICO',
      count: leads.filter(l => !l.has_website).length,
      description: 'Empresas sin presencia web. Pierden oportunidades de leads y ventas.',
      stats: () => {
        const affected = leads.filter(l => !l.has_website);
        return affected.length > 0 ? `${affected.length} leads (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Crear página web profesional (costo-beneficio muy alto)',
    },
    {
      code: 'GMB_NO_CLAIMED',
      icon: '📍',
      nombre: 'Google Maps sin Reclamar',
      impacto: '40 pts',
      severidad: '🔴 CRÍTICO',
      count: leads.filter(l => !l.gmb_claimed).length,
      description: 'Perfil de Google Maps no reclamado. No pueden gestionar reseñas ni información.',
      stats: () => {
        const affected = leads.filter(l => !l.gmb_claimed);
        return affected.length > 0 ? `${affected.length} leads (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Reclamar perfil en Google My Business (gratuito, alto impacto)',
    },
    {
      code: 'NO_HTTPS',
      icon: '🔒',
      nombre: 'Sin HTTPS/SSL Activo',
      impacto: '25 pts',
      severidad: '🟠 ALTO',
      count: leads.filter(l => l.has_website && !l.ssl_active).length,
      description: 'Sitio web sin certificado SSL. Afecta SEO y confianza de usuarios.',
      stats: () => {
        const affected = leads.filter(l => l.has_website && !l.ssl_active);
        return affected.length > 0 ? `${affected.length} webs (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Instalar certificado SSL (desde $50/año, mejora SEO +5-10%)',
    },
    {
      code: 'NOT_MOBILE_RESPONSIVE',
      icon: '📱',
      nombre: 'No Responsive (Mobile)',
      impacto: '20 pts',
      severidad: '🟠 ALTO',
      count: leads.filter(l => l.has_website && !l.is_mobile_responsive).length,
      description: 'Sitio web no optimizado para móvil. 60%+ del tráfico es desde móvil.',
      stats: () => {
        const affected = leads.filter(l => l.has_website && !l.is_mobile_responsive);
        return affected.length > 0 ? `${affected.length} webs (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Implementar responsive design (mejora CTR +25-40%)',
    },
    {
      code: 'SLOW_SITE',
      icon: '⚡',
      nombre: 'Sitio Lento (> 3s)',
      impacto: '15 pts',
      severidad: '🟠 ALTO',
      count: leads.filter(l => l.has_website && l.load_time_ms > 3000).length,
      description: 'Sitio web carga lentamente. Cada segundo cuesta conversiones.',
      stats: () => {
        const affected = leads.filter(l => l.has_website && l.load_time_ms > 3000);
        if (affected.length === 0) return 'N/A';
        const avgTime = (affected.reduce((sum, l) => sum + (l.load_time_ms || 0), 0) / affected.length).toFixed(0);
        return `${affected.length} webs | Tiempo promedio: ${avgTime}ms`;
      },
      recommendation: '→ **Acción**: Optimizar velocidad (cache, CDN, compresión de imágenes)',
    },
    {
      code: 'LOW_REPUTATION',
      icon: '⭐',
      nombre: 'Reputación Baja (< 4.0⭐)',
      impacto: '25 pts',
      severidad: '🟠 ALTO',
      count: leads.filter(l => l.review_count > 0 && l.gmb_rating < 4.0).length,
      description: 'Empresas con calificación baja en Google Maps. Necesitan gestión de reputación.',
      stats: () => {
        const affected = leads.filter(l => l.review_count > 0 && l.gmb_rating < 4.0);
        if (affected.length === 0) return 'N/A';
        const avgRating = (affected.reduce((sum, l) => sum + (l.gmb_rating || 0), 0) / affected.length).toFixed(1);
        const totalReviews = affected.reduce((sum, l) => sum + (l.review_count || 0), 0);
        return `${affected.length} leads | Rating promedio: ${avgRating}⭐ | ${totalReviews} reseñas totales`;
      },
      recommendation: '→ **Acción**: Gestión de reputación, responder reviews, solicitar reseñas positivas',
    },
    {
      code: 'NO_REVIEWS',
      icon: '💬',
      nombre: 'Sin Reseñas en GMB',
      impacto: '10 pts',
      severidad: '🟡 MEDIO',
      count: leads.filter(l => l.gmb_claimed && l.review_count === 0).length,
      description: 'Perfil de Google Maps reclamado pero sin reseñas. Reducen conversión.',
      stats: () => {
        const affected = leads.filter(l => l.gmb_claimed && l.review_count === 0);
        return affected.length > 0 ? `${affected.length} leads (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Campaña de solicitud de reseñas a clientes recientes',
    },
    {
      code: 'FEW_PHOTOS',
      icon: '📷',
      nombre: 'Pocas Fotos en GMB (< 5)',
      impacto: '8 pts',
      severidad: '🟡 MEDIO',
      count: leads.filter(l => l.gmb_claimed && l.photo_count < 5).length,
      description: 'GMB con pocas fotos. Las fotos aumentan enganche y confianza.',
      stats: () => {
        const affected = leads.filter(l => l.gmb_claimed && l.photo_count < 5);
        if (affected.length === 0) return 'N/A';
        const avgPhotos = (affected.reduce((sum, l) => sum + (l.photo_count || 0), 0) / affected.length).toFixed(1);
        return `${affected.length} leads | Fotos promedio: ${avgPhotos}`;
      },
      recommendation: '→ **Acción**: Subir fotos de calidad del negocio, equipo, clientes',
    },
    {
      code: 'SHORT_DESCRIPTION',
      icon: '📝',
      nombre: 'Descripción Muy Corta',
      impacto: '5 pts',
      severidad: '🟡 BAJO',
      count: leads.filter(l => l.gmb_claimed && l.gmb_description && l.gmb_description.length < 100).length,
      description: 'Descripción del negocio muy corta. Google recomienda 200+ caracteres.',
      stats: () => {
        const affected = leads.filter(l => l.gmb_claimed && l.gmb_description && l.gmb_description.length < 100);
        return affected.length > 0 ? `${affected.length} leads (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Escribir descripción detallada de servicios y fortalezas',
    },
    {
      code: 'MISSING_SERVICE',
      icon: '⚙️',
      nombre: 'Servicio No Optimizado',
      impacto: '10 pts',
      severidad: '🟡 MEDIO',
      count: leads.filter(l => l.missing_service).length,
      description: 'Empresas con servicios/información incompleta o mal optimizada.',
      stats: () => {
        const affected = leads.filter(l => l.missing_service);
        return affected.length > 0 ? `${affected.length} leads (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Optimizar descripción de servicios en Google Maps y web',
    },
    {
      code: 'NO_SCHEMA',
      icon: '🏷️',
      nombre: 'Sin Schema/JSON-LD',
      impacto: '18 pts',
      severidad: '🟠 ALTO',
      count: leads.filter(l => l.has_website && !l.has_schema).length,
      description: 'Sitio web sin datos estructurados. Afecta visibilidad en resultados ricos.',
      stats: () => {
        const affected = leads.filter(l => l.has_website && !l.has_schema);
        return affected.length > 0 ? `${affected.length} webs (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Implementar Schema.org (LocalBusiness, Product, Review) - mejora CTR +15-20%',
    },
    {
      code: 'BROKEN_LINKS',
      icon: '🔗',
      nombre: 'Enlaces Rotos (404)',
      impacto: '12 pts',
      severidad: '🟠 ALTO',
      count: leads.filter(l => l.has_website && l.broken_links_count > 0).length,
      description: 'Sitio con enlaces rotos. Afecta experiencia de usuario y SEO.',
      stats: () => {
        const affected = leads.filter(l => l.has_website && l.broken_links_count > 0);
        if (affected.length === 0) return 'N/A';
        const totalBroken = affected.reduce((sum, l) => sum + (l.broken_links_count || 0), 0);
        return `${affected.length} webs | ${totalBroken} enlaces rotos detectados`;
      },
      recommendation: '→ **Acción**: Auditar enlaces internos, reparar 404s, usar herramienta como Screaming Frog',
    },
    {
      code: 'OUTDATED_HOURS',
      icon: '⏰',
      nombre: 'Horarios No Actualizados',
      impacto: '10 pts',
      severidad: '🟡 MEDIO',
      count: leads.filter(l => l.gmb_claimed && !l.gmb_hours_updated).length,
      description: 'Horarios de GMB no actualizados o incompletos. Causas pérdida de clientes.',
      stats: () => {
        const affected = leads.filter(l => l.gmb_claimed && !l.gmb_hours_updated);
        return affected.length > 0 ? `${affected.length} leads (${((affected.length/leads.length)*100).toFixed(0)}%)` : 'N/A';
      },
      recommendation: '→ **Acción**: Verificar y actualizar horarios en Google My Business, incluir excepciones',
    },
  ];

  let detail = '';
  problems.forEach(problem => {
    if (problem.count > 0) {
      detail += `#### ${problem.icon} ${problem.nombre} ${problem.severidad}\n\n`;
      detail += `| Métrica | Valor |\n`;
      detail += `|--------|-------|\n`;
      detail += `| **Leads afectados** | ${problem.stats()} |\n`;
      detail += `| **Impacto en urgencia** | ${problem.impacto} |\n`;
      detail += `| **Descripción** | ${problem.description} |\n\n`;
      detail += `${problem.recommendation}\n\n`;
    }
  });

  return detail || '✅ Sin problemas críticos detectados.\n';
}

export default { generateDashboard };
