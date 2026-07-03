// backend/routes/scraping.routes.js
// Rutas para scraping y generación de CSVs

import { Router } from 'express';
import { z } from 'zod';
import { createHash, randomBytes, randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { startProspectionV2 } from '../services/prospector-v2.service.js';
import { prospectionStateService } from '../services/prospection-state.service.js';
import { orchestrateProspection } from '../services/scraping-orchestrator.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Esquema de validación
// Nota: el frontend envía '' para campos opcionales vacíos; .optional() solo acepta
// undefined, por eso normalizamos '' / null -> undefined antes de validar.
const emptyToUndef = (schema) => z.preprocess(v => (v === '' || v === null ? undefined : v), schema);

const ProspectionSchema = z.object({
  query: z.string().min(2).max(100),
  city: z.string().min(2).max(80),
  ccaa: emptyToUndef(z.string().min(1).max(50).optional()),
  provincia: emptyToUndef(z.string().min(1).max(50).optional()),
  municipio: emptyToUndef(z.string().min(1).max(80).optional()),
  category: emptyToUndef(z.string().min(2).max(80).optional()),
  pagesFrom: z.coerce.number().int().min(2).max(10).default(2),
  pagesTo: z.coerce.number().int().min(2).max(15).default(4),
});

// POST /api/scraping/start — Inicia prospección completa (scraping + dashboard + emails)
router.post('/start', async (req, res, next) => {
  try {
    const params = ProspectionSchema.parse(req.body);
    const prospectionId = generateId();

    // Crear estado inicial
    prospectionStateService.create(prospectionId, params);

    res.json({
      sessionId: prospectionId,
      status: 'starting',
      message: 'Prospección iniciada',
      params,
    });

    // Ejecutar en background (sin esperar)
    executeProspectionAsync(prospectionId, params);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// GET /api/scraping/status/:id — Obtener estado de una prospección
router.get('/status/:id', (req, res) => {
  const state = prospectionStateService.get(req.params.id);

  if (!state) {
    return res.status(404).json({ error: 'Prospección no encontrada' });
  }

  res.json(state);
});

// GET /api/scraping/history — Historial de prospecciones
router.get('/history', (req, res) => {
  const history = prospectionStateService.getHistory(20);
  res.json(history);
});

// GET /api/scraping/download/:id/:type — Descargar archivos (csv, dashboard, emails)
router.get('/download/:id/:type', (req, res) => {
  const state = prospectionStateService.get(req.params.id);

  if (!state || state.status !== 'completed') {
    return res.status(404).json({ error: 'Prospección no encontrada o aún procesando' });
  }

  const fileType = req.params.type; // csv, dashboard, emails
  let filePath = null;

  if (fileType === 'csv' && state.result?.csvPath) {
    filePath = state.result.csvPath;
  } else if (fileType === 'dashboard' && state.result?.dashboardPath) {
    filePath = state.result.dashboardPath;
  } else if (fileType === 'emails' && state.result?.emailsCsvPath) {
    filePath = state.result.emailsCsvPath;
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Archivo ${fileType} no encontrado` });
  }

  res.download(filePath);
});

// GET /api/scraping/view/:id/:type — Ver archivos en navegador (HTML)
router.get('/view/:id/:type', async (req, res) => {
  const state = prospectionStateService.get(req.params.id);
  const prospectionId = req.params.id;
  const fileType = req.params.type;

  // Debug logs
  console.log(`📊 Dashboard request: ${prospectionId}, type: ${fileType}`);
  console.log(`   State exists:`, !!state);
  console.log(`   State status:`, state?.status);
  console.log(`   State result:`, state?.result);

  if (!state) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`
      <html>
      <head><meta charset="UTF-8"><title>Error 404</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #f5f5f5;">
        <h1>❌ Prospección no encontrada</h1>
        <p><strong>ID:</strong> ${prospectionId}</p>
        <p>No existe prospección con ese ID en el sistema.</p>
        <p><a href="http://localhost:3000/prospector">← Volver al Prospector</a></p>
      </body>
      </html>
    `);
  }

  if (state.status !== 'completed') {
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(202).send(`
      <html>
      <head><meta charset="UTF-8"><title>En Progreso</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #f5f5f5;">
        <h1>⏳ Prospección aún en progreso</h1>
        <p><strong>ID:</strong> ${prospectionId}</p>
        <p><strong>Estado:</strong> ${state.status}</p>
        <p><strong>Progreso:</strong> ${state.progress || 0}%</p>
        <p style="margin-top: 2rem;">
          <script>
            setTimeout(() => location.reload(), 3000);
          </script>
          Recargando en 3 segundos...
        </p>
        <p><a href="http://localhost:3000/prospector">← Volver al Prospector</a></p>
      </body>
      </html>
    `);
  }

  let filePath = null;

  if (fileType === 'dashboard' && state.result?.dashboardPath) {
    filePath = state.result.dashboardPath;
  }

  // Debug log para ruta
  console.log(`   File path:`, filePath);
  console.log(`   File exists:`, filePath ? fs.existsSync(filePath) : false);

  if (!filePath) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`
      <html>
      <head><meta charset="UTF-8"><title>Error 404</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #f5f5f5;">
        <h1>❌ Dashboard no generado</h1>
        <p><strong>ID:</strong> ${prospectionId}</p>
        <p>El dashboard no se ha generado correctamente. Intenta nuevamente.</p>
        <p><a href="http://localhost:3000/prospector">← Volver al Prospector</a></p>
      </body>
      </html>
    `);
  }

  if (!fs.existsSync(filePath)) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`
      <html>
      <head><meta charset="UTF-8"><title>Error 404</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #f5f5f5;">
        <h1>❌ Archivo no encontrado</h1>
        <p><strong>ID:</strong> ${prospectionId}</p>
        <p><strong>Ruta esperada:</strong> <code>${filePath}</code></p>
        <p>El archivo se movió o fue eliminado.</p>
        <p><a href="http://localhost:3000/prospector">← Volver al Prospector</a></p>
      </body>
      </html>
    `);
  }

  try {
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    const htmlContent = await marked(markdownContent);
    const htmlPage = buildDashboardHTML(htmlContent, state);

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlPage);
  } catch (err) {
    console.error(`❌ Error reading dashboard: ${err.message}`);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(`
      <html>
      <head><meta charset="UTF-8"><title>Error 500</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #f5f5f5;">
        <h1>❌ Error generando dashboard</h1>
        <p><strong>Error:</strong> ${err.message}</p>
        <p><a href="http://localhost:3000/prospector">← Volver al Prospector</a></p>
      </body>
      </html>
    `);
  }
});

// GET /api/scraping/status-simple — Status del sistema
router.get('/status-simple', (req, res) => {
  res.json({
    status: 'available',
    message: 'Sistema de scraping activo',
    features: ['SerpAPI', 'Email/Phone extraction', 'HTTPS check', 'GMB scraping (best-effort)'],
  });
});

// GET /api/scraping/debug/:id — Debug de prospección específica
router.get('/debug/:id', (req, res) => {
  const state = prospectionStateService.get(req.params.id);

  if (!state) {
    return res.json({ error: 'Prospección no encontrada', id: req.params.id });
  }

  // Verificar archivos
  const dashboardPath = state.result?.dashboardPath;
  const csvPath = state.result?.csvPath;
  const emailsCsvPath = state.result?.emailsCsvPath;

  return res.json({
    id: req.params.id,
    status: state.status,
    progress: state.progress,
    params: state.params,
    result: {
      leadsCount: state.result?.leadsCount,
      dashboardPath,
      dashboardExists: dashboardPath ? fs.existsSync(dashboardPath) : false,
      csvPath,
      csvExists: csvPath ? fs.existsSync(csvPath) : false,
      emailsCsvPath,
      emailsCsvExists: emailsCsvPath ? fs.existsSync(emailsCsvPath) : false,
    },
    error: state.error || null,
    createdAt: state.createdAt,
    completedAt: state.completedAt,
  });
});

// Funciones auxiliares
function generateId() {
  return randomUUID();
}

async function executeProspectionAsync(prospectionId, params) {
  // 0. Crear la sesión en BD (necesaria para la FK de io_pro_leads y para histórico/analytics).
  //    upsert para ser idempotente frente al guardado manual del frontend.
  const { error: sessionErr } = await supabase.from('io_pro_search_sessions').upsert({
    id: prospectionId,
    query: params.query,
    city: params.city,
    category: params.category || null,
    ccaa: params.ccaa || null,
    provincia: params.provincia || null,
    municipio: params.municipio || null,
    pages_from: params.pagesFrom,
    pages_to: params.pagesTo,
    status: 'running',
  }, { onConflict: 'id' });
  if (sessionErr) console.warn(`⚠️ No se pudo crear la sesión en BD: ${sessionErr.message}`);

  try {
    // 1. Scraping
    prospectionStateService.updateProgress(prospectionId, 10);
    const scrapingResult = await startProspectionV2({ ...params, sessionId: prospectionId });

    if (!scrapingResult.success || !scrapingResult.csvPath) {
      throw new Error('Scraping failed');
    }

    // 2. Orquestar (procesar CSV + generar dashboard + emails + guardar leads en BD)
    prospectionStateService.updateProgress(prospectionId, 50);
    const orchestrateResult = await orchestrateProspection(scrapingResult.csvPath, prospectionId);

    // 3. Completado
    prospectionStateService.complete(prospectionId, {
      csvPath: scrapingResult.csvPath,
      dashboardPath: orchestrateResult.dashboardPath,
      emailsCsvPath: orchestrateResult.emailsCsvPath,
      leadsCount: scrapingResult.leadsFound,
    });
    await supabase.from('io_pro_search_sessions').update({
      status: 'completed',
      total_found: scrapingResult.leadsFound || orchestrateResult.analyzedLeadsCount || 0,
      finished_at: new Date().toISOString(),
    }).eq('id', prospectionId);

    console.log(`✅ Prospección completada: ${prospectionId}`);
  } catch (error) {
    prospectionStateService.error(prospectionId, error.message);
    await supabase.from('io_pro_search_sessions').update({
      status: 'error',
      error_message: error.message,
      finished_at: new Date().toISOString(),
    }).eq('id', prospectionId);
    console.error(`❌ Prospección error: ${prospectionId} - ${error.message}`);
  }
}

function buildDashboardHTML(htmlContent, state) {
  const query = state.params?.query || state.params?.category;
  const city = state.params?.city;
  const leadsCount = state.result?.leadsCount || 0;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — ${query} en ${city}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #e4e4e7;
      background: #09090b;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 3rem;
      border-bottom: 2px solid #27272a;
      padding-bottom: 2rem;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #fafafa;
      margin-bottom: 1rem;
      margin-top: 1.5rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.8rem;
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
    }

    h3 {
      font-size: 1.3rem;
      color: #d4d4d8;
    }

    p {
      margin-bottom: 1rem;
      color: #a1a1a6;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    thead {
      background: #27272a;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #f4f4f5;
      border-bottom: 2px solid #3f3f46;
    }

    td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid #27272a;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background: #27272a;
    }

    code {
      background: #27272a;
      color: #fbbf24;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 0.5rem;
      padding: 1.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
      color: #d4d4d8;
    }

    pre code {
      background: none;
      color: inherit;
      padding: 0;
      border-radius: 0;
    }

    strong {
      color: #fafafa;
      font-weight: 600;
    }

    a {
      color: #3b82f6;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s;
    }

    a:hover {
      border-bottom-color: #3b82f6;
      color: #60a5fa;
    }

    ul, ol {
      margin: 1rem 0 1rem 2rem;
      color: #a1a1a6;
    }

    li {
      margin-bottom: 0.5rem;
    }

    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #71717a;
      font-style: italic;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .meta-item {
      background: #18181b;
      border: 1px solid #27272a;
      padding: 1rem;
      border-radius: 0.5rem;
    }

    .meta-label {
      color: #71717a;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .meta-value {
      color: #fafafa;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-meta {
      display: flex;
      gap: 2rem;
      margin: 1rem 0 2rem 0;
      flex-wrap: wrap;
    }

    .header-meta-item {
      font-size: 0.9rem;
      color: #a1a1a6;
    }

    .header-meta-label {
      color: #71717a;
      display: block;
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
    }

    hr {
      border: none;
      border-top: 2px solid #27272a;
      margin: 2rem 0;
    }

    details {
      cursor: pointer;
      user-select: none;
    }

    details summary {
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 4px;
      background: #27272a;
      color: #f4f4f5;
      border: 1px solid #3f3f46;
      list-style: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    details summary:hover {
      background: #3f3f46;
      border-color: #52525b;
    }

    details summary::-webkit-details-marker {
      color: #3b82f6;
      margin-right: 4px;
    }

    details[open] summary {
      background: #3f3f46;
      border-color: #3b82f6;
    }

    details > div {
      margin-top: 8px;
      padding: 10px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 4px;
      font-size: 0.9em;
      line-height: 1.5;
    }

    details > div ul,
    details > div ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    details > div li {
      margin-bottom: 4px;
    }

  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Dashboard de Prospección</h1>
      <div class="header-meta">
        <div class="header-meta-item">
          <span class="header-meta-label">🔍 Búsqueda</span>
          <strong>${query}</strong> en <strong>${city}</strong>
        </div>
        <div class="header-meta-item">
          <span class="header-meta-label">📈 Leads encontrados</span>
          <strong>${leadsCount}</strong>
        </div>
        <div class="header-meta-item">
          <span class="header-meta-label">📅 Generado</span>
          <strong>${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
        </div>
      </div>
    </header>

    <main>
      ${htmlContent}
    </main>


    <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #27272a; text-align: center; color: #71717a; font-size: 0.875rem;">
      <p>Dashboard generado automáticamente • <a href="/">Volver a Prospector</a></p>
    </footer>
  </div>
</body>
</html>`;
}

export default router;
