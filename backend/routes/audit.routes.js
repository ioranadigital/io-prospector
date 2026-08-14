import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { auditQueueService } from '../services/audit-queue.service.js';
import { logger }   from '../utils/logger.js';

const router = Router();

// Cada auditoría lanza un Chromium headless — un límite más estricto que el
// genérico de /api (100/min) evita que un cliente sature la cola de audits
// aunque las peticiones de encolado en sí sean baratas.
router.use(rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true }));

// POST /api/audit/url — encola la auditoría y responde de inmediato con el
// job_id. El resultado se recoge con GET /status/:jobId (polling desde el
// frontend, ver frontend/lib/api.ts → auditUrl()).
router.post('/url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const jobId = await auditQueueService.enqueue(url);
    logger.info(`🔍 Auditoría encolada: ${url} (job ${jobId})`);
    res.status(202).json({ jobId });
  } catch (err) {
    logger.error('Error al encolar auditoría:', err.message);
    res.status(500).json({ code: 'AUDIT_ERROR', error: 'No se pudo encolar la auditoría. Inténtalo de nuevo.' });
  }
});

// GET /api/audit/status/:jobId
router.get('/status/:jobId', async (req, res) => {
  try {
    const status = await auditQueueService.getStatus(req.params.jobId);
    if (!status) return res.status(404).json({ error: 'Auditoría no encontrada (puede haber expirado)' });
    res.json(status);
  } catch (err) {
    logger.error('Error consultando estado de auditoría:', err.message);
    res.status(500).json({ code: 'AUDIT_ERROR', error: 'Error al consultar el estado de la auditoría.' });
  }
});

export default router;
