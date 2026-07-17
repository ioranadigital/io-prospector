// Resuelve a qué categoría principal (Sector) pertenece la subcategoría
// guardada en io_pro_leads.category — usado para poder filtrar/agrupar leads
// por sector amplio en vez de por cada subcategoría suelta.
import { SECTORS } from './sectors';

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const SUBCAT_TO_SECTOR = (() => {
  const m = new Map<string, { sector: string; subName: string }>();
  SECTORS.forEach(c => c.subcategories.forEach(s => m.set(norm(s.name), { sector: c.category, subName: s.name })));
  return m;
})();

export const OTHER_SECTOR = 'Otros / personalizadas';

export function resolveSector(category: string | null | undefined): { sector: string; subName: string } {
  const info = SUBCAT_TO_SECTOR.get(norm(category || ''));
  return info || { sector: OTHER_SECTOR, subName: category || 'Sin clasificar' };
}

export function getAllSectorNames(): string[] {
  return SECTORS.map(c => c.category);
}
