// backend/routes/demo.routes.js
import { Router } from 'express';
import { demoService } from '../services/demo.service.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// POST /api/demo/generate
router.post('/generate', async (req, res, next) => {
  try {
    const { lead_id } = req.body;
    if (!lead_id) return res.status(400).json({ error: 'lead_id requerido' });

    const { data: lead } = await supabase.from('io_pro_leads').select('*').eq('id', lead_id).single();
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    const result = await demoService.generate(lead);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /demo/:slug — Sirve el HTML de la demo (ruta pública)
router.get('/:slug', async (req, res, next) => {
  try {
    const demo = await demoService.getBySlug(req.params.slug);
    res.setHeader('Content-Type', 'text/html');
    res.send(demo.html_content);
  } catch (err) {
    res.status(404).send('<h1>Demo no encontrada</h1>');
  }
});

export default router;
