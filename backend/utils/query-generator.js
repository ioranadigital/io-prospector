// backend/utils/query-generator.js

const CATEGORIES = [
  'fontaneros', 'electricistas', 'pintores', 'carpinteros', 'cerrajeros',
  'reformas', 'peluquerías', 'clínicas dentales', 'fisioterapeutas', 'psicólogos',
  'restaurantes', 'abogados', 'gestorías', 'academias', 'gimnasios',
  'talleres mecánicos', 'mudanzas', 'limpiezas', 'jardineros', 'instaladores solar',
  'diseñadores interiores', 'fotógrafos', 'veterinarios', 'ópticas', 'inmobiliarias',
];

const CITIES_ES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia',
  'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo',
  'Gijón', 'Granada', 'Elche', 'Oviedo', 'Santa Cruz de Tenerife', 'Badalona',
  'Cartagena', 'Hospitalet', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada',
  'Almería', 'Sabadell', 'Leganés', 'Santander', 'Burgos', 'Getafe',
];

// Modificadores para diversificar queries
const MODIFIERS = ['cerca de mí', 'económico', 'urgente', '24 horas', 'profesional', ''];

export const queryGenerator = {
  categories: CATEGORIES,
  cities: CITIES_ES,

  /**
   * Genera una lista de queries para una categoría + ciudad.
   * Con modificadores para encontrar más variantes de resultados.
   */
  generate({ category, city, withModifiers = true }) {
    if (!category || !city) return [];
    const base = [`${category} ${city}`, `${category} en ${city}`];
    if (withModifiers) {
      MODIFIERS.filter(Boolean).forEach(mod => {
        base.push(`${category} ${city} ${mod}`);
      });
    }
    return base;
  },

  /**
   * Genera combinaciones masivas para prospección en batch.
   * Útil para lanzar múltiples sesiones automáticas.
   */
  generateBatch({ categories = CATEGORIES, cities = CITIES_ES, limit = 50 }) {
    const combos = [];
    for (const category of categories) {
      for (const city of cities) {
        combos.push({ query: `${category} ${city}`, city, category });
        if (combos.length >= limit) return combos;
      }
    }
    return combos;
  },
};


// backend/utils/logger.js
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});


// backend/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Faltan variables SUPABASE_URL y SUPABASE_KEY en .env');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: ws }
  }
);
