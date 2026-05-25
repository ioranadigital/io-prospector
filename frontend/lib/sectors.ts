// Categorías y subcategorías de sectores para prospección
export const SECTORS = [
  {
    category: '🏠 Servicios para el Hogar',
    subcategories: [
      'Carpintería',
      'Pintura',
      'Limpieza',
      'Fontanería',
      'Electricidad',
      'Jardinería',
      'Electrodomésticos',
      'Tapicería',
      'Cristalería',
      'Cerrajería',
    ],
  },
  {
    category: '🏥 Profesionales & Salud',
    subcategories: [
      'Clínica Dental',
      'Fisioterapia',
      'Psicología',
      'Veterinaria',
      'Abogado Accidentes',
    ],
  },
  {
    category: '🏢 Negocios, Construcción & Retail',
    subcategories: [
      'Gestoría Contable',
      'Reformas Integrales',
      'Taller Mecánico',
      'Detailing Coches',
      'Inmobiliaria',
      'Barbería',
      'Fontanería Urgencias',
    ],
  },
  {
    category: '🌊 Turismo & Deportes Acuáticos',
    subcategories: [
      'Alquiler Apartamentos',
      'Casas Rurales',
      'Alquiler Turístico',
      'Escuela de Surf',
      'Alquiler Equipo Acuático',
      'Surf Shop',
    ],
  },
  {
    category: '🍴 Referencia',
    subcategories: ['Restaurante'],
  },
];

export type SectorCategory = (typeof SECTORS)[0];
export type SectorSubcategory = string;
