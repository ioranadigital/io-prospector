// backend/routes/leads.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/leads — Lista con filtros
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, city, min_score, max_score, session_id, page = 1, limit = 50 } = req.query;

    console.log(`📖 GET /leads - Filtros:`, { session_id, status, city, page });

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('audit_score', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status)     query = query.eq('crm_status', status);
    if (priority)   query = query.eq('priority', priority);
    if (city)       query = query.ilike('city', `%${city}%`);
    if (session_id) query = query.eq('session_id', session_id);
    if (min_score)  query = query.gte('audit_score', Number(min_score));
    if (max_score)  query = query.lte('audit_score', Number(max_score));

    const { data, count, error } = await query;

    if (error) {
      console.error(`❌ Error en query:`, error);
      throw error;
    }

    console.log(`✅ Leads encontrados: ${data?.length || 0}`);

    // Si se filtra por session_id, retornar solo array para simplificar
    if (session_id) {
      return res.json(data || []);
    }

    res.json({ data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(`🔴 /leads endpoint error:`, err.message);
    next(err);
  }
});

// GET /api/leads/:id — Lead completo + actividades
router.get('/:id', async (req, res, next) => {
  try {
    const [{ data: lead }, { data: activities }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', req.params.id).single(),
      supabase.from('lead_activities').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: false }),
    ]);
    res.json({ lead, activities });
  } catch (err) { next(err); }
});

// PATCH /api/leads/:id — Actualizar campos
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['crm_status', 'notes', 'next_follow_up', 'priority', 'email', 'phone'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const { data, error } = await supabase
      .from('leads').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// DELETE /api/leads/:id — Eliminar lead
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

// DELETE /api/leads/session/:sessionId — Limpiar sesión completa
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { error } = await supabase.from('leads').delete().eq('session_id', req.params.sessionId);
    if (error) throw error;
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

// POST /api/leads/:id/activity — Registrar actividad manual
router.post('/:id/activity', async (req, res, next) => {
  try {
    const schema = z.object({
      type:        z.enum(['call', 'email', 'whatsapp', 'note', 'status_change']),
      direction:   z.enum(['outbound', 'inbound']).optional(),
      subject:     z.string().optional(),
      body:        z.string().optional(),
      outcome:     z.string().optional(),
      duration_sec: z.number().optional(),
    });
    const payload = schema.parse(req.body);
    const { data, error } = await supabase
      .from('lead_activities')
      .insert({ lead_id: req.params.id, ...payload })
      .select().single();
    if (error) throw error;

    // Actualizar last_contact_at en el lead
    await supabase.from('leads')
      .update({ last_contact_at: new Date() })
      .eq('id', req.params.id);

    res.json(data);
  } catch (err) { next(err); }
});

export default router;
