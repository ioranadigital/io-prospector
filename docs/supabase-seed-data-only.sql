-- ============================================
-- SOLO DATOS: Sin CREATE TABLE
-- Para usar si las tablas ya existen
-- ============================================

-- Limpiar datos existentes (opcional - descomenta si quieres borrar todo primero)
-- DELETE FROM io_pro_terms;
-- DELETE FROM io_pro_sectors;
-- DELETE FROM io_pro_categories;

-- ============================================
-- INSERTAR 8 CATEGORÍAS
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
-- INSERTAR SECTORES Y TÉRMINOS
-- ============================================

-- 1. 🏠 Servicios para el Hogar (10 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Carpintería', 1 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'carpintero' FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'muebles a medida' FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'carpintería metálica' FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Pintura', 2 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'pintor' FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'decoración' FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Limpieza', 3 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'limpieza' FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'limpieza profunda' FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Fontanería', 4 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'fontanero' FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'tuberías' FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Electricidad', 5 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'electricista' FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'instalaciones eléctricas' FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Jardinería', 6 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'jardinero' FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'paisajismo' FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Electrodomésticos', 7 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'reparación electrodomésticos' FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Tapicería', 8 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'tapicero' FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Cristalería', 9 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'cristalero' FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Cerrajería', 10 FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'cerrajero' FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar') LIMIT 1;

-- 2. 🏥 Profesionales & Salud (5 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Clínica Dental', 1 FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'dentista' FROM io_pro_sectors WHERE name = 'Clínica Dental' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'odontología' FROM io_pro_sectors WHERE name = 'Clínica Dental' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Fisioterapia', 2 FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'fisioterapeuta' FROM io_pro_sectors WHERE name = 'Fisioterapia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Psicología', 3 FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'psicólogo' FROM io_pro_sectors WHERE name = 'Psicología' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Veterinaria', 4 FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'veterinario' FROM io_pro_sectors WHERE name = 'Veterinaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Médico General', 5 FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'médico' FROM io_pro_sectors WHERE name = 'Médico General' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud') LIMIT 1;

-- 3. ⚖️ Abogados (6 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Abogado Familia', 1 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado familia' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'divorcio' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'custodia' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Abogado Penal', 2 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado penal' FROM io_pro_sectors WHERE name = 'Abogado Penal' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'defensa penal' FROM io_pro_sectors WHERE name = 'Abogado Penal' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Abogado Laboral', 3 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado laboral' FROM io_pro_sectors WHERE name = 'Abogado Laboral' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'derecho laboral' FROM io_pro_sectors WHERE name = 'Abogado Laboral' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Abogado Accidentes', 4 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado accidentes' FROM io_pro_sectors WHERE name = 'Abogado Accidentes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'responsabilidad civil' FROM io_pro_sectors WHERE name = 'Abogado Accidentes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Abogado Inmobiliario', 5 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado inmobiliario' FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'compra venta inmuebles' FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Abogado Mercantil', 6 FROM io_pro_categories WHERE name = '⚖️ Abogados';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'abogado mercantil' FROM io_pro_sectors WHERE name = 'Abogado Mercantil' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'derecho empresarial' FROM io_pro_sectors WHERE name = 'Abogado Mercantil' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados') LIMIT 1;

-- 4. 🏢 Negocios, Construcción & Retail (8 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Contable', 1 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'contable' FROM io_pro_sectors WHERE name = 'Contable' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'asesor fiscal' FROM io_pro_sectors WHERE name = 'Contable' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Consultoría Empresarial', 2 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'consultor empresarial' FROM io_pro_sectors WHERE name = 'Consultoría Empresarial' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Construcción', 3 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'constructor' FROM io_pro_sectors WHERE name = 'Construcción' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'obra' FROM io_pro_sectors WHERE name = 'Construcción' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Reforma y Rehabilitación', 4 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'reforma' FROM io_pro_sectors WHERE name = 'Reforma y Rehabilitación' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Inmobiliaria', 5 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'inmobiliaria' FROM io_pro_sectors WHERE name = 'Inmobiliaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'agente inmobiliario' FROM io_pro_sectors WHERE name = 'Inmobiliaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Retail y Comercio', 6 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'tienda' FROM io_pro_sectors WHERE name = 'Retail y Comercio' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Publicidad y Marketing', 7 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'agencia publicidad' FROM io_pro_sectors WHERE name = 'Publicidad y Marketing' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Informática y Tecnología', 8 FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'consultor informático' FROM io_pro_sectors WHERE name = 'Informática y Tecnología' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail') LIMIT 1;

-- 5. 💄 Estética & Belleza (5 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Peluquería', 1 FROM io_pro_categories WHERE name = '💄 Estética & Belleza';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'peluquería' FROM io_pro_sectors WHERE name = 'Peluquería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'peluquero' FROM io_pro_sectors WHERE name = 'Peluquería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Centro Estético', 2 FROM io_pro_categories WHERE name = '💄 Estética & Belleza';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'esteticien' FROM io_pro_sectors WHERE name = 'Centro Estético' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Masaje', 3 FROM io_pro_categories WHERE name = '💄 Estética & Belleza';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'masajista' FROM io_pro_sectors WHERE name = 'Masaje' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Podología', 4 FROM io_pro_categories WHERE name = '💄 Estética & Belleza';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'podólogo' FROM io_pro_sectors WHERE name = 'Podología' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Óptica', 5 FROM io_pro_categories WHERE name = '💄 Estética & Belleza';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'óptica' FROM io_pro_sectors WHERE name = 'Óptica' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza') LIMIT 1;

-- 6. 📚 Educación & Formación (6 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Escuela Primaria', 1 FROM io_pro_categories WHERE name = '📚 Educación & Formación';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'primaria' FROM io_pro_sectors WHERE name = 'Escuela Primaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Instituto Secundaria', 2 FROM io_pro_categories WHERE name = '📚 Educación & Formación';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'secundaria' FROM io_pro_sectors WHERE name = 'Instituto Secundaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Universidad', 3 FROM io_pro_categories WHERE name = '📚 Educación & Formación';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'universidad' FROM io_pro_sectors WHERE name = 'Universidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Academia de Idiomas', 4 FROM io_pro_categories WHERE name = '📚 Educación & Formación';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'academia idiomas' FROM io_pro_sectors WHERE name = 'Academia de Idiomas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Clases Particulares', 5 FROM io_pro_categories WHERE name = '📚 Educación & Formación';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'profesor particular' FROM io_pro_sectors WHERE name = 'Clases Particulares' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Formación Profesional', 6 FROM io_pro_categories WHERE name = '📚 Educación & Formación';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'formación profesional' FROM io_pro_sectors WHERE name = 'Formación Profesional' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación') LIMIT 1;

-- 7. 🌊 Turismo & Deportes Acuáticos (6 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Agencia de Viajes', 1 FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'agencia viajes' FROM io_pro_sectors WHERE name = 'Agencia de Viajes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Hotel', 2 FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'hotel' FROM io_pro_sectors WHERE name = 'Hotel' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Camping', 3 FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'camping' FROM io_pro_sectors WHERE name = 'Camping' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Surf y Deporte Acuático', 4 FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'surf' FROM io_pro_sectors WHERE name = 'Surf y Deporte Acuático' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'buceo' FROM io_pro_sectors WHERE name = 'Surf y Deporte Acuático' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Gimnasio', 5 FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'gimnasio' FROM io_pro_sectors WHERE name = 'Gimnasio' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Piscina', 6 FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'piscina' FROM io_pro_sectors WHERE name = 'Piscina' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos') LIMIT 1;

-- 8. 🍽️ Hostelería & Restauración (5 sectores)
INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Restaurante', 1 FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'restaurante' FROM io_pro_sectors WHERE name = 'Restaurante' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración') LIMIT 1;
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'chef' FROM io_pro_sectors WHERE name = 'Restaurante' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Cafetería', 2 FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'cafetería' FROM io_pro_sectors WHERE name = 'Cafetería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Bar', 3 FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'bar' FROM io_pro_sectors WHERE name = 'Bar' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Pastelería', 4 FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'pastelería' FROM io_pro_sectors WHERE name = 'Pastelería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración') LIMIT 1;

INSERT INTO io_pro_sectors (category_id, name, sort_order) SELECT id, 'Catering', 5 FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración';
INSERT INTO io_pro_terms (sector_id, term) SELECT id, 'catering' FROM io_pro_sectors WHERE name = 'Catering' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración') LIMIT 1;

-- ============================================
-- FIN: Datos insertados correctamente
-- ============================================
