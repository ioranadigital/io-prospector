#!/usr/bin/env node
// backend/scripts/scraper-cli.js
// CLI para ejecutar scraping directamente
// Uso: node scraper-cli.js --query "plomería" --city "Madrid" --pages-from 2 --pages-to 3

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { startProspectionV2 } from '../services/prospector-v2.service.js';
import { logger } from '../utils/logger.js';

// Parse argumentos
const args = process.argv.slice(2);
const params = {
  query: getArg('--query') || getArg('-q'),
  city: getArg('--city') || getArg('-c'),
  category: getArg('--category') || getArg('--sector') || '',
  pagesFrom: parseInt(getArg('--pages-from') || '2'),
  pagesTo: parseInt(getArg('--pages-to') || '3'),
};

function getArg(flag) {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
}

// Validar entrada
if (!params.query || !params.city) {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       🔍 SCRAPER CLI — Prospección Local de SEO            ║
╚════════════════════════════════════════════════════════════╝

Uso:
  node scraper-cli.js --query "servicio" --city "ciudad" [opciones]

Argumentos obligatorios:
  --query, -q        Palabra clave de búsqueda (ej: "fontanería")
  --city, -c         Ciudad (ej: "Madrid")

Argumentos opcionales:
  --category         Categoría/sector (ej: "fontanería residencial")
  --pages-from       Página inicial (default: 2)
  --pages-to         Página final (default: 3)

Ejemplos:
  node scraper-cli.js --query "fontanería" --city "Madrid"
  node scraper-cli.js -q "dentista" -c "Barcelona" --pages-from 2 --pages-to 4
  node scraper-cli.js --query "electricista" --city "Valencia" --category "eléctrica residencial"

Output:
  Se generará un CSV en: E:\\Prospector-Data\\YYYY-MM-DD\\

  `);
  process.exit(1);
}

// Validar SerpAPI key
if (!process.env.SERP_API_KEY || process.env.SERP_API_KEY === 'your-serp-api-key-here') {
  console.error('❌ Error: SERP_API_KEY no configurada en .env');
  console.error('   Ve a https://serpapi.com y obtén tu API key');
  process.exit(1);
}

// Ejecutar
console.log(`
╔════════════════════════════════════════════════════════════╗
║                     🚀 INICIANDO SCRAPER                  ║
╚════════════════════════════════════════════════════════════╝

📍 Query: "${params.query}"
📍 City: "${params.city}"
${params.category ? `📍 Category: "${params.category}"\n` : ''}
📄 Páginas: ${params.pagesFrom} → ${params.pagesTo}
⏱️  Por favor espera...

`);

startProspectionV2(params)
  .then(result => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                  ✅ SCRAPING COMPLETADO                   ║
╚════════════════════════════════════════════════════════════╝

📊 Resultados:
  📈 Total leads encontrados: ${result.leadsFound}
  📄 Archivo CSV: ${result.csvFilename}
  📍 Ubicación: ${result.csvPath}

🔧 Próximos pasos:
  1. Abre el CSV en Excel: ${result.csvPath}
  2. Procesa con orquestador:
     node scripts/orchestrator.js "${result.csvPath}"
  3. Abre el Dashboard generado

💡 Nota: Si algunos datos (GMB rating, reviews) están vacíos,
   es porque el scraping automático no pudo acceder a Google Maps.
   Puedes completarlos manualmente en Excel.

    `);
    process.exit(0);
  })
  .catch(error => {
    console.error(`
❌ ERROR: ${error.message}

Troubleshooting:
  • ¿API key válida? (SERP_API_KEY en .env)
  • ¿Conexión a internet?
  • ¿Playwright instalado? (npm install)
  • ¿Límite de SerpAPI alcanzado? (100 búsquedas/mes gratis)

    `);
    process.exit(1);
  });
