// Categorías y subcategorías de sectores para prospección
export type Subcategory = {
  name: string;
  includeDefaults: string[];
  excludeDefaults: string[];
};

export type SectorCategory = {
  category: string;
  subcategories: Subcategory[];
};

export const SECTORS: SectorCategory[] = [
  {
    category: '🏠 Servicios para el Hogar',
    subcategories: [
      { name: 'Carpintería', includeDefaults: ['carpintero', 'muebles a medida'], excludeDefaults: ['online', 'curso', 'academia'] },
      { name: 'Pintura', includeDefaults: ['pintor', 'pintura interior'], excludeDefaults: ['online', 'curso', 'academia'] },
      { name: 'Limpieza', includeDefaults: ['limpieza hogar', 'servicio limpieza'], excludeDefaults: ['online', 'académia'] },
      { name: 'Fontanería', includeDefaults: ['fontanero', 'reparación fontanería'], excludeDefaults: ['online', 'curso'] },
      { name: 'Electricidad', includeDefaults: ['electricista', 'instalaciones eléctricas'], excludeDefaults: ['online', 'curso'] },
      { name: 'Jardinería', includeDefaults: ['jardinero', 'diseño jardines'], excludeDefaults: ['online', 'curso', 'academia'] },
      { name: 'Electrodomésticos', includeDefaults: ['reparación electrodomésticos', 'técnico'], excludeDefaults: ['online', 'tutorial'] },
      { name: 'Tapicería', includeDefaults: ['tapicero', 'tapizado muebles'], excludeDefaults: ['online', 'curso'] },
      { name: 'Cristalería', includeDefaults: ['cristalería', 'espejo'], excludeDefaults: ['online'] },
      { name: 'Cerrajería', includeDefaults: ['cerrajero', 'llaves'], excludeDefaults: ['online'] },
    ],
  },
  {
    category: '🏥 Profesionales & Salud',
    subcategories: [
      { name: 'Clínica Dental', includeDefaults: ['dentista', 'odontología'], excludeDefaults: ['online', 'tour virtual'] },
      { name: 'Fisioterapia', includeDefaults: ['fisioterapeuta', 'rehabilitación'], excludeDefaults: ['online', 'tutorial'] },
      { name: 'Psicología', includeDefaults: ['psicólogo', 'psicología clínica'], excludeDefaults: ['online gratis'] },
      { name: 'Veterinaria', includeDefaults: ['veterinario', 'clínica veterinaria'], excludeDefaults: ['online'] },
      { name: 'Médico General', includeDefaults: ['médico', 'consulta médica'], excludeDefaults: ['online'] },
    ],
  },
  {
    category: '⚖️ Abogados',
    subcategories: [
      { name: 'Abogado Familia', includeDefaults: ['abogado familia', 'divorcio', 'custodia'], excludeDefaults: ['accidentes', 'penal', 'laboral'] },
      { name: 'Abogado Penal', includeDefaults: ['abogado penal', 'defensa penal'], excludeDefaults: ['familia', 'accidentes', 'laboral'] },
      { name: 'Abogado Laboral', includeDefaults: ['abogado laboral', 'derecho laboral', 'despido'], excludeDefaults: ['accidentes', 'familia', 'penal'] },
      { name: 'Abogado Accidentes', includeDefaults: ['abogado accidentes', 'tráfico', 'lesiones'], excludeDefaults: ['familia', 'penal', 'laboral'] },
      { name: 'Abogado Inmobiliario', includeDefaults: ['abogado inmobiliario', 'compraventa', 'arrendamiento'], excludeDefaults: ['accidentes', 'penal'] },
      { name: 'Abogado Mercantil', includeDefaults: ['abogado mercantil', 'derecho mercantil', 'contratos'], excludeDefaults: ['familia', 'penal'] },
    ],
  },
  {
    category: '🏢 Negocios, Construcción & Retail',
    subcategories: [
      { name: 'Gestoría Contable', includeDefaults: ['gestor contable', 'asesoría fiscal'], excludeDefaults: ['online', 'tutorial'] },
      { name: 'Reformas Integrales', includeDefaults: ['reformas', 'construcción'], excludeDefaults: ['online'] },
      { name: 'Taller Mecánico', includeDefaults: ['mecánico', 'taller coche'], excludeDefaults: ['online', 'tutorial'] },
      { name: 'Detailing Coches', includeDefaults: ['detailing', 'limpieza coche'], excludeDefaults: ['online'] },
      { name: 'Inmobiliaria', includeDefaults: ['inmobiliaria', 'agencia inmobiliaria'], excludeDefaults: ['online'] },
      { name: 'Barbería', includeDefaults: ['barbero', 'barbería'], excludeDefaults: ['online', 'curso'] },
      { name: 'Fontanería Urgencias', includeDefaults: ['fontanería urgencia', '24 horas'], excludeDefaults: ['online'] },
    ],
  },
  {
    category: '💄 Estética & Belleza',
    subcategories: [
      { name: 'Peluquería', includeDefaults: ['peluquería', 'corte cabello'], excludeDefaults: ['online', 'curso', 'academia'] },
      { name: 'Barbería', includeDefaults: ['barbería', 'arreglo barba'], excludeDefaults: ['online', 'academia'] },
      { name: 'Uñas & Manicura', includeDefaults: ['manicura', 'uñas gel', 'manicure'], excludeDefaults: ['online', 'curso'] },
      { name: 'Micropigmentación', includeDefaults: ['micropigmentación', 'microblading', 'cejas'], excludeDefaults: ['online', 'academia'] },
      { name: 'Estética Facial', includeDefaults: ['estética', 'facial', 'limpieza facial'], excludeDefaults: ['online', 'curso'] },
      { name: 'Depilación Láser', includeDefaults: ['depilación láser', 'depilación definitiva'], excludeDefaults: ['online', 'curso'] },
    ],
  },
  {
    category: '📚 Educación & Formación',
    subcategories: [
      { name: 'Academia Idiomas', includeDefaults: ['academia idiomas', 'clases inglés'], excludeDefaults: ['online', 'gratis', 'recurso'] },
      { name: 'Autoescuela', includeDefaults: ['autoescuela', 'carnet conducir', 'permiso B'], excludeDefaults: ['online', 'teórica online'] },
      { name: 'Clases Particulares', includeDefaults: ['profesor particular', 'apoyo escolar'], excludeDefaults: ['online', 'plataforma'] },
      { name: 'Formación Profesional', includeDefaults: ['FP', 'ciclo formativo', 'formación profesional'], excludeDefaults: ['distancia', 'online'] },
    ],
  },
  {
    category: '🌊 Turismo & Deportes Acuáticos',
    subcategories: [
      { name: 'Alquiler Apartamentos', includeDefaults: ['alquiler apartamento', 'apartamento vacaciones'], excludeDefaults: ['plataforma online'] },
      { name: 'Casas Rurales', includeDefaults: ['casa rural', 'turismo rural'], excludeDefaults: ['plataforma online'] },
      { name: 'Alquiler Turístico', includeDefaults: ['alquiler turístico', 'vacaciones'], excludeDefaults: ['plataforma'] },
      { name: 'Escuela de Surf', includeDefaults: ['escuela surf', 'clases surf'], excludeDefaults: ['online'] },
      { name: 'Alquiler Equipo Acuático', includeDefaults: ['alquiler kayak', 'alquiler tablas'], excludeDefaults: ['online'] },
      { name: 'Surf Shop', includeDefaults: ['tienda surf', 'equipo surf'], excludeDefaults: ['online'] },
    ],
  },
  {
    category: '🍽️ Hostelería & Restauración',
    subcategories: [
      { name: 'Restaurante', includeDefaults: ['restaurante', 'menú del día'], excludeDefaults: ['franquicia', 'cadena', 'solo delivery'] },
      { name: 'Bar & Cafetería', includeDefaults: ['bar', 'cafetería', 'desayunos'], excludeDefaults: ['franquicia', 'chain'] },
      { name: 'Catering', includeDefaults: ['catering', 'catering eventos', 'bodas'], excludeDefaults: ['online', 'industrial'] },
      { name: 'Panadería & Pastelería', includeDefaults: ['panadería', 'pan artesano', 'pastelería'], excludeDefaults: ['franquicia', 'industrial'] },
    ],
  },
  {
    category: '🍴 Referencia',
    subcategories: [
      { name: 'Restaurante', includeDefaults: ['restaurante'], excludeDefaults: [] },
    ],
  },
];
