// backend/routes/crm.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';

const router = Router();

const CRM_STATUSES = ['new', 'contacted', 'interested', 'reserved', 'sold', 'upselling', 'lost'];

// GET /api/crm/kanban — Leads agrupados por estado
router.get('/kanban', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('io_pro_leads')
      .select('id,business_name,city,category,audit_score,priority,crm_status,phone,email,last_contact_at,next_follow_up,notes')
      .order('updated_at', { ascending: false });
    if (error) throw error;

    const kanban = Object.fromEntries(CRM_STATUSES.map(s => [s, []]));
    for (const lead of data) {
      if (kanban[lead.crm_status]) kanban[lead.crm_status].push(lead);
    }
    res.json(kanban);
  } catch (err) { next(err); }
});

// PATCH /api/crm/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(CRM_STATUSES) }).parse(req.body);
    const { data } = await supabase
      .from('io_pro_leads').update({ crm_status: status }).eq('id', req.params.id).select().single();

    await supabase.from('io_pro_lead_activities').insert({
      lead_id: req.params.id, type: 'status_change', body: `Estado → ${status}`,
    });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/crm/stats
router.get('/stats', async (req, res, next) => {
  try {
    const { data } = await supabase.from('io_pro_leads').select('crm_status');
    const stats = CRM_STATUSES.reduce((acc, s) => {
      acc[s] = data.filter(l => l.crm_status === s).length;
      return acc;
    }, {});
    res.json(stats);
  } catch (err) { next(err); }
});

export default router;
