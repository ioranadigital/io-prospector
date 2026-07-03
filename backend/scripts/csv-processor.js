// backend/scripts/csv-processor.js
// Lee un CSV de prospección y lo normaliza a un objeto JSON
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

export async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    const stream = createReadStream(filePath);

    stream
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (record) => {
        records.push(normalizeRecord(record));
      })
      .on('error', reject)
      .on('end', () => resolve(records));
  });
}

function normalizeRecord(raw) {
  return {
    // Datos básicos
    company_name: (raw.Company_Name || '').trim(),
    first_name: (raw.First_Name || 'propietario').trim(),
    email: (raw.Email || '').toLowerCase().trim(),
    website: (raw.Website || '').trim().toLowerCase(),
    phone: (raw.Phone || '').trim(),

    // Calificación
    gmb_rating: parseFloat(raw.GMB_Rating) || 0,
    review_count: parseInt(raw.Review_Count) || 0,
    gmb_claimed: raw.GMB_Claimed?.toLowerCase() === 'sí' || raw.GMB_Claimed === 'true',
    has_website: raw.Has_Website?.toLowerCase() === 'sí' || raw.Has_Website === 'true',
    ssl_active: raw.SSL_Active?.toLowerCase() === 'sí' || raw.SSL_Active === 'true',

    // Personalización
    main_competitor: (raw.Main_Competitor || '').trim(),
    missing_service: (raw.Missing_Service || '').trim(),
    icebreaker: (raw.Icebreaker || '').trim(),
    seo_gap: (raw.SEO_Gap || '').trim(),
  };
}

// CLI para pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Uso: node csv-processor.js <ruta-csv>');
    process.exit(1);
  }
  processCSV(csvPath).then(data => {
    console.log(JSON.stringify(data, null, 2));
  }).catch(console.error);
}

export default { processCSV };
