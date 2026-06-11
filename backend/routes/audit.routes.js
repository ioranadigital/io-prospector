import { Router } from 'express';
import { auditUrl } from '../services/auditor/index.js';
import { logger }   from '../utils/logger.js';

const router = Router();

router.post('/url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    logger.info(`🔍 Auditando: ${url}`);
    const result = await auditUrl(url);
    res.json(result);
  } catch (err) {
    logger.error('Audit error:', err.message);
    const msg = err.message || '';
    // URL inaccesible (DNS, conexión, timeout, SSL...) → error de cliente, no del servidor
    const unreachable = /ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|ERR_ADDRESS_UNREACHABLE|ENOTFOUND|ERR_ABORTED|ERR_SOCKET|ERR_CERT|ERR_SSL|net::ERR|timeout|Timeout|ERR_TIMED_OUT/i.test(msg);
    if (unreachable) {
      return res.status(400).json({
        code: 'URL_UNREACHABLE',
        error: 'No se pudo acceder a la URL. Comprueba que el dominio existe y está online (sin errores de DNS, conexión o certificado).',
      });
    }
    res.status(500).json({ code: 'AUDIT_ERROR', error: 'Error al auditar el sitio. Inténtalo de nuevo en unos segundos.' });
  }
});

export default router;
