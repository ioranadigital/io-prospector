import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { auditService } from '../services/audit.service.js';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('app_config').select('*');
    if (error) console.warn('config load warning:', error.message);
    res.json(Object.fromEntries((data || []).map(r => [r.key, r.value])));
  } catch (err) { next(err); }
});

router.patch('/', async (req, res, next) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await supabase.from('app_config').upsert({ key, value }, { onConflict: 'key' });
    }
    res.json({ updated: true });
  } catch (err) { next(err); }
});

router.get('/audit-rules', async (req, res, next) => {
  try {
    const { data } = await supabase.from('audit_rules').select('*').order('category');
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/audit-rules/:id', async (req, res, next) => {
  try {
    const allowed = ['penalty', 'enabled', 'label', 'description'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const { data } = await supabase.from('audit_rules').update(updates).eq('id', req.params.id).select().single();
    auditService.invalidateCache();
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/templates', async (req, res, next) => {
  try {
    const { data } = await supabase.from('io_pro_message_templates').select('*').order('type');
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/templates', async (req, res, next) => {
  try {
    const { name, type, category, subject, body, is_active } = req.body;
    const { data, error } = await supabase.from('io_pro_message_templates').insert({
      name,
      type,
      category,
      subject,
      body,
      is_active: is_active ?? true,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.patch('/templates/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'body', 'subject', 'is_active'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const { data } = await supabase.from('io_pro_message_templates').update(updates).eq('id', req.params.id).select().single();
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/prospections/save', async (req, res, next) => {
  try {
    const { id, query, city, category, pages_from, pages_to, status, total_found } = req.body;

    if (!query || !city) {
      return res.status(400).json({ error: 'Missing required fields: query, city' });
    }

    // Generar un UUID válido si el id no es UUID
    let prospectionId = id;
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      prospectionId = randomUUID();
    }

    const { data, error } = await supabase.from('io_pro_search_sessions').upsert({
      id: prospectionId,
      query,
      city,
      category: category || null,
      pages_from: pages_from || 2,
      pages_to: pages_to || 3,
      status: status || 'completed',
      total_found: total_found || 0,
    }, { onConflict: 'id' }).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

export default router;
