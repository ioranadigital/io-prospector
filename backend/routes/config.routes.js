import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { auditService } from '../services/audit.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { data } = await supabase.from('app_config').select('*');
    res.json(Object.fromEntries(data.map(r => [r.key, r.value])));
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
    const { data } = await supabase.from('message_templates').select('*').order('type');
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/templates/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'body', 'subject', 'is_active'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const { data } = await supabase.from('message_templates').update(updates).eq('id', req.params.id).select().single();
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
