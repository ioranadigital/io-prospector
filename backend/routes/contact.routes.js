// backend/routes/contact.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { contactService } from '../services/contact.service.js';
import { queueService } from '../services/queue.service.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// POST /api/contact/email
router.post('/email', async (req, res, next) => {
  try {
    const schema = z.object({
      lead_id:     z.string().uuid(),
      template_id: z.string().uuid().optional(),
      subject:     z.string().min(1),
      body:        z.string().min(1),
      to:          z.string().email(),
    });
    const { lead_id, ...mailData } = schema.parse(req.body);

    await contactService.sendEmail(mailData);

    // Registrar actividad
    await supabase.from('io_pro_lead_activities').insert({
      lead_id, type: 'email', direction: 'outbound',
      subject: mailData.subject, body: mailData.body, outcome: 'sent',
    });
    await supabase.from('io_pro_leads').update({ last_contact_at: new Date(), crm_status: 'contacted' }).eq('id', lead_id);

    res.json({ sent: true });
  } catch (err) { next(err); }
});

// POST /api/contact/whatsapp
router.post('/whatsapp', async (req, res, next) => {
  try {
    const schema = z.object({
      lead_id:  z.string().uuid(),
      phone:    z.string().min(9),
      message:  z.string().min(1),
      intensity: z.enum(['soft', 'medium', 'hard']).optional(),
    });
    const { lead_id, phone, message } = schema.parse(req.body);

    await contactService.sendWhatsApp({ phone, message });

    await supabase.from('io_pro_lead_activities').insert({
      lead_id, type: 'whatsapp', direction: 'outbound', body: message, outcome: 'sent',
    });
    await supabase.from('io_pro_leads').update({ last_contact_at: new Date(), crm_status: 'contacted' }).eq('id', lead_id);

    res.json({ sent: true });
  } catch (err) { next(err); }
});

// GET /api/contact/templates — Todas las plantillas
router.get('/templates', async (req, res, next) => {
  try {
    const { type } = req.query;
    let q = supabase.from('io_pro_message_templates').select('*').eq('is_active', true);
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/contact/templates/render — Renderiza plantilla con datos del lead
router.post('/templates/render', async (req, res, next) => {
  try {
    const { template_id, lead_id } = req.body;
    const [{ data: tpl }, { data: lead }, { data: config }] = await Promise.all([
      supabase.from('io_pro_message_templates').select('*').eq('id', template_id).single(),
      supabase.from('io_pro_leads').select('*').eq('id', lead_id).single(),
      supabase.from('app_config').select('*'),
    ]);
    const cfg = Object.fromEntries(config.map(c => [c.key, c.value]));

    // Extraer issues del audit_data para el template
    const issues = lead.audit_data
      ? Object.entries(lead.audit_data).filter(([, v]) => v).map(([k]) => `• ${k.replace(/_/g, ' ')}`).join('\n')
      : '';

    const rendered = {
      subject: (tpl.subject || '').replace(/\{\{(\w+)\}\}/g, (_, key) =>
        lead[key] ?? cfg[key] ?? issues ?? ''),
      body: tpl.body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (key === 'audit_issues') return issues;
        if (key === 'issue_count')  return Object.values(lead.audit_data || {}).filter(Boolean).length;
        if (key === 'top_issue')    return Object.keys(lead.audit_data || {}).find(k => lead.audit_data[k]) || '';
        return lead[key] ?? cfg[key] ?? `{{${key}}}`;
      }),
    };
    res.json(rendered);
  } catch (err) { next(err); }
});

// POST /api/contact/bulk-emails — Envío masivo de emails
router.post('/bulk-emails', async (req, res, next) => {
  try {
    const schema = z.object({
      lead_ids: z.array(z.string().uuid()),
      subject: z.string().min(1),
      body: z.string().min(1),
      template_id: z.string().uuid().optional(),
    });
    const { lead_ids, subject, body, template_id } = schema.parse(req.body);

    const result = await queueService.sendBulkEmails({ lead_ids, subject, body, template_id });
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/contact/bulk-whatsapp — Envío masivo de WhatsApp
router.post('/bulk-whatsapp', async (req, res, next) => {
  try {
    const schema = z.object({
      lead_ids: z.array(z.string().uuid()),
      message: z.string().min(1),
      intensity: z.enum(['soft', 'medium', 'hard']).optional(),
      template_id: z.string().uuid().optional(),
    });
    const { lead_ids, message, intensity, template_id } = schema.parse(req.body);

    const result = await queueService.sendBulkWhatsApp({ lead_ids, message, intensity, template_id });
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/contact/bulk-emails/:batchId/status
router.get('/bulk-emails/:batchId/status', async (req, res, next) => {
  try {
    const status = await queueService.getBatchStatus(req.params.batchId);
    res.json(status);
  } catch (err) { next(err); }
});

// GET /api/contact/bulk-whatsapp/:batchId/status
router.get('/bulk-whatsapp/:batchId/status', async (req, res, next) => {
  try {
    const status = await queueService.getBatchStatus(req.params.batchId);
    res.json(status);
  } catch (err) { next(err); }
});

export default router;
