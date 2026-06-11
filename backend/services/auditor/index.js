import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import * as meta        from './checks/meta.check.js';
import * as headings    from './checks/headings.check.js';
import * as images      from './checks/images.check.js';
import * as links       from './checks/links.check.js';
import * as technical   from './checks/technical.check.js';
import * as performance from './checks/performance.check.js';
import * as content     from './checks/content.check.js';
import * as schema      from './checks/schema.check.js';

// ─── Supabase Client ───────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || '',
  { realtime: { transport: ws } }
);

// ─── Registro de checks (añadir aquí nuevos módulos) ───────────────────────
const CHECKS = [meta, headings, images, links, technical, performance, content, schema];

// ─── Cache de reglas (5 minutos) ──────────────────────────────────────────
let cachedRules = null;
let cacheExpires = 0;

async function loadAuditRules() {
  const now = Date.now();

  // Si cache es válido, retorna
  if (cachedRules && now < cacheExpires) {
    return cachedRules;
  }

  try {
    const { data, error } = await supabase
      .from('io_pro_audit_rules')
      .select('check_id, enabled, penalty, category');

    if (error) {
      console.warn('[Audit] Error loading rules from DB:', error.message);
      return cachedRules || {}; // Fallback a cache viejo o vacío
    }

    // Crear mapa: check_id -> { enabled, penalty, category }
    const rulesMap = {};
    (data || []).forEach(rule => {
      rulesMap[rule.check_id] = {
        enabled: rule.enabled ?? true,
        penalty: rule.penalty ?? 0,
        category: rule.category
      };
    });

    // Cachear por 5 minutos
    cachedRules = rulesMap;
    cacheExpires = now + (5 * 60 * 1000);
    console.log(`[Audit] Rules cached: ${Object.keys(rulesMap).length} rules (expires in 5min)`);

    return rulesMap;
  } catch (err) {
    console.warn('[Audit] Exception loading rules:', err.message);
    return cachedRules || {};
  }
}

// ─── Utilidades ────────────────────────────────────────────────────────────
async function fetchRobotsTxt(url) {
  try {
    const base = new URL(url);
    const res  = await fetch(`${base.origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function measurePerformance(page) {
  try {
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const fcp  = paint.find(p => p.name === 'first-contentful-paint')?.startTime || null;
      const ttfb = nav ? Math.round(nav.responseStart - nav.requestStart) : null;
      const domSize = document.querySelectorAll('*').length;
      return { ttfb, fcp: fcp ? Math.round(fcp) : null, domSize };
    });

    // LCP y CLS via PerformanceObserver — medido durante la carga
    const lcp = await page.evaluate(() =>
      new Promise(resolve => {
        let lcpValue = null;
        const obs = new PerformanceObserver(list => {
          const entries = list.getEntries();
          lcpValue = Math.round(entries[entries.length - 1]?.startTime || 0);
        });
        try { obs.observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
        setTimeout(() => resolve(lcpValue), 2000);
      })
    ).catch(() => null);

    const cls = await page.evaluate(() =>
      new Promise(resolve => {
        let clsValue = 0;
        const obs = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) clsValue += entry.value;
          }
        });
        try { obs.observe({ type: 'layout-shift', buffered: true }); } catch {}
        setTimeout(() => resolve(parseFloat(clsValue.toFixed(3))), 2000);
      })
    ).catch(() => null);

    return { ...metrics, lcp, cls };
  } catch {
    return { ttfb: null, lcp: null, cls: null, fcp: null, domSize: null };
  }
}

// ─── Scoring ───────────────────────────────────────────────────────────────
function calculateScores(checksByCategory) {
  const categories = {};
  let totalWeightedScore = 0;
  let totalWeight        = 0;

  for (const [catId, { label, weight, checks }] of Object.entries(checksByCategory)) {
    const meaningful = checks.filter(c => c.status !== 'info');
    if (meaningful.length === 0) {
      categories[catId] = { label, weight, score: 100, pass: 0, warn: 0, fail: 0, total: 0 };
      continue;
    }

    const pass = meaningful.filter(c => c.status === 'pass').length;
    const warn = meaningful.filter(c => c.status === 'warn').length;
    const fail = meaningful.filter(c => c.status === 'fail').length;

    // pass=100%, warn=50%, fail=0%
    const score = Math.round(((pass + warn * 0.5) / meaningful.length) * 100);

    categories[catId] = { label, weight, score, pass, warn, fail, total: meaningful.length };
    totalWeightedScore += score * weight;
    totalWeight        += weight;
  }

  const totalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  return { categories, totalScore };
}

// ─── Runner principal ──────────────────────────────────────────────────────
export async function auditUrl(rawUrl) {
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const startedAt = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; IOProspector/1.0; +https://iorana.dev)',
    viewport:  { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    // Medir TTFB con timing nativo
    const navigationStart = Date.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    const ttfbRaw = Date.now() - navigationStart;

    // Métricas de performance
    const perfMetrics = await measurePerformance(page);
    const ttfb = perfMetrics.ttfb ?? ttfbRaw;

    // robots.txt en paralelo
    const robotsTxt = await fetchRobotsTxt(url);

    // Contexto compartido para checks que lo necesitan
    const ctx = {
      url,
      robotsTxt,
      ttfb,
      lcp:           perfMetrics.lcp,
      cls:           perfMetrics.cls,
      fcp:           perfMetrics.fcp,
      domSize:       perfMetrics.domSize,
      resourceCount: null,
    };

    // Cargar reglas dinámicamente desde BD
    const auditRules = await loadAuditRules();

    // Ejecutar todos los checks
    const checksByCategory = {};
    for (const check of CHECKS) {
      const results = await check.run(page, ctx);

      // Filtrar checks deshabilitados en la BD
      const filteredResults = results.filter(c => {
        const rule = auditRules[c.id];
        return rule ? rule.enabled !== false : true; // Si no hay regla, incluir por defecto
      });

      checksByCategory[check.id] = {
        label:  check.label,
        weight: check.weight,
        checks: filteredResults,
      };
    }

    const { categories, totalScore } = calculateScores(checksByCategory);

    // Aplanar todos los checks para fácil acceso
    const allChecks = Object.values(checksByCategory).flatMap(c => c.checks);
    const issues    = allChecks.filter(c => c.status === 'fail');
    const warnings  = allChecks.filter(c => c.status === 'warn');

    const summary = {
      pass:     allChecks.filter(c => c.status === 'pass').length,
      warn:     warnings.length,
      fail:     issues.length,
      info:     allChecks.filter(c => c.status === 'info').length,
      total:    allChecks.length,
    };

    const result = {
      url,
      totalScore,
      duration: Date.now() - startedAt,
      auditedAt: new Date().toISOString(),
      categories,
      checks: checksByCategory,
      summary,
      topIssues: issues.slice(0, 5),
      performance: { ttfb, lcp: perfMetrics.lcp, cls: perfMetrics.cls, fcp: perfMetrics.fcp },
    };

    // NOTA: el histórico (io_pro_audit_logs) se guarda SOLO de forma manual
    // desde el frontend (botón "Guardar en Histórico" en /audit-resultados).
    // No se persiste automáticamente aquí para mantener el histórico curado.

    return result;
  } finally {
    await browser.close();
  }
}
