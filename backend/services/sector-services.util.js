// backend/services/sector-services.util.js
// Deriva "missing_service" reutilizando el catálogo de sectores ya existente en
// bbdd/sectores/sectores_GBM_esp.md en vez de mantener un diccionario nuevo.
import fs from 'fs';
import path from 'path';

let _sectorServicesCache = null;

// Parsea bbdd/sectores/sectores_GBM_esp.md una vez y cachea en memoria:
// { "fisioterapia y osteopatía": ["centros de rehabilitación", "suelo pélvico", "fisioterapia deportiva"], ... }
function loadSectorServices() {
  if (_sectorServicesCache) return _sectorServicesCache;
  _sectorServicesCache = {};
  try {
    const filePath = path.join(process.cwd(), 'bbdd', 'sectores', 'sectores_GBM_esp.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const m = line.match(/^\*\s+\*\*(.+?)\*\*:\s*(.+)$/);
      if (!m) continue;
      const [, sector, servicesRaw] = m;
      const services = servicesRaw
        .split(/,|\by\b/)
        .map(s => s.trim().replace(/\.$/, '').toLowerCase())
        .filter(Boolean);
      _sectorServicesCache[sector.toLowerCase()] = services;
    }
  } catch {
    _sectorServicesCache = {};
  }
  return _sectorServicesCache;
}

// Heurística aproximada (no NLP): busca el primer sub-servicio del sector del lead
// que no aparece mencionado en el texto ya disponible (snippet SERP + HTML de la web).
// Objetivo: un gancho de venta plausible, no una auditoría exhaustiva.
export function pickMissingService(category, text) {
  if (!category || !text) return null;
  const dict = loadSectorServices();
  const categoryLower = category.toLowerCase();
  const key = Object.keys(dict).find(k => k.includes(categoryLower) || categoryLower.includes(k));
  if (!key) return null;

  const haystack = text.toLowerCase();
  const missing = dict[key].find(service => !haystack.includes(service));
  return missing || null;
}

export default { pickMissingService };
