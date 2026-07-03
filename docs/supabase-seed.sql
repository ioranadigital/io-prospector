-- ============================================
-- PASO 1: CREAR TABLAS
-- ============================================
-- Ejecuta esto PRIMERO en Supabase SQL Editor

CREATE TABLE io_pro_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE io_pro_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES io_pro_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE io_pro_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid NOT NULL REFERENCES io_pro_sectors(id) ON DELETE CASCADE,
  term text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sectors_category ON io_pro_sectors(category_id);
CREATE INDEX idx_terms_sector ON io_pro_terms(sector_id);

-- ============================================
-- PASO 2: SEED DATA - Categorías
-- ============================================

INSERT INTO io_pro_categories (name, sort_order) VALUES
  ('🏠 Servicios para el Hogar', 1),
  ('🏥 Profesionales & Salud', 2),
  ('⚖️ Abogados', 3),
  ('🏢 Negocios, Construcción & Retail', 4),
  ('💄 Estética & Belleza', 5),
  ('📚 Educación & Formación', 6),
  ('🌊 Turismo & Deportes Acuáticos', 7),
  ('🍽️ Hostelería & Restauración', 8);

-- ============================================
-- PASO 3: SEED DATA - Sectores y Términos
-- ============================================
-- Para cada categoría y sus sectores/términos, ejecuta estos inserts

-- 1. 🏠 Servicios para el Hogar (10 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order)
SELECT id, 'Carpintería', 1 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'carpintero' FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'muebles a medida' FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1;

-- Continuar para Pintura, Limpieza, Fontanería, Electricidad, Jardinería, Electrodomésticos, Tapicería, Cristalería, Cerrajería...

-- 2. 🏥 Profesionales & Salud (5 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order)
SELECT id, 'Clínica Dental', 1 FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'dentista' FROM io_pro_sectors WHERE name = 'Clínica Dental' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'odontología' FROM io_pro_sectors WHERE name = 'Clínica Dental' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;

-- Continuar para Fisioterapia, Psicología, Veterinaria, Médico General...

-- 3. ⚖️ Abogados (6 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order)
SELECT id, 'Abogado Familia', 1 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado familia' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'divorcio' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'custodia' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

-- Continuar para Abogado Penal, Laboral, Accidentes, Inmobiliario, Mercantil...

-- ============================================
-- NOTA: El SQL anterior es un inicio
-- Vea el archivo categorias-subcategorias.md
-- para la lista COMPLETA de todos los datos
-- ============================================
