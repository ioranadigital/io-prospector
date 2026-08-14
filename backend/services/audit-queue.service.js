// backend/services/audit-queue.service.js
// Cola Bull para /api/audit/url — antes cada auditoría bloqueaba un request
// HTTP completo (11-20s) ejecutando Playwright dentro del propio proceso
// Express, sin límite de cuántas auditorías podían correr en paralelo. Ver
// "Sprint 3" de docs/analysis/AUDITORIA-MODULO-AUDITORIA-SEO-2026-08-13.md.
//
// El límite de concurrencia (AUDIT_QUEUE_CONCURRENCY) es la defensa
// principal: por muchas peticiones que lleguen, nunca corren más de N
// instancias de Chromium a la vez en este contenedor.
import Queue from 'bull';
import { auditUrl } from './auditor/index.js';
import { logger } from '../utils/logger.js';
import { getRedisConnectionOptions } from '../utils/redis-config.js';

const AUDIT_CONCURRENCY = parseInt(process.env.AUDIT_QUEUE_CONCURRENCY || '2', 10);

const auditQueue = new Queue('audits', {
  redis: getRedisConnectionOptions(),
  defaultJobOptions: {
    attempts: 1, // una auditoría fallida no se reintenta sola — que el usuario decida relanzarla
    removeOnComplete: { age: 3600 }, // 1h de margen para que el frontend recoja el resultado
    removeOnFail: { age: 3600 },
  },
});

// Mismo criterio que tenía el endpoint síncrono original: distinguir "URL
// inaccesible" (error de cliente) de un fallo real del motor de auditoría.
const UNREACHABLE_RE = /ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|ERR_ADDRESS_UNREACHABLE|ENOTFOUND|ERR_ABORTED|ERR_SOCKET|ERR_CERT|ERR_SSL|net::ERR|timeout|Timeout|ERR_TIMED_OUT/i;

auditQueue.process(AUDIT_CONCURRENCY, async (job) => {
  const { url } = job.data;
  try {
    return await auditUrl(url);
  } catch (err) {
    const code = UNREACHABLE_RE.test(err.message || '') ? 'URL_UNREACHABLE' : 'AUDIT_ERROR';
    // Bull solo conserva err.message al serializar el fallo — se codifica el
    // código de error como prefijo para poder reconstruirlo en getStatus().
    throw new Error(`${code}::${err.message}`);
  }
});

auditQueue.on('failed', (job, err) => {
  logger.error(`Audit job ${job.id} failed: ${err.message}`);
});

export const auditQueueService = {
  async enqueue(url) {
    const job = await auditQueue.add({ url });
    return job.id;
  },

  async getStatus(jobId) {
    const job = await auditQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();

    if (state === 'completed') {
      return { status: 'completed', result: job.returnvalue };
    }

    if (state === 'failed') {
      const [code, ...rest] = (job.failedReason || '').split('::');
      const isKnownCode = code === 'URL_UNREACHABLE' || code === 'AUDIT_ERROR';
      return {
        status: 'failed',
        code: isKnownCode ? code : 'AUDIT_ERROR',
        error: isKnownCode
          ? (rest.join('::') || 'Error al auditar el sitio. Inténtalo de nuevo en unos segundos.')
          : (job.failedReason || 'Error al auditar el sitio. Inténtalo de nuevo en unos segundos.'),
      };
    }

    // waiting | active | delayed | paused
    return { status: 'processing' };
  },
};
