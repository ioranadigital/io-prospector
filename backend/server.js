// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger.js';

import searchRoutes   from './routes/search.routes.js';
import scrapingRoutes from './routes/scraping.routes.js';
import leadsRoutes    from './routes/leads.routes.js';
import contactRoutes  from './routes/contact.routes.js';
import crmRoutes      from './routes/crm.routes.js';
import demoRoutes     from './routes/demo.routes.js';
import configRoutes   from './routes/config.routes.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware global ──────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3002').split(',').map(url => url.trim());
console.log('Allowed CORS origins:', allowedOrigins);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Debug: log todas las requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Rate limiting: 100 req/min por IP
app.use('/api', rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true }));

// ── Rutas ─────────────────────────────────────────────────
app.use('/api/search',   searchRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/leads',    leadsRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/crm',      crmRoutes);
app.use('/api/demo',     demoRoutes);
app.use('/api/config',   configRoutes);

// Demo pública (sin prefijo /api)
app.use('/demo', demoRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// Error handler global
app.use((err, req, res, _next) => {
  console.error('🔴 Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'UNKNOWN',
    path: req.path
  });
});

app.listen(PORT, () => logger.info(`🚀 Backend corriendo en http://localhost:${PORT}`));
