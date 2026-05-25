// backend/config/paths.js
// Configuración centralizada de rutas relativas y dinámicas
// Alineada con E:\master.env

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar .env local si existe
dotenv.config({ path: '.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BACKEND_DIR = path.resolve(PROJECT_ROOT, 'backend');

/**
 * Configuración de rutas del proyecto
 * Usa variables de entorno con fallbacks a rutas relativas
 */
export const paths = {
  // Directorios del proyecto
  projectRoot: PROJECT_ROOT,
  backendDir: BACKEND_DIR,
  frontendDir: path.resolve(PROJECT_ROOT, 'frontend'),
  
  // Directorios de datos y salida
  prospectorDataDir: process.env.PROSPECTOR_DATA_DIR || path.resolve('E:\\Prospector-Data'),
  dashboardsDir: process.env.DASHBOARDS_DIR || path.resolve(PROJECT_ROOT, 'dashboards'),
  
  // Subdirectorios
  scriptsDir: path.resolve(BACKEND_DIR, 'scripts'),
  servicesDir: path.resolve(BACKEND_DIR, 'services'),
  routesDir: path.resolve(BACKEND_DIR, 'routes'),
  
  // API y URLs
  backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default paths;
