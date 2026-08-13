// backend/services/pagespeed.service.js
// Complementa el motor de auditoría (Playwright, lab data de una sola carga
// desde el VPS) con datos de campo reales de Chrome UX Report (CrUX) vía la
// API pública de Google PageSpeed Insights. Funciona sin API key (cuota
// baja, suficiente para auditorías puntuales); con PAGESPEED_API_KEY en
// .env sube la cuota. Ver docs/analysis/AUDITORIA-MODULO-AUDITORIA-SEO-2026-08-13.md.
import { logger } from '../utils/logger.js';
import { fetchWithRetry } from '../utils/fetch-with-retry.js';

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Muchos negocios pequeños auditados en prospección no tienen tráfico real
// suficiente para que Google genere datos de CrUX — es un "no disponible"
// esperado y frecuente, no un error.
export async function getPageSpeedData(url, { timeoutMs = 15000, strategy = 'mobile' } = {}) {
  const params = new URLSearchParams({ url, strategy, category: 'performance' });
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (apiKey) params.set('key', apiKey);

  try {
    const res = await fetchWithRetry(`${ENDPOINT}?${params}`, {
      signal: AbortSignal.timeout(timeoutMs),
    }, { retries: 1, baseDelayMs: 1000 });

    if (!res.ok) {
      logger.warn(`[PageSpeed] ${res.status} para ${url}`);
      return null;
    }

    const data = await res.json();
    const cruxMetrics = data.loadingExperience?.metrics || null;
    const labScore = data.lighthouseResult?.categories?.performance?.score;

    return {
      // Datos de campo (usuarios reales, últimos 28 días) — null si Google
      // no tiene suficiente tráfico real registrado para este origen.
      field: cruxMetrics ? {
        ttfb: cruxMetrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile ?? null,
        fcp:  cruxMetrics.FIRST_CONTENTFUL_PAINT_MS?.percentile ?? null,
        lcp:  cruxMetrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
        cls:  cruxMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null
          ? cruxMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100
          : null,
        overallCategory: data.loadingExperience?.overall_category ?? null,
      } : null,
      // Score de Lighthouse (0-100) — dato de laboratorio de Google, útil
      // como segunda referencia frente al score propio del motor.
      labScore: labScore != null ? Math.round(labScore * 100) : null,
    };
  } catch (err) {
    logger.warn(`[PageSpeed] Error consultando ${url}: ${err.message}`);
    return null;
  }
}

export default { getPageSpeedData };
