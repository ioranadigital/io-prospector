// backend/scripts/email-generator.js
// Genera correos personalizados para cada lead basados en sus datos y gaps

import fs from 'fs';
import path from 'path';
import { paths } from '../config/paths.js';

export function generateEmails(leads, outputDir = null) {
  outputDir = outputDir || paths.dashboardsDir;
  const emails = leads
    .filter(l => l.email)
    .map(lead => ({
      to: lead.email,
      subject: buildSubject(lead),
      body_text: buildBodyText(lead),
      body_html: buildBodyHTML(lead),
      metadata: {
        company: lead.company_name,
        first_name: lead.first_name,
        campaign_type: lead.campaign_type,
        priority: lead.priority,
      },
    }));

  // Guardar CSV de emails
  const emailsCsv = buildEmailsCSV(emails);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const csvPath = path.join(outputDir, `emails-${new Date().toISOString().split('T')[0]}.csv`);
  fs.writeFileSync(csvPath, emailsCsv, 'utf8');

  console.log(`✅ ${emails.length} correos generados: ${csvPath}`);
  return { emails, csvPath };
}

function buildSubject(lead) {
  const subjects = {
    web_design: `${lead.company_name} — Aumenta clientes con web profesional`,
    ssl_upgrade: `⚠️ ${lead.company_name} — Tu web NO es segura (HTTPS)`,
    gmb_claim: `📍 ${lead.company_name} — Reclama tu perfil en Google Maps`,
    reputation: `⭐ ${lead.company_name} — Mejora tu reputación online`,
    optimization: `🚀 ${lead.company_name} — Aparecer en Top 3 de Google`,
  };

  return subjects[lead.campaign_type] || `${lead.company_name} — Oportunidad SEO`;
}

function buildBodyText(lead) {
  const greeting = `Hola ${lead.first_name},`;

  let hook = '';
  if (lead.icebreaker) {
    hook = `\n${lead.icebreaker}\n`;
  } else if (lead.main_competitor) {
    hook = `\nHe visto que ${lead.main_competitor} te está ganando en Google. Hablemos de cómo cambiar eso.\n`;
  } else {
    hook = `\nTrabajamos con negocios como el tuyo para aumentar visibilidad en Google.\n`;
  }

  let problem = getProblemStatement(lead);
  let cta = getCallToAction(lead);

  return `${greeting}${hook}

${problem}

${cta}

Un cordial saludo,
Equipo de SEO Local — Iorana Digital
www.ioranadigital.es`;
}

function buildBodyHTML(lead) {
  const text = buildBodyText(lead);
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .greeting { font-size: 16px; margin-bottom: 15px; }
    .hook { font-size: 15px; font-weight: bold; color: #0066cc; margin: 15px 0; }
    .problem { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #ff9800; }
    .cta { margin: 25px 0; padding: 15px; background: #e3f2fd; border-radius: 5px; text-align: center; }
    .cta a { color: white; background: #0066cc; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block; }
    .signature { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="greeting">${text.split('\n')[0]}</div>
    <div class="hook">${lead.icebreaker || (lead.main_competitor ? `He visto que <strong>${lead.main_competitor}</strong> te está ganando en Google.` : 'Trabajamos con negocios como el tuyo...')}</div>
    <div class="problem">${getProblemStatement(lead)}</div>
    <div class="cta">${getCallToAction(lead)}</div>
    <div class="signature">Equipo de SEO Local — Iorana Digital</div>
  </div>
</body>
</html>`;
  return html;
}

function getProblemStatement(lead) {
  const statements = [];

  if (!lead.has_website) {
    statements.push(`🌐 **Sin página web**: Tus clientes potenciales no te encuentran. Una web profesional aumenta credibilidad y ventas.`);
  }

  if (lead.has_website && !lead.ssl_active) {
    statements.push(`🔒 **Sin HTTPS**: Tu web no es segura. Google la penaliza en búsqueda y Chrome advierte a visitantes.`);
  }

  if (!lead.gmb_claimed) {
    statements.push(`📍 **Google Maps sin reclamar**: Pierdes el 40% de búsquedas locales. Apareces, pero sin control sobre info.`);
  }

  if (lead.gmb_rating < 4.0 && lead.review_count > 0) {
    statements.push(`⭐ **Reputación baja (${lead.gmb_rating}/5)**: Tus reseñas te están perdiendo clientes. Hay solución.`);
  }

  if (lead.missing_service) {
    statements.push(`⚙️ **Servicio no optimizado**: "${lead.missing_service}" no aparece optimizado en tu web ni en Maps.`);
  }

  if (lead.seo_gap) {
    statements.push(`📊 **Gap técnico**: ${lead.seo_gap}`);
  }

  if (statements.length === 0) {
    statements.push(`Hemos analizado tu presencia digital y encontramos oportunidades de mejora que podrían multiplicar tus leads.`);
  }

  return statements.join('\n\n');
}

function getCallToAction(lead) {
  const ctas = {
    web_design: `¿Te gustaría que revisemos cómo una web profesional podría aumentar tus clientes?\n👉 [Agendar llamada de 15 min]`,
    ssl_upgrade: `Es fácil y rápido. ¿Llamamos para explicarte cómo?\n👉 [Agendar llamada de 15 min]`,
    gmb_claim: `Te ayudamos a reclamarlo y optimizarlo. ¿Hablamos?\n👉 [Agendar llamada de 15 min]`,
    reputation: `Podemos mejorar tu reputación y responder a críticas profesionalmente.\n👉 [Agendar llamada de 15 min]`,
    optimization: `Te mostramos qué está perdiendo clientes en tu web actual.\n👉 [Agendar llamada de 15 min]`,
  };

  return ctas[lead.campaign_type] || `¿Hablamos de cómo mejorar tu presencia en Google?\n👉 [Agendar llamada de 15 min]`;
}

function buildEmailsCSV(emails) {
  const headers = ['To', 'Subject', 'Campaign', 'Priority', 'Status'];
  const rows = emails.map(e => [
    e.to,
    `"${e.subject.replace(/"/g, '""')}"`,
    e.metadata.campaign_type,
    e.metadata.priority,
    'pending',
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export default { generateEmails };
