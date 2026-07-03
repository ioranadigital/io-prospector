// backend/services/csv-export.service.js
// Exporta leads a CSV local

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { paths } from '../config/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = paths.prospectorDataDir;

export const csvExportService = {
  async saveLeadsToCSV(leads, searchMetadata = {}) {
    // Crear directorio si no existe
    const dateFolder = new Date().toISOString().split('T')[0];
    const folderPath = path.join(DATA_DIR, dateFolder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Nombre del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `leads-${searchMetadata.query || 'search'}-${timestamp}.csv`;
    const filePath = path.join(folderPath, filename);

    // Cabeceras CSV (en el orden correcto para el orquestador)
    const headers = [
      'Company_Name',
      'First_Name',
      'Email',
      'Website',
      'Phone',
      'GMB_Rating',
      'Review_Count',
      'GMB_Claimed',
      'Has_Website',
      'SSL_Active',
      'Load_Time_Ms',
      'Is_Mobile_Responsive',
      'Has_Schema',
      'Broken_Links_Count',
      'Photo_Count',
      'GMB_Description',
      'GMB_Has_Hours',
      'GMB_Hours_Updated',
      'Main_Competitor',
      'Missing_Service',
      'Icebreaker',
      'SEO_Gap',
    ];

    // Convertir leads a CSV
    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
      const row = [
        escapeCSV(lead.company_name || ''),
        escapeCSV(lead.first_name || 'propietario'),
        escapeCSV(lead.email || ''),
        escapeCSV(lead.website || ''),
        escapeCSV(lead.phone || ''),
        lead.gmb_rating !== null ? lead.gmb_rating : '',
        lead.review_count !== null ? lead.review_count : '',
        lead.gmb_claimed ? 'Sí' : (lead.gmb_claimed === false ? 'No' : ''),
        lead.has_website ? 'Sí' : 'No',
        lead.ssl_active ? 'Sí' : 'No',
        lead.load_time_ms || '',
        lead.is_mobile_responsive ? 'Sí' : 'No',
        lead.has_schema ? 'Sí' : 'No',
        lead.broken_links_count || '',
        lead.photo_count || '',
        escapeCSV(lead.gmb_description || ''),
        lead.gmb_has_hours ? 'Sí' : 'No',
        lead.gmb_hours_updated ? 'Sí' : 'No',
        escapeCSV(lead.main_competitor || ''),
        escapeCSV(lead.missing_service || ''),
        escapeCSV(lead.icebreaker || ''),
        escapeCSV(lead.seo_gap || ''),
      ];

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf8');

    return {
      path: filePath,
      url: `file:///${filePath.replace(/\\/g, '/')}`,
      count: leads.length,
      filename,
    };
  },

  async readCSVFromPath(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      return [];
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim());

    // Normalize header names to snake_case for consistency
    const headerMap = {
      'Company_Name': 'company_name',
      'First_Name': 'first_name',
      'Email': 'email',
      'Website': 'website',
      'Phone': 'phone',
      'GMB_Rating': 'gmb_rating',
      'Review_Count': 'review_count',
      'GMB_Claimed': 'gmb_claimed',
      'Has_Website': 'has_website',
      'SSL_Active': 'ssl_active',
      'Load_Time_Ms': 'load_time_ms',
      'Is_Mobile_Responsive': 'is_mobile_responsive',
      'Has_Schema': 'has_schema',
      'Broken_Links_Count': 'broken_links_count',
      'Photo_Count': 'photo_count',
      'GMB_Description': 'gmb_description',
      'GMB_Has_Hours': 'gmb_has_hours',
      'GMB_Hours_Updated': 'gmb_hours_updated',
      'Main_Competitor': 'main_competitor',
      'Missing_Service': 'missing_service',
      'Icebreaker': 'icebreaker',
      'SEO_Gap': 'seo_gap',
    };

    const leads = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const lead = {};
      headers.forEach((header, i) => {
        const key = headerMap[header] || header.toLowerCase();
        const value = (values[i] || '').trim();
        // Convert string booleans
        if (value === 'Sí') lead[key] = true;
        else if (value === 'No') lead[key] = false;
        else if (value === '') lead[key] = value;
        else if (!isNaN(value) && value !== '') lead[key] = parseFloat(value);
        else lead[key] = value;
      });
      return lead;
    });

    return leads;
  },
};

function escapeCSV(value) {
  if (!value) return '""';
  value = String(value).replace(/"/g, '""');
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value}"`;
  }
  return value;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export default csvExportService;
