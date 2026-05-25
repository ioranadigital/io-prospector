// backend/routes/search.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { startProspection } from '../services/prospector.service.js';
import { supabase } from '../config/supabase.js';
import { queryGenerator } from '../utils/query-generator.js';

const router = Router();

// Esquema de validación
const SearchSchema = z.object({
  query:     z.string().min(2).max(100),
  city:      z.string().min(2).max(80),
  category:  z.string().min(2).max(80),
  pagesFrom: z.number().int().min(2).max(10).default(2),
  pagesTo:   z.number().int().min(2).max(15).default(4),
});

// POST /api/search/start — Inicia prospección
router.post('/start', async (req, res, next) => {
  try {
    const params = SearchSchema.parse(req.body);
    // Arrancar en background sin bloquear respuesta
    startProspection(params).catch(err =>
      console.error('Prospection background error:', err)
    );
    res.json({ message: 'Prospección iniciada', params });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// GET /api/search/sessions — Historial de sesiones
router.get('/sessions', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('search_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase error on /sessions:', error);
      // En desarrollo, devolver array vacío si Supabase no está disponible
      if (process.env.NODE_ENV !== 'production') {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    if (process.env.NODE_ENV !== 'production') {
      return res.json([]);
    }
    next(err);
  }
});

// GET /api/search/sessions/:id — Detalle de sesión + sus leads
router.get('/sessions/:id', async (req, res, next) => {
  try {
    const { data: session } = await supabase
      .from('search_sessions').select('*').eq('id', req.params.id).single();
    const { data: leads } = await supabase
      .from('leads').select('*').eq('session_id', req.params.id);
    res.json({ session, leads });
  } catch (err) { next(err); }
});

// GET /api/search/queries — Sugerencias de queries por categoría + ciudad
router.get('/queries', (req, res) => {
  const { category, city } = req.query;
  const suggestions = queryGenerator.generate({ category, city });
  res.json(suggestions);
});

// GET /api/search/categories — Lista de categorías disponibles
router.get('/categories', (_, res) => {
  res.json(queryGenerator.categories);
});

export default router;
