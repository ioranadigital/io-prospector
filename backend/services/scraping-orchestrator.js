// backend/routes/scraping-orchestrator.js
// Ejecuta el orquestador desde el backend

import { analyzeLeads } from '../scripts/lead-analyzer.js';
import { generateDashboard } from '../scripts/dashboard-generator.js';
import { generateEmails } from '../scripts/email-generator.js';
import { csvExportService } from '../services/csv-export.service.js';
import { supabase } from '../config/supabase.js';

export async function orchestrateProspection(csvPath, prospectionId = null) {
  try {
    // 1. Leer CSV
    const leads = await csvExportService.readCSVFromPath(csvPath);

    // 2. Analizar urgencia
    const analyzedLeads = analyzeLeads(leads);

    // 3. Generar dashboard
    const { filename: dashboardPath } = generateDashboard(analyzedLeads, undefined, prospectionId);

    // 4. Generar emails
    const { csvPath: emailsCsvPath } = generateEmails(analyzedLeads);

    // 5. Guardar leads en Supabase
    if (prospectionId && analyzedLeads.length > 0) {
      const leadsForDB = analyzedLeads.map(lead => ({
        session_id: prospectionId,
        business_name: lead.company_name || lead.nombre || 'Sin nombre',
        website: lead.website || null,
        city: lead.city || lead.ciudad || null,
        category: lead.category || lead.categoria || null,
        phone: lead.phone || lead.telefono || null,
        email: lead.email || lead.correo || null,
        gmb_rating: lead.gmb_rating || null,
        review_count: lead.review_count || null,
        gmb_claimed: lead.gmb_claimed || false,
        has_website: !!lead.website,
        ssl_active: lead.ssl_active || false,
        load_time_ms: lead.load_time_ms || null,
        is_mobile_responsive: lead.is_mobile_responsive || false,
        has_schema: lead.has_schema || false,
        broken_links_count: lead.broken_links_count || null,
        photo_count: lead.photo_count || null,
        gmb_description: lead.gmb_description || null,
        gmb_has_hours: lead.gmb_has_hours || false,
        gmb_hours_updated: lead.gmb_hours_updated || false,
        audit_score: Math.round(lead.urgency_score || 0),
        audit_data: lead.issues ? Object.fromEntries(Object.entries(lead.issues).map(([k, v]) => [k, !!v])) : {},
        priority: lead.priority || 'normal',
        crm_status: 'new',
        status: 'candidate', // candidato: no aparece en Leads hasta que se promueve manualmente
        source: 'prospector',
        main_competitor: lead.main_competitor || null,
        missing_service: lead.missing_service || null,
        icebreaker: lead.icebreaker || null,
        seo_gap: lead.seo_gap || null,
      }));

      const { error: insertError } = await supabase
        .from('io_pro_leads')
        .insert(leadsForDB);

      if (insertError) {
        console.warn(`⚠️ Error guardando leads en BD: ${insertError.message}`);
      } else {
        console.log(`✅ ${leadsForDB.length} leads guardados en Supabase tabla io_pro_leads`);
      }
    }

    return {
      dashboardPath,
      emailsCsvPath,
      leadsCount: leads.length,
      analyzedLeadsCount: analyzedLeads.length,
    };
  } catch (error) {
    throw new Error(`Orchestration failed: ${error.message}`);
  }
}

export default { orchestrateProspection };
